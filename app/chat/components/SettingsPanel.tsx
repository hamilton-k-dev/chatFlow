'use client';
import { useState, useRef } from 'react';
import Avatar from './ui/Avatar';
import { Conversation } from '../data/mockData';

interface Props {
  onClose: () => void;
  darkMode: boolean;
  onToggleDark: () => void;
  conversations: Conversation[];
  onUnblock: (id: string) => void;
  currentUser: { name: string; avatar: string };
  onAvatarChange?: (url: string) => void;
  onLogout?: () => void;
}

type Tab = 'profile' | 'privacy' | 'appearance';

export default function SettingsPanel({ onClose, darkMode, onToggleDark, conversations, onUnblock, currentUser, onAvatarChange, onLogout }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [username, setUsername] = useState(currentUser.name);
  const [bio, setBio] = useState('Building cool things 🚀');
  const [saved, setSaved] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const blockedConvos = conversations.filter(c => c.isBlocked);
  const displayAvatar = avatarPreview || currentUser.avatar;

  const handleSave = () => {
    if (avatarPreview && onAvatarChange) onAvatarChange(avatarPreview);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'profile', label: 'Profile', icon: 'ri-user-line' },
    { id: 'privacy', label: 'Privacy', icon: 'ri-shield-line' },
    { id: 'appearance', label: 'Appearance', icon: 'ri-palette-line' },
  ];

  return (
    <div className={`flex flex-col h-full ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
      <div className={`flex items-center gap-3 px-4 py-4 border-b ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
        <button onClick={onClose} className={`w-8 h-8 flex items-center justify-center rounded-full cursor-pointer ${darkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-100 text-slate-600'}`}>
          <i className="ri-arrow-left-line text-lg" />
        </button>
        <h2 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-slate-900'}`}>Settings</h2>
      </div>

      <div className={`flex border-b ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors cursor-pointer ${
              activeTab === t.id
                ? 'text-indigo-500 border-b-2 border-violet-500'
                : darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <i className={`${t.icon} text-lg`} />
            </div>
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-0">
        {activeTab === 'profile' && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="relative">
                {displayAvatar ? (
                  <img src={displayAvatar} alt="avatar" className="w-20 h-20 rounded-full object-cover object-top ring-4 ring-violet-100" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-indigo-400 ring-4 ring-violet-100 flex items-center justify-center">
                    <span className="text-white text-2xl font-semibold">
                      {username.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase()}
                    </span>
                  </div>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-7 h-7 flex items-center justify-center rounded-full bg-indigo-500 text-white cursor-pointer hover:bg-indigo-600 transition-colors"
                >
                  <i className="ri-camera-line text-xs" />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarFile} />
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-sm text-indigo-500 hover:underline cursor-pointer"
              >
                Change Photo
              </button>
              {avatarPreview && (
                <span className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-indigo-900/30 text-indigo-300' : 'bg-indigo-50 text-indigo-600'}`}>
                  New photo selected — save to apply
                </span>
              )}
            </div>
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>USERNAME</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl text-sm outline-none border transition-colors ${darkMode ? 'bg-slate-700 border-slate-600 text-white focus:border-violet-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-violet-400'}`}
              />
            </div>
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>BIO</label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                rows={3}
                maxLength={150}
                className={`w-full px-4 py-3 rounded-xl text-sm outline-none border resize-none transition-colors ${darkMode ? 'bg-slate-700 border-slate-600 text-white focus:border-violet-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-violet-400'}`}
              />
              <p className={`text-xs mt-1 text-right ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{bio.length}/150</p>
            </div>
            <button
              onClick={handleSave}
              className={`w-full py-3 rounded-xl font-semibold text-white transition-colors cursor-pointer whitespace-nowrap ${saved ? 'bg-green-500' : 'bg-indigo-500 hover:bg-indigo-600'}`}
            >
              {saved ? '✓ Saved!' : 'Save Changes'}
            </button>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="flex flex-col gap-4">
            <div>
              <h3 className={`font-semibold mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Blocked Users</h3>
              <p className={`text-xs mb-3 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {blockedConvos.length} user{blockedConvos.length !== 1 ? 's' : ''} blocked
              </p>
              {blockedConvos.length === 0 ? (
                <div className={`flex flex-col items-center py-8 gap-2 rounded-xl ${darkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>
                  <div className="w-10 h-10 flex items-center justify-center">
                    <i className={`ri-shield-check-line text-3xl ${darkMode ? 'text-slate-500' : 'text-slate-300'}`} />
                  </div>
                  <p className={`text-sm ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>No blocked users</p>
                </div>
              ) : (
                <div className={`rounded-xl overflow-hidden border ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                  {blockedConvos.map((c, i) => (
                    <div key={c.id} className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? `border-t ${darkMode ? 'border-slate-700' : 'border-slate-100'}` : ''} ${darkMode ? 'bg-slate-700' : 'bg-white'}`}>
                      <Avatar src={c.avatar} name={c.name} size="md" />
                      <span className={`flex-1 text-sm font-medium ${darkMode ? 'text-white' : 'text-slate-900'}`}>{c.name}</span>
                      <button
                        onClick={() => onUnblock(c.id)}
                        className="text-xs text-red-500 border border-red-300 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Unblock
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="flex flex-col gap-4">
            <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Theme</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Light', icon: 'ri-sun-line', value: false },
                { label: 'Dark', icon: 'ri-moon-line', value: true },
              ].map(t => (
                <button
                  key={t.label}
                  onClick={() => { if (darkMode !== t.value) onToggleDark(); }}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    darkMode === t.value
                      ? 'border-indigo-500 bg-indigo-50'
                      : darkMode ? 'border-slate-600 bg-slate-700' : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="w-6 h-6 flex items-center justify-center">
                    <i className={`${t.icon} text-2xl ${darkMode === t.value ? 'text-indigo-500' : darkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                  </div>
                  <span className={`text-sm font-medium ${darkMode === t.value ? 'text-indigo-500' : darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{t.label}</span>
                  {darkMode === t.value && (
                    <div className="w-5 h-5 flex items-center justify-center rounded-full bg-indigo-500">
                      <i className="ri-check-line text-white text-xs" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className={`px-4 py-4 border-t ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
        <button
          onClick={onLogout}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap border-2 border-red-200 text-red-500 hover:bg-red-50 ${darkMode ? 'hover:bg-red-900/20 border-red-800' : ''}`}
        >
          <i className="ri-logout-box-line text-base" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
