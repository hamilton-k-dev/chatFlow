'use client';
import { useState, useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';

interface SearchResult {
  messageId: string;
  conversationId: string | null;
  groupId: string | null;
  conversationName: string;
  conversationAvatar: string;
  senderName: string;
  text: string;
  timestamp: string;
  isGroup: boolean;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  socket: Socket | null;
  onSelectConversation: (id: string) => void;
  darkMode: boolean;
}

export default function GlobalSearchModal({ isOpen, onClose, socket, onSelectConversation, darkMode }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!socket) return;
    const onResults = ({ results: res }: { results: SearchResult[] }) => {
      setResults(res);
      setLoading(false);
    };
    socket.on('search_results', onResults);
    return () => { socket.off('search_results', onResults); };
  }, [socket]);

  const handleQuery = (q: string) => {
    setQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.trim().length < 2) { setResults([]); setLoading(false); return; }
    setLoading(true);
    debounceRef.current = setTimeout(() => {
      socket?.emit('search_messages', { query: q.trim() });
    }, 350);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className={`relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className={`flex items-center gap-3 px-4 py-3.5 border-b ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
          <i className="ri-search-2-line text-lg flex-shrink-0 text-indigo-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => handleQuery(e.target.value)}
            placeholder="Search all messages..."
            className={`flex-1 bg-transparent outline-none text-sm font-medium ${darkMode ? 'text-white placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'}`}
          />
          {query ? (
            <button onClick={() => handleQuery('')} className={`cursor-pointer flex-shrink-0 p-1 rounded-full transition-colors ${darkMode ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}>
              <i className="ri-close-line text-base" />
            </button>
          ) : (
            <button onClick={onClose} className={`cursor-pointer flex-shrink-0 text-xs font-semibold px-2 py-1 rounded-lg border transition-colors ${darkMode ? 'border-slate-700 text-slate-500 hover:bg-slate-800' : 'border-slate-200 text-slate-400 hover:bg-slate-50'}`}>
              Esc
            </button>
          )}
        </div>

        <div className="max-h-[420px] overflow-y-auto">
          {loading && (
            <div className={`p-8 text-center text-sm ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              <i className="ri-loader-4-line animate-spin mr-2 text-indigo-400" />Searching...
            </div>
          )}
          {!loading && query.trim().length >= 2 && results.length === 0 && (
            <div className={`p-10 text-center ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                <i className="ri-search-line text-2xl" />
              </div>
              <p className="text-sm font-medium">No results for <span className={`font-bold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>"{query}"</span></p>
            </div>
          )}
          {!loading && results.length > 0 && results.map(r => (
            <button
              key={r.messageId}
              onClick={() => { onSelectConversation(r.conversationId ?? r.groupId ?? ''); onClose(); }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors cursor-pointer border-b last:border-0 ${darkMode ? 'hover:bg-slate-800 border-slate-800' : 'hover:bg-slate-50 border-slate-100'}`}
            >
              <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm bg-gradient-to-br ${r.isGroup ? 'from-violet-400 to-purple-500' : 'from-indigo-400 to-blue-500'}`}>
                <i className={r.isGroup ? 'ri-group-line' : 'ri-user-line'} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className={`text-sm font-semibold truncate ${darkMode ? 'text-white' : 'text-slate-900'}`}>{r.conversationName}</span>
                  <span className={`text-[11px] flex-shrink-0 ml-2 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{r.timestamp}</span>
                </div>
                <p className={`text-xs truncate ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  <span className="font-semibold">{r.senderName}: </span>{r.text}
                </p>
              </div>
            </button>
          ))}
          {!query.trim() && (
            <div className={`p-10 text-center ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 bg-gradient-to-br from-indigo-100 to-violet-100`}>
                <i className="ri-search-2-line text-2xl text-indigo-500" />
              </div>
              <p className="text-sm font-medium">Search all your messages</p>
              <p className="text-xs mt-1 opacity-70">Type at least 2 characters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
