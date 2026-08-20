-- ============================================================
-- 大椿助老 · 用户认证与答题记录 Schema
-- 在 Supabase SQL Editor 中整段执行一次即可
-- ============================================================

-- 扩展：gen_random_uuid() / pgcrypto
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- 1. 用户表 dachun_users
-- ------------------------------------------------------------
create table if not exists public.dachun_users (
  id            uuid primary key default gen_random_uuid(),
  phone         varchar(20) unique not null,
  password_hash varchar(255) not null,
  nickname      varchar(50) not null,
  avatar_url    varchar(500),
  total_score   integer not null default 0,
  rank_title    varchar(20) not null default '学童',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint dachun_users_phone_format check (phone ~ '^1[3-9][0-9]{9}$')
);

comment on table public.dachun_users is '大椿助老 C 端用户（手机号注册）';

create index if not exists idx_dachun_users_phone on public.dachun_users(phone);

-- ------------------------------------------------------------
-- 2. 答题记录表 dachun_user_answers
-- ------------------------------------------------------------
create table if not exists public.dachun_user_answers (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.dachun_users(id) on delete cascade,
  question_id      bigint not null,
  selected_answer  varchar(8) not null,
  is_correct       boolean not null,
  score_earned     integer not null default 0,
  answered_at      timestamptz not null default now()
);

create index if not exists idx_dachun_user_answers_user_id
  on public.dachun_user_answers(user_id);
create index if not exists idx_dachun_user_answers_user_time
  on public.dachun_user_answers(user_id, answered_at desc);
create index if not exists idx_dachun_user_answers_question
  on public.dachun_user_answers(question_id);

-- ------------------------------------------------------------
-- 3. updated_at 自动更新触发器
-- ------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_dachun_users_updated on public.dachun_users;
create trigger trg_dachun_users_updated
  before update on public.dachun_users
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- 4. 段位计算函数（按总分返回段位名称）
-- 学童0 / 书生50 / 秀才150 / 举人400 / 进士800 / 状元1500
-- ------------------------------------------------------------
create or replace function public.calc_rank_title(score integer)
returns varchar
language sql
immutable
as $$
  select case
    when score >= 1500 then '状元'
    when score >= 800  then '进士'
    when score >= 400  then '举人'
    when score >= 150  then '秀才'
    when score >= 50   then '书生'
    else '学童'
  end::varchar;
$$;

-- ------------------------------------------------------------
-- 5. 行级安全（RLS）
--    表本身默认拒绝所有匿名访问；
--    应用层 API 先校验自签 token，拿到 user_id 后通过
--    set_config('app.user_id', ..., true) 注入；
--    SECURITY DEFINER 函数不受 RLS 限制，但会自己做身份校验。
-- ------------------------------------------------------------
alter table public.dachun_users enable row level security;
alter table public.dachun_user_answers enable row level security;

-- 直连策略：app.user_id 匹配时才允许 SELECT / UPDATE
drop policy if exists dachun_users_self_select on public.dachun_users;
create policy dachun_users_self_select on public.dachun_users
  for select using (id::text = current_setting('app.user_id', true));

drop policy if exists dachun_users_self_update on public.dachun_users;
create policy dachun_users_self_update on public.dachun_users
  for update using (id::text = current_setting('app.user_id', true));

drop policy if exists dachun_user_answers_self_select on public.dachun_user_answers;
create policy dachun_user_answers_self_select on public.dachun_user_answers
  for select using (user_id::text = current_setting('app.user_id', true));

drop policy if exists dachun_user_answers_self_insert on public.dachun_user_answers;
create policy dachun_user_answers_self_insert on public.dachun_user_answers
  for insert with check (user_id::text = current_setting('app.user_id', true));

-- ------------------------------------------------------------
-- 6. SECURITY DEFINER 函数
--    这些函数在 anon key 下可被 RPC 调用，密码校验/比对在数据库内完成，
--    不向客户端泄露 password_hash。
-- ------------------------------------------------------------

-- 6.1 按手机号查找用户（登录用，返回 id + password_hash）
create or replace function public.find_user_by_phone(p_phone varchar)
returns table (
  id uuid,
  phone varchar,
  password_hash varchar,
  nickname varchar,
  avatar_url varchar,
  total_score integer,
  rank_title varchar
)
language sql
security definer
set search_path = public
as $$
  select u.id, u.phone, u.password_hash, u.nickname,
         u.avatar_url, u.total_score, u.rank_title
  from public.dachun_users u
  where u.phone = p_phone
  limit 1;
$$;

-- 6.2 创建用户（注册用）
create or replace function public.create_user(
  p_phone         varchar,
  p_password_hash varchar,
  p_nickname      varchar
)
returns table (
  id uuid,
  phone varchar,
  nickname varchar,
  avatar_url varchar,
  total_score integer,
  rank_title varchar,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  -- 手机号重复会抛 unique_violation，调用方需捕获 23505
  return query
  insert into public.dachun_users as u (phone, password_hash, nickname)
  values (p_phone, p_password_hash, p_nickname)
  returning u.id, u.phone, u.nickname, u.avatar_url,
            u.total_score, u.rank_title, u.created_at;
end;
$$;

-- 6.3 更新密码
create or replace function public.update_user_password(
  p_user_id       uuid,
  p_password_hash varchar
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.dachun_users
     set password_hash = p_password_hash
   where id = p_user_id;
end;
$$;

-- 6.4 提交一组答题结果，原子累加积分并更新段位
--     p_answers 是 jsonb，形如：
--     [{"question_id":123,"selected_answer":"A","is_correct":true,"score_earned":10}, ...]
create or replace function public.submit_answers(
  p_user_id uuid,
  p_answers jsonb
)
returns table (
  round_correct integer,
  round_total   integer,
  round_score   integer,
  total_score   integer,
  rank_title    varchar
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_round_correct integer := 0;
  v_round_total   integer := 0;
  v_round_score   integer := 0;
  v_total         integer;
  v_rank          varchar;
  rec             record;
begin
  if p_answers is null or jsonb_array_length(p_answers) = 0 then
    raise exception '答案不能为空';
  end if;

  for rec in select * from jsonb_to_recordset(p_answers) as x(
    question_id bigint,
    selected_answer varchar,
    is_correct boolean,
    score_earned integer
  )
  loop
    insert into public.dachun_user_answers(
      user_id, question_id, selected_answer, is_correct, score_earned
    ) values (
      p_user_id,
      rec.question_id,
      coalesce(rec.selected_answer, ''),
      coalesce(rec.is_correct, false),
      coalesce(rec.score_earned, 0)
    );

    v_round_total := v_round_total + 1;
    if coalesce(rec.is_correct, false) then
      v_round_correct := v_round_correct + 1;
    end if;
    v_round_score := v_round_score + coalesce(rec.score_earned, 0);
  end loop;

  update public.dachun_users
     set total_score = total_score + v_round_score
   where id = p_user_id
  returning public.dachun_users.total_score into v_total;

  v_rank := public.calc_rank_title(v_total);
  update public.dachun_users set rank_title = v_rank where id = p_user_id;

  round_correct := v_round_correct;
  round_total   := v_round_total;
  round_score   := v_round_score;
  total_score   := v_total;
  rank_title    := v_rank;
  return next;
end;
$$;

-- 6.5 查询当前用户的答题统计（累计正确数/总题数）
create or replace function public.get_user_stats(p_user_id uuid)
returns table (
  total_answered bigint,
  total_correct  bigint,
  total_score    integer,
  rank_title     varchar
)
language sql
security definer
set search_path = public
as $$
  with s as (
    select count(*)::bigint as total_answered,
           count(*) filter (where is_correct)::bigint as total_correct
      from public.dachun_user_answers where user_id = p_user_id
  )
  select s.total_answered,
         s.total_correct,
         u.total_score,
         u.rank_title
    from s cross join public.dachun_users u
   where u.id = p_user_id;
$$;

-- ============================================================
-- 完成。执行成功后，应用端通过 supabase.rpc('xxx', params) 调用。
-- ============================================================
