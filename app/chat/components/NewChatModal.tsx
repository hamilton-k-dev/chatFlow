'use client';
import { useState } from 'react';
import Modal from './ui/Modal';
import Avatar from './ui/Avatar';
import { User } from '../data/mockData';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  onStartChat: (userId: string) => void;
  darkMode: boolean;
}

export default function NewChatModal({ isOpen, onClose, users, onStartChat, darkMode }: Props) {
  const [search, setSearch] = useState('');

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.bio.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} darkMode={darkMode}>
      <div className={`rounded-2xl shadow-2xl overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className={`flex items-center gap-3 px-4 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <button onClick={onClose} className={`w-8 h-8 flex items-center justify-center rounded-full cursor-pointer ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}>
            <i className="ri-arrow-left-line text-lg" />
          </button>
          <h2 className={`font-bold text-lg flex-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>New Chat</h2>
          <button onClick={onClose} className={`w-8 h-8 flex items-center justify-center rounded-full cursor-pointer ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}>
            <i className="ri-close-line text-lg" />
          </button>
        </div>
        <div className={`px-4 py-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <div className="w-4 h-4 flex items-center justify-center">
              <i className={`ri-search-line text-sm ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
            </div>
            <input
              type="text"
              placeholder="Search users by name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={`flex-1 bg-transparent text-sm outline-none ${darkMode ? 'text-white placeholder-gray-500' : 'text-gray-700 placeholder-gray-400'}`}
              autoFocus
            />
          </div>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <div className="w-10 h-10 flex items-center justify-center">
                <i className={`ri-user-search-line text-3xl ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
              </div>
              <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>No users found</p>
            </div>
          ) : (
            filtered.map(user => (
              <div
                key={user.id}
                onClick={() => { onStartChat(user.id); onClose(); }}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
              >
                <Avatar src={user.avatar} name={user.name} size="lg" online={user.online} />
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{user.name}</p>
                  <p className={`text-xs truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user.bio}</p>
                </div>
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-violet-500 text-white flex-shrink-0">
                  <i className="ri-add-line text-sm" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}
