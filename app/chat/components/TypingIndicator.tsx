'use client';
interface Props {
  name?: string;
  darkMode: boolean;
}

export default function TypingIndicator({ name, darkMode }: Props) {
  return (
    <div className="flex justify-start mb-3 items-end gap-2">
      <div className={`px-4 py-3 rounded-2xl rounded-bl-sm ${darkMode ? 'bg-slate-800' : 'bg-white shadow-sm shadow-slate-200/80'}`}>
        <div className="flex items-center gap-2.5">
          {name && (
            <span className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{name}</span>
          )}
          <div className="flex items-end gap-[3px] h-4">
            {[0, 1, 2].map(i => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce"
                style={{ animationDelay: `${i * 140}ms`, animationDuration: '1s' }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
