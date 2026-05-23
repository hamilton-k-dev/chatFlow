'use client';
import { User } from '../data/mockData';
import Modal from './ui/Modal';

interface Props {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
}

export default function ProfileModal({ user, isOpen, onClose, darkMode }: Props) {
  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} darkMode={darkMode}>
      <div className="flex flex-col items-center gap-5 p-6">
        {/* Avatar */}
        <div className="relative">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-24 h-24 rounded-full object-cover object-top ring-4 ring-indigo-100"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 ring-4 ring-indigo-100 flex items-center justify-center">
              <span className="text-white text-3xl font-bold">
                {user.name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase()}
              </span>
            </div>
          )}
          <span className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 ${
            user.online ? 'bg-emerald-400 border-white' : 'bg-slate-400 border-white'
          }`} />
        </div>

        {/* Name + status */}
        <div className="text-center">
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{user.name}</h2>
          <p className={`text-sm mt-0.5 font-medium ${user.online ? 'text-emerald-500' : darkMode ? 'text-slate-400' : 'text-slate-400'}`}>
            {user.online ? '● Online' : 'Last seen recently'}
          </p>
        </div>

        {/* Bio */}
        {user.bio && (
          <div className={`w-full px-4 py-3 rounded-xl text-sm text-center leading-relaxed ${
            darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-50 text-slate-600'
          }`}>
            {user.bio}
          </div>
        )}

        {/* Stats */}
        <div className={`w-full grid grid-cols-2 gap-3 pt-1 border-t ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className={`flex flex-col items-center gap-1 p-3 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
            <span className={`text-xs font-semibold tracking-wide ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>STATUS</span>
            <span className={`text-sm font-semibold ${user.online ? 'text-emerald-500' : darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              {user.online ? 'Active' : 'Offline'}
            </span>
          </div>
          <div className={`flex flex-col items-center gap-1 p-3 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
            <span className={`text-xs font-semibold tracking-wide ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>MEMBER</span>
            <span className={`text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Since 2023</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-semibold transition-all cursor-pointer shadow-sm"
        >
          Close
        </button>
      </div>
    </Modal>
  );
}
