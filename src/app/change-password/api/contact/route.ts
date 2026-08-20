import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_SHEET_TOKEN = "Y36MsGPQyhcqj4tD9jQcgRJpnkc";

const HEADER_ROW = [
  "时间",
  "称呼",
  "联系电话",
  "长辈所在社区/小区",
  "希望了解的服务",
];

type ContactPayload = {
  name?: string;
  phone?: string;
  community?: string;
  need?: string;
};

/**
 * 简易内存 token 缓存（避免每次提交都向飞书换 token）。
 * Serverless 实例内生效，冷启动会重新获取，不影响正确性。
 */
let cachedToken: { token: string; expireAt: number } | null = null;

async function getTenantAccessToken(): Promise<string> {
  const appId = process.env.FEISHU_APP_ID;
  const appSecret = process.env.FEISHU_APP_SECRET;

  if (!appId || !appSecret) {
    throw new Error("MISSING_CREDENTIALS");
  }

  if (cachedToken && Date.now() < cachedToken.expireAt - 60_000) {
    return cachedToken.token;
  }

  const resp = await fetch(
    "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal",
    {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ app_id: appId, app_secret: appSecret }),
    }
  );
  const data = (await resp.json()) as {
    code?: number;
    msg?: string;
    tenant_access_token?: string;
    expire?: number;
  };

  if (data.code !== 0 || !data.tenant_access_token) {
    throw new Error(
      `FEISHU_AUTH_FAILED:${data.code ?? "unknown"}:${data.msg ?? ""}`
    );
  }

  cachedToken = {
    token: data.tenant_access_token,
    expireAt: Date.now() + (data.expire ?? 7200) * 1000,
  };
  return cachedToken.token;
}

async function getFirstSheetId(
  token: string,
  sheetToken: string
): Promise<string> {
  const url = `https://open.feishu.cn/open-apis/sheets/v3/spreadsheets/${sheetToken}/sheets/query`;
  const resp = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = (await resp.json()) as {
    code?: number;
    msg?: string;
    data?: {
      sheets?: Array<{
        sheet_id: string;
        title?: string;
        index?: number;
      }>;
    };
  };

  if (data.code !== 0 || !data.data?.sheets?.length) {
    throw new Error(
      `FEISHU_SHEET_QUERY_FAILED:${data.code ?? "unknown"}:${data.msg ?? ""}`
    );
  }

  const sorted = [...data.data.sheets].sort(
    (a, b) => (a.index ?? 0) - (b.index ?? 0)
  );
  return sorted[0].sheet_id;
}

async function readFirstRow(
  token: string,
  sheetToken: string,
  sheetId: string
): Promise<string[]> {
  const range = `${sheetId}!A1:E1`;
  const url = `https://open.feishu.cn/open-apis/sheets/v2/spreadsheets/${sheetToken}/values/${encodeURIComponent(
    range
  )}`;
  const resp = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = (await resp.json()) as {
    code?: number;
    data?: { valueRange?: { values?: unknown[][] } };
  };
  if (data.code !== 0) return [];
  const row = data.data?.valueRange?.values?.[0];
  if (!Array.isArray(row)) return [];
  return row.map((cell) => (cell == null ? "" : String(cell)));
}

async function appendRows(
  token: string,
  sheetToken: string,
  sheetId: string,
  values: string[][]
): Promise<void> {
  const url = `https://open.feishu.cn/open-apis/sheets/v2/spreadsheets/${sheetToken}/values_append`;
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({
      valueRange: {
        range: `${sheetId}!A:E`,
        values,
      },
    }),
  });
  const data = (await resp.json()) as { code?: number; msg?: string };
  if (data.code !== 0) {
    throw new Error(
      `FEISHU_APPEND_FAILED:${data.code ?? "unknown"}:${data.msg ?? ""}`
    );
  }
}

function buildRow(payload: ContactPayload): string[] {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const time = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
    now.getDate()
  )} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  return [
    time,
    (payload.name ?? "").trim(),
    (payload.phone ?? "").trim(),
    (payload.community ?? "").trim(),
    (payload.need ?? "").trim(),
  ];
}

export async function POST(req: NextRequest) {
  let payload: ContactPayload;
  try {
    payload = (await req.json()) as ContactPayload;
  } catch {
    return NextResponse.json(
      { ok: false, error: "请求体不是合法 JSON" },
      { status: 400 }
    );
  }

  const name = (payload.name ?? "").trim();
  const phone = (payload.phone ?? "").trim();

  if (!name || !phone) {
    return NextResponse.json(
      { ok: false, error: "请填写称呼和联系电话" },
      { status: 400 }
    );
  }

  if (!/^[0-9\-+\s]{7,20}$/.test(phone)) {
    return NextResponse.json(
      { ok: false, error: "联系电话格式不正确" },
      { status: 400 }
    );
  }

  const sheetToken =
    process.env.FEISHU_SHEET_TOKEN?.trim() || DEFAULT_SHEET_TOKEN;

  try {
    const token = await getTenantAccessToken();
    const sheetId = await getFirstSheetId(token, sheetToken);

    const firstRow = await readFirstRow(token, sheetToken, sheetId);
    // 只要第 1 行第 1 列已有内容（通常为"时间/提交时间"等表头），就视为已存在表头，
    // 只追加数据；不再重复写入表头。
    const hasHeader = firstRow.length > 0 && firstRow[0].trim().length > 0;

    const row = buildRow(payload);
    const values = hasHeader ? [row] : [HEADER_ROW, row];

    await appendRows(token, sheetToken, sheetId, values);

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    if (message === "MISSING_CREDENTIALS") {
      return NextResponse.json(
        {
          ok: false,
          error:
            "服务器尚未配置飞书应用凭证（FEISHU_APP_ID / FEISHU_APP_SECRET），请联系管理员配置后再试。",
        },
        { status: 503 }
      );
    }

    console.error("[contact] 写入飞书失败：", message);
    return NextResponse.json(
      { ok: false, error: "提交失败，请稍后再试或直接拨打热线电话。" },
      { status: 502 }
    );
  }
}
