'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { RequireAuth } from '@/components/auth/require-auth';
import { YuerSidebar, type YuerTabKey } from '@/components/knowledge/yuer-sidebar';
import { YuerIntroPanel } from '@/components/knowledge/yuer-intro';
import { YuerQuizPanel } from '@/components/knowledge/yuer-quiz';
import { YuerBrowsePanel } from '@/components/knowledge/yuer-browse';

function YuerInner() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as YuerTabKey) || 'intro';
  const initialCategory = searchParams.get('category') ?? undefined;

  const [tab, setTab] = useState<YuerTabKey>(
    initialTab === 'quiz' || initialTab === 'browse' ? initialTab : 'intro',
  );
  const [quizCategory, setQuizCategory] = useState<string | undefined>(undefined);
  const [browseKey, setBrowseKey] = useState(0);
  const [browseCategory, setBrowseCategory] = useState<string | undefined>(
    initialCategory,
  );

  const handleStartQuiz = (category?: string) => {
    setQuizCategory(category);
    setTab('quiz');
  };

  const handleBrowse = (category?: string) => {
    setBrowseKey((k) => k + 1);
    setBrowseCategory(category);
    setTab('browse');
  };

  return (
    <div className="mx-auto flex w-full max-w-[1200px] gap-6 px-4 pb-16 pt-24 md:pt-28">
      <YuerSidebar active={tab} onSelect={setTab} />
      <div className="min-w-0 flex-1">
        {tab === 'intro' && (
          <YuerIntroPanel
            onStartQuiz={() => setTab('quiz')}
            onBrowse={(cat) => handleBrowse(cat)}
          />
        )}
        {tab === 'quiz' && (
          <YuerQuizPanel
            key={quizCategory ?? 'all'}
            category={quizCategory}
            embedded
            onBrowse={() => handleBrowse()}
          />
        )}
        {tab === 'browse' && (
          <YuerBrowsePanel
            key={browseKey}
            initialCategory={browseCategory}
            onStartQuiz={handleStartQuiz}
          />
        )}
      </div>
    </div>
  );
}

export default function YuerPage() {
  return (
    <RequireAuth>
      <Suspense
        fallback={
          <div className="flex min-h-[60vh] items-center justify-center text-primary-dark">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        }
      >
        <YuerInner />
      </Suspense>
    </RequireAuth>
  );
}
