'use client';

export function ConversationSkeleton({ darkMode }: { darkMode: boolean }) {
  const base = darkMode ? 'bg-slate-700 animate-shimmer-dark' : 'bg-slate-200 animate-shimmer';
  return (
    <div className={`flex items-center gap-3 px-4 py-3.5 ${darkMode ? 'bg-slate-900' : 'bg-white'}`}>
      <div className={`w-12 h-12 rounded-full flex-shrink-0 ${base}`} />
      <div className="flex-1 space-y-2.5">
        <div className="flex justify-between items-center">
          <div className={`h-3.5 rounded-full w-28 ${base}`} />
          <div className={`h-2.5 rounded-full w-10 ${base}`} />
        </div>
        <div className={`h-2.5 rounded-full w-44 ${base}`} />
      </div>
    </div>
  );
}

const MSG_WIDTHS = [140, 200, 160, 220, 180, 110];

export function MessageSkeleton({ isOwn, darkMode, index = 0 }: { isOwn: boolean; darkMode: boolean; index?: number }) {
  const w = MSG_WIDTHS[index % MSG_WIDTHS.length];
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`rounded-2xl h-10 ${
          isOwn
            ? 'bg-indigo-200 animate-shimmer'
            : darkMode
            ? 'bg-slate-700 animate-shimmer-dark'
            : 'bg-slate-200 animate-shimmer'
        }`}
        style={{ width: `${w}px` }}
      />
    </div>
  );
}
