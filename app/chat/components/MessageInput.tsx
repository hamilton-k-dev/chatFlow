'use client';
import { useState, useRef } from 'react';
import EmojiPicker from './EmojiPicker';
import VoiceRecorder from './VoiceRecorder';
import { ReplyMessage } from '../data/mockData';

interface Props {
  onSendText: (text: string, replyToId?: string) => void;
  onSendVoice: (duration: string, audioUrl: string, replyToId?: string) => void;
  onSendImage: (dataUrl: string, replyToId?: string) => void;
  onTyping?: () => void;
  isBlocked: boolean;
  darkMode: boolean;
  replyTo?: ReplyMessage | null;
  onCancelReply?: () => void;
}

function replyPreviewText(reply: ReplyMessage): string {
  if (reply.type === 'deleted') return '🚫 Message deleted';
  if (reply.type === 'voice')   return '🎤 Voice note';
  if (reply.type === 'image')   return '📷 Photo';
  return reply.text ?? '';
}

export default function MessageInput({
  onSendText, onSendVoice, onSendImage, onTyping,
  isBlocked, darkMode, replyTo, onCancelReply,
}: Props) {
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [recording, setRecording] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canSend = !!(text.trim() || imagePreview);

  const handleSend = () => {
    const rid = replyTo?.id;
    if (imagePreview) {
      onSendImage(imagePreview, rid);
      setImagePreview(null);
      onCancelReply?.();
      return;
    }
    if (!text.trim()) return;
    onSendText(text.trim(), rid);
    setText('');
    onCancelReply?.();
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
    onTyping?.();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const btnClass = `w-9 h-9 flex items-center justify-center rounded-full flex-shrink-0 cursor-pointer transition-colors ${
    darkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
  }`;

  if (isBlocked) {
    return (
      <div className={`px-4 py-4 border-t ${darkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
        <p className={`text-center text-sm ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          You have blocked this user. Unblock to send messages.
        </p>
      </div>
    );
  }

  return (
    <div className={`px-4 py-3 border-t relative ${darkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
      {showEmoji && (
        <EmojiPicker onSelect={e => { setText(t => t + e); setShowEmoji(false); }} darkMode={darkMode} />
      )}
      {recording && (
        <VoiceRecorder
          onSend={(dur, url) => { onSendVoice(dur, url, replyTo?.id); onCancelReply?.(); setRecording(false); }}
          onCancel={() => setRecording(false)}
          darkMode={darkMode}
        />
      )}

      {/* Reply preview */}
      {replyTo && (
        <div className={`mb-2.5 flex items-center gap-2 rounded-xl px-3 py-2 ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
          <div className="flex-1 min-w-0 border-l-[3px] border-indigo-500 pl-2">
            <p className="text-xs font-semibold text-indigo-500 truncate">{replyTo.senderName}</p>
            <p className={`text-xs truncate mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{replyPreviewText(replyTo)}</p>
          </div>
          <button
            onClick={onCancelReply}
            className={`flex-shrink-0 cursor-pointer p-1 rounded-full transition-colors ${darkMode ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-700' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200'}`}
          >
            <i className="ri-close-line text-base" />
          </button>
        </div>
      )}

      {/* Image preview */}
      {imagePreview && (
        <div className={`mb-2.5 p-2 rounded-xl border flex items-center gap-3 ${darkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'}`}>
          <img src={imagePreview} alt="preview" className="w-12 h-12 rounded-lg object-cover" />
          <span className={`flex-1 text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Image ready to send</span>
          <button
            onClick={() => setImagePreview(null)}
            className={`w-6 h-6 flex items-center justify-center rounded-full cursor-pointer transition-colors ${darkMode ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-700' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200'}`}
          >
            <i className="ri-close-line text-sm" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        <button onClick={() => setShowEmoji(!showEmoji)} className={btnClass}>
          <i className={`ri-emotion-line text-xl ${showEmoji ? 'text-indigo-500' : ''}`} />
        </button>
        <button onClick={() => fileInputRef.current?.click()} className={btnClass}>
          <i className="ri-image-line text-xl" />
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

        <div className={`flex-1 flex items-end rounded-2xl px-4 py-2.5 ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder={imagePreview ? 'Add a caption...' : 'Write a message...'}
            rows={1}
            className={`flex-1 bg-transparent resize-none outline-none text-sm leading-relaxed max-h-28 ${
              darkMode ? 'text-white placeholder-slate-500' : 'text-slate-800 placeholder-slate-400'
            }`}
          />
        </div>

        {canSend ? (
          <button
            onClick={handleSend}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white flex-shrink-0 cursor-pointer transition-all shadow-sm shadow-indigo-200"
          >
            <i className="ri-send-plane-fill text-base" />
          </button>
        ) : (
          <button onClick={() => setRecording(true)} className={btnClass}>
            <i className="ri-mic-line text-xl" />
          </button>
        )}
      </div>
    </div>
  );
}
