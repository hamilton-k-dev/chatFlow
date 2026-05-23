'use client';
import Modal from './ui/Modal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName: string;
  isBlocked: boolean;
  darkMode?: boolean;
}

export default function BlockModal({ isOpen, onClose, onConfirm, userName, isBlocked, darkMode }: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} darkMode={darkMode}>
      <div className="p-6">
        <div className="flex flex-col items-center text-center gap-4">
          <div className={`w-16 h-16 flex items-center justify-center rounded-2xl ${
            isBlocked ? 'bg-emerald-100' : 'bg-red-100'
          }`}>
            <i className={`text-3xl ${isBlocked ? 'ri-lock-unlock-line text-emerald-500' : 'ri-forbid-line text-red-500'}`} />
          </div>

          <div>
            <h3 className={`text-lg font-bold mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              {isBlocked ? `Unblock ${userName}?` : `Block ${userName}?`}
            </h3>
            <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {isBlocked
                ? `${userName} will be able to message you again.`
                : `${userName} won't be able to send you messages. You can unblock them at any time.`}
            </p>
          </div>

          <div className="flex flex-col gap-2 w-full pt-1">
            <button
              onClick={onConfirm}
              className={`w-full py-3 rounded-xl font-semibold text-white transition-colors cursor-pointer ${
                isBlocked ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              {isBlocked ? 'Unblock' : 'Block'}
            </button>
            <button
              onClick={onClose}
              className={`w-full py-3 rounded-xl font-semibold transition-colors cursor-pointer border ${
                darkMode
                  ? 'text-slate-300 border-slate-700 hover:bg-slate-800'
                  : 'text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
