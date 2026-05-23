'use client';
import { useState, useRef, useEffect } from 'react';
import Avatar from './ui/Avatar';
import GroupAvatarStack from './GroupAvatarStack';
import { AnyConversation, Conversation } from '../data/mockData';

interface Props {
  conversation: AnyConversation;
  isActive: boolean;
  onClick: () => void;
  darkMode: boolean;
  onViewProfile?: () => void;
  onBlock?: () => void;
  onSearch?: () => void;
}

export default function ConversationItem({ conversation, isActive, onClick, darkMode, onViewProfile, onBlock, onSearch }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isGroup = conversation.isGroup === true;
  const unread = conversation.unread ?? 0;
  const isBlocked = !isGroup && !!(conversation as Conversation).isBlocked;

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menuOpen]);

  const menuItem = `w-full flex items-center gap-2.5 px-3 py-2.5 text-sm cursor-pointer transition-colors text-left ${
    darkMode ? 'text-slate-200 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-50'
  }`;

  return (
    <div
      className={`group flex items-center gap-3 px-4 py-3 transition-all duration-150 border-l-[3px] ${
        isActive
          ? `border-indigo-500 ${darkMode ? 'bg-slate-800' : 'bg-indigo-50/80'}`
          : `border-transparent ${darkMode ? 'hover:bg-slate-800/60' : 'hover:bg-slate-50'}`
      }`}
    >
      {/* Avatar */}
      <div className="cursor-pointer flex-shrink-0" onClick={onClick}>
        {isGroup
          ? <GroupAvatarStack memberIds={(conversation as any).memberIds} />
          : <Avatar src={conversation.avatar} name={conversation.name} size="lg" online={(conversation as any).online} />
        }
      </div>

      {/* Text content */}
      <div className="flex-1 min-w-0 cursor-pointer" onClick={onClick}>
        <div className="flex items-center justify-between mb-0.5">
          <div className="flex items-center gap-1.5 min-w-0">
            {isGroup && <i className={`ri-group-3-line text-xs flex-shrink-0 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} />}
            <span className={`text-sm truncate ${unread > 0 ? 'font-bold' : 'font-semibold'} ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              {conversation.name}
            </span>
          </div>
          <span className={`text-[11px] flex-shrink-0 ml-2 ${unread > 0 ? 'text-indigo-500' : darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            {conversation.timestamp}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className={`text-xs truncate ${
            isBlocked ? 'italic text-slate-400' :
            unread > 0 ? (darkMode ? 'text-slate-300' : 'text-slate-600') : (darkMode ? 'text-slate-500' : 'text-slate-400')
          }`}>
            {isBlocked ? 'Blocked user' : conversation.lastMessage}
          </span>
          {unread > 0 && (
            <span className="flex-shrink-0 min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full bg-indigo-500 text-white text-[10px] font-bold">
              {unread > 99 ? '99+' : unread}
            </span>
          )}
        </div>
      </div>

      {/* Three-dot menu */}
      <div ref={menuRef} className="relative flex-shrink-0" onClick={e => e.stopPropagation()}>
        <button
          onClick={() => setMenuOpen(v => !v)}
          className={`w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer transition-all ${
            menuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          } ${darkMode ? 'hover:bg-slate-700 text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-400 hover:text-slate-700'}`}
        >
          <i className="ri-more-2-fill text-base" />
        </button>

        {menuOpen && (
          <div className={`absolute right-0 top-9 w-48 rounded-xl shadow-xl z-[60] overflow-hidden border ${
            darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
          }`}>
            <button
              onClick={() => { onViewProfile?.(); setMenuOpen(false); }}
              className={menuItem}
            >
              <i className={`${isGroup ? 'ri-group-line' : 'ri-user-3-line'} text-indigo-400 text-base`} />
              {isGroup ? 'Group Info' : 'View profile'}
            </button>

            <button
              onClick={() => { onClick(); onSearch?.(); setMenuOpen(false); }}
              className={menuItem}
            >
              <i className="ri-search-line text-slate-400 text-base" />
              Search in chat
            </button>

            {!isGroup && (
              <>
                <div className={`mx-3 border-t ${darkMode ? 'border-slate-700' : 'border-slate-100'}`} />
                <button
                  onClick={() => { onBlock?.(); setMenuOpen(false); }}
                  className={`${menuItem} ${isBlocked ? 'text-emerald-500' : 'text-red-500'}`}
                >
                  <i className={`${isBlocked ? 'ri-lock-unlock-line' : 'ri-forbid-line'} text-base`} />
                  {isBlocked ? 'Unblock' : 'Block'}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
