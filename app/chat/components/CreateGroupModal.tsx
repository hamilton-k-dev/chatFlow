'use client';
import { useState, useRef } from 'react';
import Modal from './ui/Modal';
import Avatar from './ui/Avatar';
import { User } from '../data/mockData';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  onCreateGroup: (name: string, description: string, memberIds: string[], image?: string) => void;
  darkMode: boolean;
}

export default function CreateGroupModal({ isOpen, onClose, users, onCreateGroup, darkMode }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [groupImage, setGroupImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleUser = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setGroupImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleCreate = () => {
    if (!groupName.trim() || selected.length === 0) return;
    onCreateGroup(groupName.trim(), groupDesc.trim(), selected, groupImage || undefined);
    setStep(1);
    setSelected([]);
    setGroupName('');
    setGroupDesc('');
    setGroupImage(null);
    onClose();
  };

  const handleClose = () => {
    setStep(1);
    setSelected([]);
    setGroupName('');
    setGroupDesc('');
    setGroupImage(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} darkMode={darkMode}>
      <div className={`rounded-2xl shadow-2xl overflow-hidden w-full max-w-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className={`flex items-center gap-3 px-4 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          {step === 2 && (
            <button onClick={() => setStep(1)} className={`w-8 h-8 flex items-center justify-center rounded-full cursor-pointer ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}>
              <i className="ri-arrow-left-line text-lg" />
            </button>
          )}
          <h2 className={`font-bold text-lg flex-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {step === 1 ? 'Add Members' : 'Group Info'}
          </h2>
          <span className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
            Step {step}/2
          </span>
          <button onClick={handleClose} className={`w-8 h-8 flex items-center justify-center rounded-full cursor-pointer ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}>
            <i className="ri-close-line text-lg" />
          </button>
        </div>

        {step === 1 && (
          <>
            <div className={`px-4 py-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className={`ri-search-line text-sm ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                </div>
                <input
                  type="text"
                  placeholder="Search users..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className={`flex-1 bg-transparent text-sm outline-none ${darkMode ? 'text-white placeholder-gray-500' : 'text-gray-700 placeholder-gray-400'}`}
                  autoFocus
                />
              </div>
              {selected.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {selected.map(id => {
                    const u = users.find(x => x.id === id);
                    if (!u) return null;
                    return (
                      <div key={id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-medium">
                        <img src={u.avatar} alt={u.name} className="w-4 h-4 rounded-full object-cover object-top" />
                        {u.name.split(' ')[0]}
                        <button onClick={() => toggleUser(id)} className="cursor-pointer hover:text-violet-900">
                          <i className="ri-close-line text-xs" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="max-h-64 overflow-y-auto">
              {filtered.map(user => (
                <div
                  key={user.id}
                  onClick={() => toggleUser(user.id)}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                >
                  <Avatar src={user.avatar} name={user.name} size="lg" online={user.online} />
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{user.name}</p>
                    <p className={`text-xs truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user.bio}</p>
                  </div>
                  <div className={`w-6 h-6 flex items-center justify-center rounded-full border-2 transition-colors ${selected.includes(user.id) ? 'bg-violet-500 border-violet-500' : darkMode ? 'border-gray-500' : 'border-gray-300'}`}>
                    {selected.includes(user.id) && <i className="ri-check-line text-white text-xs" />}
                  </div>
                </div>
              ))}
            </div>
            <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                onClick={() => selected.length > 0 && setStep(2)}
                disabled={selected.length === 0}
                className="w-full py-3 rounded-xl bg-violet-500 hover:bg-violet-600 disabled:bg-violet-300 text-white font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap"
              >
                Next ({selected.length} selected)
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <div className="p-5 flex flex-col gap-4">
            <div className="flex flex-col items-center gap-2">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                {groupImage ? (
                  <img
                    src={groupImage}
                    alt="Group"
                    className="w-20 h-20 rounded-2xl object-cover object-top ring-4 ring-violet-100"
                  />
                ) : (
                  <div className="w-20 h-20 flex items-center justify-center rounded-2xl bg-violet-100 ring-4 ring-violet-50">
                    <i className="ri-group-line text-3xl text-violet-400" />
                  </div>
                )}
                <div className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <i className="ri-camera-line text-white text-xl" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 flex items-center justify-center rounded-full bg-violet-500 shadow-md">
                  <i className="ri-camera-line text-white text-xs" />
                </div>
              </div>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {groupImage ? 'Tap to change photo' : 'Add group photo (optional)'}
              </p>
              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{selected.length} members selected</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>GROUP NAME *</label>
              <input
                type="text"
                value={groupName}
                onChange={e => setGroupName(e.target.value)}
                placeholder="e.g. Design Team, Project Alpha..."
                className={`w-full px-4 py-3 rounded-xl text-sm outline-none border transition-colors ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-violet-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-violet-400'}`}
                autoFocus
              />
            </div>
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>DESCRIPTION (optional)</label>
              <input
                type="text"
                value={groupDesc}
                onChange={e => setGroupDesc(e.target.value)}
                placeholder="What's this group about?"
                className={`w-full px-4 py-3 rounded-xl text-sm outline-none border transition-colors ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-violet-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-violet-400'}`}
              />
            </div>
            <button
              onClick={handleCreate}
              disabled={!groupName.trim()}
              className="w-full py-3 rounded-xl bg-violet-500 hover:bg-violet-600 disabled:bg-violet-300 text-white font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap"
            >
              Create Group
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
