'use client';
import { useState } from 'react';
import { Message } from '../data/mockData';

interface Props {
  messages: Message[];
  darkMode: boolean;
  onClose: () => void;
  onJumpTo: (id: string) => void;
}

export default function ChatSearchBar({ messages, darkMode, onClose, onJumpTo }: Props) {
  const [query, setQuery] = useState('');
  const [resultIndex, setResultIndex] = useState(0);

  const results = query.trim()
    ? messages.filter(m => m.type === 'text' && m.text?.toLowerCase().includes(query.toLowerCase()))
    : [];

  const jump = (idx: number) => {
    setResultIndex(idx);
    onJumpTo(results[idx].id);
  };

  const handleNext = () => results.length && jump((resultIndex + 1) % results.length);
  const handlePrev = () => results.length && jump((resultIndex - 1 + results.length) % results.length);

  const handleChange = (val: string) => {
    setQuery(val);
    setResultIndex(0);
    if (val.trim()) {
      const found = messages.filter(m => m.type === 'text' && m.text?.toLowerCase().includes(val.toLowerCase()));
      if (found.length) onJumpTo(found[0].id);
    }
  };

  const navBtn = `w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer transition-colors disabled:opacity-30 ${
    darkMode ? 'hover:bg-slate-700 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-800'
  }`;

  return (
    <div className={`flex items-center gap-2 px-3 py-2.5 border-b ${darkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
      <i className="ri-search-line text-indigo-400 flex-shrink-0" />
      <input
        autoFocus
        type="text"
        placeholder="Search in conversation..."
        value={query}
        onChange={e => handleChange(e.target.value)}
        className={`flex-1 bg-transparent text-sm outline-none ${darkMode ? 'text-white placeholder-slate-500' : 'text-slate-800 placeholder-slate-400'}`}
      />
      {query && (
        <span className={`text-xs font-medium flex-shrink-0 ${
          results.length > 0 ? 'text-indigo-500' : darkMode ? 'text-slate-500' : 'text-slate-400'
        }`}>
          {results.length > 0 ? `${resultIndex + 1} / ${results.length}` : '0 results'}
        </span>
      )}
      {results.length > 1 && (
        <>
          <button onClick={handlePrev} className={navBtn}>
            <i className="ri-arrow-up-s-line text-lg" />
          </button>
          <button onClick={handleNext} className={navBtn}>
            <i className="ri-arrow-down-s-line text-lg" />
          </button>
        </>
      )}
      <button onClick={onClose} className={navBtn}>
        <i className="ri-close-line text-lg" />
      </button>
    </div>
  );
}
