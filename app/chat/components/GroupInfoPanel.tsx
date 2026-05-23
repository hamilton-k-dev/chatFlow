'use client';
import { useState, useRef } from 'react';
import Avatar from './ui/Avatar';
import { GroupConversation } from '../data/mockData';
import { useChatContext } from '../ChatContext';

interface Props {
  group: GroupConversation;
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  onLeaveGroup: (id: string) => void;
  onAddMembers: (groupId: string, memberIds: string[]) => void;
  onRemoveMember: (groupId: string, memberId: string) => void;
  onUpdateGroup: (groupId: string, name: string, description: string, image?: string) => void;
}

export default function GroupInfoPanel({ group, isOpen, onClose, darkMode, onLeaveGroup, onAddMembers, onRemoveMember, onUpdateGroup }: Props) {
  const { currentUserId, currentUserName, currentUserAvatar, users } = useChatContext();
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(group.name);
  const [desc, setDesc] = useState(group.description);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [addSearch, setAddSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = group.adminIds.includes(currentUserId);
  const members = group.memberIds.map(id => {
    if (id === currentUserId) return { id: currentUserId, name: currentUserName, avatar: currentUserAvatar, online: true, bio: '' };
    return users.find(u => u.id === id);
  }).filter(Boolean);

  const nonMembers = users.filter(u => !group.memberIds.includes(u.id));
  const filteredNonMembers = nonMembers.filter(u => u.name.toLowerCase().includes(addSearch.toLowerCase()));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPreviewImage(ev.target?.result as string);
    reader.readAsDataURL(file);
    if (!editMode) setEditMode(true);
  };

  const handleSave = () => {
    onUpdateGroup(group.id, name, desc, previewImage || undefined);
    setEditMode(false);
    setPreviewImage(null);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setPreviewImage(null);
    setName(group.name);
    setDesc(group.description);
  };

  const displayImage = previewImage || group.avatar;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative h-full w-80 flex flex-col shadow-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className={`flex items-center gap-3 px-4 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <button onClick={onClose} className={`w-8 h-8 flex items-center justify-center rounded-full cursor-pointer ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}>
            <i className="ri-close-line text-lg" />
          </button>
          <h2 className={`font-bold text-lg flex-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Group Info</h2>
          {isAdmin && !editMode && (
            <button onClick={() => setEditMode(true)} className={`w-8 h-8 flex items-center justify-center rounded-full cursor-pointer ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}>
              <i className="ri-edit-line text-lg" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className={`flex flex-col items-center gap-3 px-4 py-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="relative group">
              <img src={displayImage} alt={group.name} className="w-20 h-20 rounded-2xl object-cover object-top ring-4 ring-violet-100" />
              {isAdmin && (
                <>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <i className="ri-camera-line text-white text-xl" />
                  </div>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-6 h-6 flex items-center justify-center rounded-full bg-violet-500 shadow-md cursor-pointer"
                  >
                    <i className="ri-camera-line text-white text-xs" />
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </>
              )}
            </div>
            {previewImage && (
              <span className="text-xs text-violet-500 font-medium">New photo selected — save to apply</span>
            )}
            {editMode ? (
              <div className="w-full flex flex-col gap-3">
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl text-sm outline-none border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} focus:border-violet-400`}
                />
                <input
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  placeholder="Group description..."
                  className={`w-full px-3 py-2 rounded-xl text-sm outline-none border ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'} focus:border-violet-400`}
                />
                <div className="flex gap-2">
                  <button onClick={handleCancelEdit} className={`flex-1 py-2 rounded-xl text-sm border cursor-pointer whitespace-nowrap ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>Cancel</button>
                  <button onClick={handleSave} className="flex-1 py-2 rounded-xl text-sm bg-violet-500 hover:bg-violet-600 text-white cursor-pointer whitespace-nowrap">Save</button>
                </div>
              </div>
            ) : (
              <>
                <h3 className={`font-bold text-xl text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>{group.name}</h3>
                <p className={`text-sm text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{group.description}</p>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs ${darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-group-line text-sm" />
                  </div>
                  {group.memberIds.length} members
                </div>
              </>
            )}
          </div>

          <div className={`px-4 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between mb-3">
              <h4 className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>Members</h4>
              {isAdmin && (
                <button
                  onClick={() => setShowAddMembers(!showAddMembers)}
                  className="flex items-center gap-1 text-xs text-violet-500 hover:text-violet-600 cursor-pointer"
                >
                  <i className="ri-user-add-line" /> Add
                </button>
              )}
            </div>

            {showAddMembers && (
              <div className={`mb-3 rounded-xl border overflow-hidden ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className={`flex items-center gap-2 px-3 py-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <i className={`ri-search-line text-sm ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={addSearch}
                    onChange={e => setAddSearch(e.target.value)}
                    className={`flex-1 bg-transparent text-xs outline-none ${darkMode ? 'text-white placeholder-gray-500' : 'text-gray-700 placeholder-gray-400'}`}
                  />
                </div>
                {filteredNonMembers.slice(0, 4).map(u => (
                  <div key={u.id} className={`flex items-center gap-2 px-3 py-2 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full object-cover object-top" />
                    <span className={`flex-1 text-xs font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{u.name}</span>
                    <button
                      onClick={() => { onAddMembers(group.id, [u.id]); setShowAddMembers(false); }}
                      className="text-xs text-violet-500 hover:text-violet-600 cursor-pointer whitespace-nowrap"
                    >
                      Add
                    </button>
                  </div>
                ))}
                {filteredNonMembers.length === 0 && (
                  <p className={`text-xs text-center py-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>All users are already members</p>
                )}
              </div>
            )}

            <div className="flex flex-col gap-1">
              {members.map(u => {
                if (!u) return null;
                const isGroupAdmin = group.adminIds.includes(u.id);
                const isMe = u.id === currentUserId;
                return (
                  <div key={u.id} className={`flex items-center gap-3 px-2 py-2 rounded-xl ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                    <Avatar src={u.avatar} name={u.name} size="md" online={'online' in u ? u.online : false} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-sm font-medium truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>{isMe ? 'You' : u.name}</span>
                        {isGroupAdmin && (
                          <span className="text-xs px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-600 font-medium">Admin</span>
                        )}
                      </div>
                    </div>
                    {isAdmin && !isMe && (
                      <button
                        onClick={() => onRemoveMember(group.id, u.id)}
                        className={`w-7 h-7 flex items-center justify-center rounded-full cursor-pointer transition-colors ${darkMode ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-red-50 text-gray-400 hover:text-red-500'}`}
                      >
                        <i className="ri-user-unfollow-line text-sm" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="px-4 py-4">
            <button
              onClick={() => onLeaveGroup(group.id)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-red-200 text-red-500 hover:bg-red-50 transition-colors cursor-pointer whitespace-nowrap text-sm font-semibold"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-logout-box-line text-lg" />
              </div>
              Leave Group
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
