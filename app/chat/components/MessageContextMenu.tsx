'use client';
import { useEffect, useRef } from 'react';

interface Props {
  x: number;
  y: number;
  isOwn: boolean;
  type: string;
  darkMode: boolean;
  onReply: () => void;
  onCopy: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export default function MessageContextMenu({ x, y, isOwn, type, darkMode, onReply, onCopy, onDelete, onClose }: Props) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    };
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', handle);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handle);
      document.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  const adjustedX = Math.min(x, window.innerWidth - 200);
  const adjustedY = Math.min(y, window.innerHeight - 180);

  const itemClass = `w-full flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer transition-colors ${
    darkMode ? 'text-slate-200 hover:bg-slate-700/80' : 'text-slate-700 hover:bg-slate-50'
  }`;

  return (
    <div
      ref={menuRef}
      style={{ position: 'fixed', left: adjustedX, top: adjustedY, zIndex: 1000 }}
      className={`w-52 rounded-2xl shadow-xl overflow-hidden border backdrop-blur-sm ${
        darkMode ? 'bg-slate-800/95 border-slate-700' : 'bg-white/95 border-slate-200'
      }`}
    >
      <button onClick={() => { onReply(); onClose(); }} className={itemClass}>
        <i className="ri-reply-line text-indigo-400 text-base" /> Reply
      </button>
      {type === 'text' && (
        <button onClick={() => { onCopy(); onClose(); }} className={itemClass}>
          <i className="ri-file-copy-line text-slate-400 text-base" /> Copy
        </button>
      )}
      {isOwn && type !== 'deleted' && (
        <>
          <div className={`mx-3 border-t ${darkMode ? 'border-slate-700' : 'border-slate-100'}`} />
          <button onClick={() => { onDelete(); onClose(); }} className={`${itemClass} text-red-500 hover:text-red-600`}>
            <i className="ri-delete-bin-line text-base" /> Delete
          </button>
        </>
      )}
    </div>
  );
}
