'use client';
import { useState, useRef } from 'react';
import AudioPlayer from './ui/AudioPlayer';
import MessageContextMenu from './MessageContextMenu';
import { Message, MessageStatus } from '../data/mockData';

interface Props {
  message: Message;
  darkMode: boolean;
  highlight?: boolean;
  onReply?: (message: Message) => void;
  onDelete?: (messageId: string) => void;
  onJumpToMessage?: (id: string) => void;
}

function StatusIcon({ status }: { status: MessageStatus }) {
  if (status === 'sent')      return <i className="ri-check-line text-[10px] text-white/60" />;
  if (status === 'delivered') return <i className="ri-check-double-line text-[10px] text-white/60" />;
  return <i className="ri-check-double-line text-[10px] text-violet-200" />;
}

export default function MessageBubble({ message, darkMode, highlight, onReply, onDelete, onJumpToMessage }: Props) {
  const { isOwn, type, text, duration, imageUrl, audioUrl, timestamp, status, replyTo } = message;
  const [imgOpen, setImgOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const touchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchTimerRef.current = setTimeout(() => setContextMenu({ x: touch.clientX, y: touch.clientY }), 500);
  };

  const handleTouchEnd = () => {
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
  };

  const isDeleted = type === 'deleted';

  const sentBubble = 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white';
  const recvBubble = darkMode ? 'bg-slate-800 text-slate-100' : 'bg-white text-slate-800 shadow-sm shadow-slate-200/80';

  return (
    <>
      <div
        className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1.5`}
        id={`msg-${message.id}`}
        onContextMenu={handleContextMenu}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchEnd}
      >
        <div className={`max-w-[72%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>

          {/* Reply quote */}
          {replyTo && (
            <div
              onClick={() => onJumpToMessage?.(replyTo.id)}
              className={`mb-1 px-3 py-1.5 rounded-xl border-l-[3px] border-indigo-400 cursor-pointer max-w-full ${
                darkMode ? 'bg-slate-800/80' : 'bg-slate-100'
              }`}
            >
              <p className="text-xs font-semibold text-indigo-500 truncate">{replyTo.senderName}</p>
              <p className={`text-xs truncate mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {replyTo.type === 'deleted' ? '🚫 Message deleted' :
                 replyTo.type === 'voice'   ? '🎤 Voice note' :
                 replyTo.type === 'image'   ? '📷 Photo' :
                 replyTo.text}
              </p>
            </div>
          )}

          {/* Bubble */}
          <div
            className={`px-4 py-2.5 rounded-2xl transition-all duration-200 ${
              highlight ? 'ring-2 ring-yellow-400 ring-offset-1' : ''
            } ${
              isOwn
                ? `${sentBubble} rounded-br-sm`
                : `${recvBubble} rounded-bl-sm`
            } ${type === 'image' ? '!p-1.5' : ''}`}
          >
            {isDeleted ? (
              <p className={`text-sm italic flex items-center gap-1.5 ${isOwn ? 'text-white/50' : darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                <i className="ri-forbid-line" /> Message deleted
              </p>
            ) : type === 'voice' && duration ? (
              <AudioPlayer duration={duration} audioUrl={audioUrl} isOwn={isOwn} />
            ) : type === 'image' && imageUrl ? (
              <img
                src={imageUrl}
                alt="sent image"
                className="rounded-xl max-w-[240px] max-h-[240px] object-cover cursor-pointer"
                onClick={() => setImgOpen(true)}
              />
            ) : (
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{text}</p>
            )}
          </div>

          {/* Timestamp + status */}
          <div className={`flex items-center gap-1 mt-0.5 px-1 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
            <span className={`text-[11px] ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{timestamp}</span>
            {isOwn && !isDeleted && <StatusIcon status={status} />}
          </div>
        </div>
      </div>

      {contextMenu && (
        <MessageContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          isOwn={isOwn}
          type={type}
          darkMode={darkMode}
          onReply={() => onReply?.(message)}
          onCopy={() => { if (text) navigator.clipboard.writeText(text); }}
          onDelete={() => onDelete?.(message.id)}
          onClose={() => setContextMenu(null)}
        />
      )}

      {imgOpen && imageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md"
          onClick={() => setImgOpen(false)}
        >
          <img src={imageUrl} alt="full" className="max-w-[90vw] max-h-[90vh] rounded-2xl object-contain shadow-2xl" />
          <button className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/15 text-white cursor-pointer hover:bg-white/25 transition-colors backdrop-blur-sm">
            <i className="ri-close-line text-xl" />
          </button>
        </div>
      )}
    </>
  );
}
