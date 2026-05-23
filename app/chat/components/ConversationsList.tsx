'use client';
import { useState } from 'react';
import ConversationItem from './ConversationItem';
import ProfileModal from './ProfileModal';
import BlockModal from './BlockModal';
import { ConversationSkeleton } from './ui/Skeleton';
import { useChatContext } from '../ChatContext';
import { AnyConversation, Conversation, User } from '../data/mockData';

interface Props {
  conversations: AnyConversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onNewGroup: () => void;
  onGlobalSearch?: () => void;
  onBlock: (id: string) => void;
  onSearchInChat: (id: string) => void;
  loading?: boolean;
  darkMode: boolean;
  currentUserAvatar: string;
  currentUserName: string;
  onOpenSettings: () => void;
}

type Filter = 'all' | 'direct' | 'groups';

export default function ConversationsList({
  conversations, activeId, onSelect, onNewChat, onNewGroup,
  onGlobalSearch, onBlock, onSearchInChat, loading, darkMode,
  currentUserAvatar, currentUserName, onOpenSettings,
}: Props) {
  const { users } = useChatContext();
  const [search, setSearch] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');
  const [showNewMenu, setShowNewMenu] = useState(false);

  // Per-item modal state
  const [profileTarget, setProfileTarget] = useState<AnyConversation | null>(null);
  const [blockTarget, setBlockTarget] = useState<Conversation | null>(null);

  const filtered = conversations.filter(c => {
    const q = search.toLowerCase();
    const match = c.name.toLowerCase().includes(q) || c.lastMessage.toLowerCase().includes(q);
    if (filter === 'direct') return match && !c.isGroup;
    if (filter === 'groups') return match && c.isGroup;
    return match;
  });

  const filterLabels: Record<Filter, string> = { all: 'All', direct: 'Direct', groups: 'Groups' };

  // Build User from conversation for ProfileModal
  function buildUser(conv: AnyConversation): User | null {
    if (conv.isGroup) return null;
    const dm = conv as Conversation;
    const found = users.find(u => u.id === dm.userId);
    return found ?? { id: dm.userId, name: dm.name, avatar: dm.avatar, online: dm.online, bio: '' };
  }

  const handleBlockConfirm = () => {
    if (blockTarget) {
      onBlock(blockTarget.id);
      setBlockTarget(null);
    }
  };

  return (
    <div className={`flex flex-col h-full ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border-r`}>

      {/* Header */}
      <div className={`px-4 pt-4 pb-3 border-b ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-sm shadow-indigo-200">
              <i className="ri-chat-3-fill text-white text-sm" />
            </div>
            <span className="font-bold text-lg font-['Pacifico'] bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              ChatFlow
            </span>
          </div>

          <div className="flex items-center gap-0.5">
            {onGlobalSearch && (
              <button
                onClick={() => { onGlobalSearch(); setShowProfileMenu(false); setShowNewMenu(false); }}
                className={`w-8 h-8 flex items-center justify-center rounded-xl cursor-pointer transition-colors ${darkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`}
                title="Global search"
              >
                <i className="ri-search-2-line text-base" />
              </button>
            )}
            <div className="relative">
              <button
                onClick={() => { setShowNewMenu(!showNewMenu); setShowProfileMenu(false); }}
                className={`w-8 h-8 flex items-center justify-center rounded-xl cursor-pointer transition-colors ${darkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`}
              >
                <i className="ri-edit-box-line text-base" />
              </button>
              {showNewMenu && (
                <div className={`absolute right-0 top-10 w-44 rounded-2xl shadow-xl z-50 overflow-hidden border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                  <button
                    onClick={() => { onNewChat(); setShowNewMenu(false); }}
                    className={`w-full flex items-center gap-2.5 px-4 py-3 text-sm cursor-pointer transition-colors ${darkMode ? 'text-slate-200 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-50'}`}
                  >
                    <i className="ri-user-add-line text-indigo-500" /> New Chat
                  </button>
                  <button
                    onClick={() => { onNewGroup(); setShowNewMenu(false); }}
                    className={`w-full flex items-center gap-2.5 px-4 py-3 text-sm cursor-pointer transition-colors ${darkMode ? 'text-slate-200 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-50'}`}
                  >
                    <i className="ri-group-line text-violet-500" /> New Group
                  </button>
                </div>
              )}
            </div>
            <div className="relative">
              <button
                onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNewMenu(false); }}
                className="cursor-pointer rounded-full ring-2 ring-transparent hover:ring-indigo-400 transition-all"
              >
                {currentUserAvatar ? (
                  <img src={currentUserAvatar} alt="me" className="w-8 h-8 rounded-full object-cover object-top" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {currentUserName.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase()}
                    </span>
                  </div>
                )}
              </button>
              {showProfileMenu && (
                <div className={`absolute right-0 top-10 w-48 rounded-2xl shadow-xl z-50 overflow-hidden border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                  <div className={`px-4 py-3 border-b ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                    <p className={`text-xs font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Signed in as</p>
                    <p className={`text-sm font-semibold truncate mt-0.5 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{currentUserName}</p>
                  </div>
                  <button
                    onClick={() => { onOpenSettings(); setShowProfileMenu(false); }}
                    className={`w-full flex items-center gap-2.5 px-4 py-3 text-sm cursor-pointer transition-colors ${darkMode ? 'text-slate-200 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-50'}`}
                  >
                    <i className="ri-settings-3-line text-slate-500" /> Settings
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search */}
        <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
          <i className={`ri-search-line text-sm flex-shrink-0 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`flex-1 bg-transparent text-sm outline-none ${darkMode ? 'text-white placeholder-slate-500' : 'text-slate-800 placeholder-slate-400'}`}
          />
          {search && (
            <button onClick={() => setSearch('')} className={`text-sm cursor-pointer ${darkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}>
              <i className="ri-close-line" />
            </button>
          )}
        </div>

        {/* Filter */}
        <div className={`flex gap-1 mt-2.5 p-1 rounded-xl ${darkMode ? 'bg-slate-800/70' : 'bg-slate-100'}`}>
          {(['all', 'direct', 'groups'] as Filter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                filter === f
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : darkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {filterLabels[f]}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          Array.from({ length: 7 }).map((_, i) => <ConversationSkeleton key={i} darkMode={darkMode} />)
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 px-6 text-center">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
              <i className={`ri-chat-3-line text-2xl ${darkMode ? 'text-slate-600' : 'text-slate-400'}`} />
            </div>
            <p className={`text-sm font-medium ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              {search ? `No results for "${search}"` : 'No conversations'}
            </p>
            <button onClick={onNewChat} className="text-sm text-indigo-500 hover:text-indigo-600 font-medium cursor-pointer">
              Start a conversation
            </button>
          </div>
        ) : (
          filtered.map(c => (
            <ConversationItem
              key={c.id}
              conversation={c}
              isActive={activeId === c.id}
              onClick={() => onSelect(c.id)}
              darkMode={darkMode}
              onViewProfile={() => setProfileTarget(c)}
              onBlock={!c.isGroup ? () => setBlockTarget(c as Conversation) : undefined}
              onSearch={() => onSearchInChat(c.id)}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className={`p-3 border-t ${darkMode ? 'border-slate-800' : 'border-slate-100'} flex gap-2`}>
        <button
          onClick={onNewChat}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-sm font-semibold transition-all shadow-sm shadow-indigo-200 cursor-pointer whitespace-nowrap"
        >
          <i className="ri-add-line" /> New Chat
        </button>
        <button
          onClick={onNewGroup}
          className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${darkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
        >
          <i className="ri-group-line" /> Group
        </button>
      </div>

      {/* Profile Modal */}
      {profileTarget && (
        <ProfileModal
          user={buildUser(profileTarget)}
          isOpen={true}
          onClose={() => setProfileTarget(null)}
          darkMode={darkMode}
        />
      )}

      {/* Block Modal */}
      {blockTarget && (
        <BlockModal
          isOpen={true}
          onClose={() => setBlockTarget(null)}
          onConfirm={handleBlockConfirm}
          userName={blockTarget.name}
          isBlocked={blockTarget.isBlocked}
          darkMode={darkMode}
        />
      )}
    </div>
  );
}
