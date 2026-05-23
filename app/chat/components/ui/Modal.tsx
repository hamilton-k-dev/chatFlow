'use client';
import { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  darkMode?: boolean;
}

export default function Modal({ isOpen, onClose, children, darkMode }: ModalProps) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative z-10 w-full max-w-md mx-4 rounded-2xl shadow-2xl overflow-hidden ${darkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white'}`}>
        {children}
      </div>
    </div>
  );
}
