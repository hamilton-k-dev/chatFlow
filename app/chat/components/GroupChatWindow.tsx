'use client';
import { useState, useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import ChatSearchBar from './ChatSearchBar';
import GroupInfoPanel from './GroupInfoPanel';
import GroupAvatarStack from './GroupAvatarStack';
import MessageContextMenu from './MessageContextMenu';
import { MessageSkeleton } from './ui/Skeleton';
import { useChatContext } from '../ChatContext';
import { GroupConversation, Message, ReplyMessage } from '../data/mockData';

const avatarGradients = [
  'from-indigo-400 to-violet-500',
  'from-sky-400 to-blue-500',
  'from-emerald-400 to-teal-500',
  'from-rose-400 to-pink-500',
  'from-amber-400 to-orange-500',
  'from-fuchsia-400 to-purple-500',
];
function senderInitialColor(name: string) {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) & 0xff;
  return avatarGradients[hash % avatarGradients.length];
}

interface Props {
  group: GroupConversation;
  socket: Socket | null;
  onBack: () => void;
  darkMode: boolean;
  onLeaveGroup: (id: string) => void;
  onAddMembers: (groupId: string, memberIds: string[]) => void;
  onRemoveMember: (groupId: string, memberId: string) => void;
  onUpdateGroup: (groupId: string, name: string, description: string, image?: string) => void;
}

export default function GroupChatWindow({ group, socket, onBack, darkMode, onLeaveGroup, onAddMembers, onRemoveMember, onUpdateGroup }: Props) {
  const { currentUserId } = useChatContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [typing, setTyping] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ReplyMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!socket) return;
    setMessages([]);
    setTyping(null);
    setShowSearch(false);
    setHighlightId(null);
    setReplyingTo(null);
    setLoading(true);
    setHasMore(false);

    socket.emit('join_group', group.id);
    socket.emit('get_group_messages', { groupId: group.id });
  }, [socket, group.id]);

  // Reconnect: re-join room
  useEffect(() => {
    if (!socket) return;
    const onReconnect = () => socket.emit('join_group', group.id);
    socket.on('connect', onReconnect);
    return () => { socket.off('connect', onReconnect); };
  }, [socket, group.id]);

  useEffect(() => {
    if (!socket) return;

    const onGroupMessagesLoaded = ({ groupId, messages: msgs, hasMore: more, prepend }: {
      groupId: string; messages: Message[]; hasMore: boolean; prepend: boolean;
    }) => {
      if (groupId !== group.id) return;
      if (prepend) {
        const el = scrollRef.current;
        const oldHeight = el?.scrollHeight ?? 0;
        setMessages(prev => [...msgs, ...prev]);
        setHasMore(more);
        setLoadingMore(false);
        requestAnimationFrame(() => {
          if (el) el.scrollTop = el.scrollHeight - oldHeight;
        });
      } else {
        setMessages(msgs);
        setHasMore(more);
        setLoading(false);
      }
    };

    const onNewGroupMessage = ({ groupId, message }: { groupId: string; message: Message }) => {
      if (groupId === group.id) {
        setMessages(prev => [...prev, { ...message, isOwn: message.senderId === currentUserId }]);
      }
    };

    const onGroupMessageDeleted = ({ groupId, messageId }: { groupId?: string; messageId: string }) => {
      if (groupId === group.id) {
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, type: 'deleted' as const, text: undefined } : m));
      }
    };

    const onGroupUserTyping = ({ groupId, userId, name }: { groupId: string; userId: string; name: string }) => {
      if (groupId === group.id && userId !== currentUserId) {
        setTyping(name);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setTyping(null), 3000);
      }
    };

    socket.on('group_messages_loaded', onGroupMessagesLoaded);
    socket.on('new_group_message', onNewGroupMessage);
    socket.on('message_deleted', onGroupMessageDeleted);
    socket.on('group_user_typing', onGroupUserTyping);

    return () => {
      socket.off('group_messages_loaded', onGroupMessagesLoaded);
      socket.off('new_group_message', onNewGroupMessage);
      socket.off('message_deleted', onGroupMessageDeleted);
      socket.off('group_user_typing', onGroupUserTyping);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [socket, group.id, currentUserId]);

  useEffect(() => {
    if (!loading) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing, loading]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 200);
    if (el.scrollTop < 80 && hasMore && !loadingMore) {
      setLoadingMore(true);
      socket?.emit('get_group_messages', { groupId: group.id, before: messages[0]?.id });
    }
  };

  const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleSendText = (text: string, replyToId?: string) => {
    if (!socket) return;
    setMessages(prev => [...prev, {
      id: `temp_${Date.now()}`, senderId: currentUserId, senderName: 'You', text, type: 'text',
      timestamp: now(), status: 'sent', isOwn: true,
      replyTo: replyToId && replyingTo ? replyingTo : undefined,
    }]);
    socket.emit('send_group_message', { groupId: group.id, text, type: 'text', replyToId });
    setReplyingTo(null);
  };

  const handleSendVoice = (duration: string, audioUrl: string, replyToId?: string) => {
    if (!socket) return;
    setMessages(prev => [...prev, {
      id: `temp_${Date.now()}`, senderId: currentUserId, senderName: 'You', type: 'voice', duration, audioUrl,
      timestamp: now(), status: 'sent', isOwn: true,
    }]);
    socket.emit('send_group_message', { groupId: group.id, type: 'voice', duration, audioUrl, replyToId });
    setReplyingTo(null);
  };

  const handleSendImage = (dataUrl: string, replyToId?: string) => {
    if (!socket) return;
    setMessages(prev => [...prev, {
      id: `temp_${Date.now()}`, senderId: currentUserId, senderName: 'You', type: 'image', imageUrl: dataUrl,
      timestamp: now(), status: 'sent', isOwn: true,
    }]);
    socket.emit('send_group_message', { groupId: group.id, type: 'image', imageUrl: dataUrl, replyToId });
    setReplyingTo(null);
  };

  const handleTyping = () => socket?.emit('group_typing', { groupId: group.id });

  const handleReply = (message: Message) => {
    setReplyingTo({
      id: message.id,
      senderName: message.isOwn ? 'You' : (message.senderName ?? group.name),
      text: message.text,
      type: message.type,
    });
  };

  const handleDelete = (messageId: string) => {
    socket?.emit('delete_message', { messageId });
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, type: 'deleted' as const, text: undefined } : m));
  };

  const handleJumpTo = (id: string) => {
    setHighlightId(id);
    document.getElementById(`msg-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => setHighlightId(null), 2000);
  };

  const skeletons = [false, true, false, true, true, false];

  const hdrBtn = `w-9 h-9 flex items-center justify-center rounded-xl cursor-pointer transition-colors ${darkMode ? 'hover:bg-slate-700 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`;

  return (
    <div className={`flex flex-col h-full ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <div className={`relative z-10 flex items-center gap-3 px-4 py-3 border-b backdrop-blur-sm ${darkMode ? 'border-slate-800 bg-slate-900/95' : 'border-slate-200 bg-white/95'}`}>
        <button onClick={onBack} className={`md:hidden ${hdrBtn}`}>
          <i className="ri-arrow-left-s-line text-xl" />
        </button>
        <button onClick={() => setShowInfo(true)} className="cursor-pointer">
          <GroupAvatarStack memberIds={group.memberIds} />
        </button>
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setShowInfo(true)}>
          <h2 className={`font-semibold text-[15px] truncate ${darkMode ? 'text-white' : 'text-slate-900'}`}>{group.name}</h2>
          <p className={`text-xs font-medium truncate ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            {group.memberIds.length} members
          </p>
        </div>
        <button
          onClick={() => { setShowSearch(!showSearch); setShowMenu(false); }}
          className={`${hdrBtn} ${showSearch ? '!bg-indigo-100 !text-indigo-600' : ''}`}
        >
          <i className="ri-search-line text-lg" />
        </button>
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)} className={hdrBtn}>
            <i className="ri-more-2-fill text-xl" />
          </button>
          {showMenu && (
            <div className={`absolute right-0 top-11 w-48 rounded-2xl shadow-xl z-50 overflow-hidden border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
              <button
                onClick={() => { setShowInfo(true); setShowMenu(false); }}
                className={`w-full flex items-center gap-2.5 px-4 py-3 text-sm cursor-pointer transition-colors ${darkMode ? 'text-slate-200 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-50'}`}
              >
                <i className="ri-information-line text-slate-400" /> Group Info
              </button>
              <button
                onClick={() => { setShowSearch(true); setShowMenu(false); }}
                className={`w-full flex items-center gap-2.5 px-4 py-3 text-sm cursor-pointer transition-colors ${darkMode ? 'text-slate-200 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-50'}`}
              >
                <i className="ri-search-line text-slate-400" /> Search
              </button>
              <div className={`mx-3 border-t ${darkMode ? 'border-slate-700' : 'border-slate-100'}`} />
              <button
                onClick={() => { onLeaveGroup(group.id); setShowMenu(false); }}
                className={`w-full flex items-center gap-2.5 px-4 py-3 text-sm cursor-pointer transition-colors text-red-500 ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-50'}`}
              >
                <i className="ri-logout-box-line" /> Leave Group
              </button>
            </div>
          )}
        </div>
      </div>

      {showSearch && (
        <ChatSearchBar messages={messages} darkMode={darkMode} onClose={() => setShowSearch(false)} onJumpTo={handleJumpTo} />
      )}

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4 relative"
        style={{
          backgroundImage: darkMode
            ? 'radial-gradient(circle, rgba(255,255,255,0.02) 1px, transparent 1px)'
            : 'radial-gradient(circle, rgba(99,102,241,0.06) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      >
        {loadingMore && (
          <div className="flex justify-center mb-3">
            <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${darkMode ? 'bg-slate-800 text-slate-400' : 'bg-white text-slate-500 shadow-sm'}`}>
              <i className="ri-loader-4-line animate-spin mr-1.5" />Loading...
            </span>
          </div>
        )}

        {loading ? (
          skeletons.map((isOwn, i) => <MessageSkeleton key={i} isOwn={isOwn} darkMode={darkMode} index={i} />)
        ) : (
          <>
            <div className="flex justify-center mb-5">
              <span className={`text-[11px] font-semibold px-3 py-1 rounded-full tracking-wide ${darkMode ? 'bg-slate-800 text-slate-500' : 'bg-white text-slate-400 shadow-sm'}`}>
                TODAY
              </span>
            </div>
            {messages.map(msg => (
              <GroupMessageBubble
                key={msg.id}
                message={msg}
                darkMode={darkMode}
                highlight={highlightId === msg.id}
                onReply={handleReply}
                onDelete={handleDelete}
                onJumpToMessage={handleJumpTo}
              />
            ))}
            {typing && <TypingIndicator name={typing} darkMode={darkMode} />}
          </>
        )}
        <div ref={messagesEndRef} />

        {showScrollBtn && (
          <button
            onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
            className="fixed bottom-24 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-300/40 cursor-pointer hover:shadow-indigo-400/50 transition-all z-10"
          >
            <i className="ri-arrow-down-line text-lg" />
          </button>
        )}
      </div>

      <MessageInput
        onSendText={handleSendText}
        onSendVoice={handleSendVoice}
        onSendImage={handleSendImage}
        onTyping={handleTyping}
        isBlocked={false}
        darkMode={darkMode}
        replyTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
      />

      {showInfo && (
        <GroupInfoPanel
          group={group}
          isOpen={showInfo}
          onClose={() => setShowInfo(false)}
          darkMode={darkMode}
          onLeaveGroup={onLeaveGroup}
          onAddMembers={onAddMembers}
          onRemoveMember={onRemoveMember}
          onUpdateGroup={onUpdateGroup}
        />
      )}
    </div>
  );
}

interface BubbleProps {
  message: Message;
  darkMode: boolean;
  highlight?: boolean;
  onReply?: (message: Message) => void;
  onDelete?: (messageId: string) => void;
  onJumpToMessage?: (id: string) => void;
}

function GroupMessageBubble({ message, darkMode, highlight, onReply, onDelete, onJumpToMessage }: BubbleProps) {
  const [imgOpen, setImgOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const touchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { isOwn, type, text, duration, imageUrl, audioUrl, timestamp, status, senderName, senderAvatar, replyTo } = message;

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchTimerRef.current = setTimeout(() => {
      setContextMenu({ x: touch.clientX, y: touch.clientY });
    }, 500);
  };

  const handleTouchEnd = () => {
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
  };

  const isDeleted = type === 'deleted';

  if (type === 'system') {
    return (
      <div className="flex justify-center mb-2">
        <span className={`text-[11px] font-semibold px-3 py-1 rounded-full ${darkMode ? 'bg-slate-800 text-slate-500' : 'bg-white text-slate-400 shadow-sm'}`}>{text}</span>
      </div>
    );
  }

  const sentBubble = 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white';
  const recvBubble = darkMode ? 'bg-slate-800 text-slate-100' : 'bg-white text-slate-800 shadow-sm shadow-slate-200/80';

  return (
    <>
      <div
        className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}
        id={`msg-${message.id}`}
        onContextMenu={handleContextMenu}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchEnd}
      >
        <div className={`max-w-[72%] flex gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
          {!isOwn && (
            <div className="flex-shrink-0 mt-auto">
              {senderAvatar ? (
                <img src={senderAvatar} alt={senderName} className="w-7 h-7 rounded-full object-cover object-top" />
              ) : (
                <div className={`w-7 h-7 rounded-full flex items-center justify-center bg-gradient-to-br ${senderInitialColor(senderName ?? '')}`}>
                  <span className="text-white text-xs font-bold">{(senderName ?? '?')[0].toUpperCase()}</span>
                </div>
              )}
            </div>
          )}
          <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
            {!isOwn && senderName && (
              <span className="text-xs font-semibold text-indigo-500 mb-0.5 px-1">{senderName}</span>
            )}

            {replyTo && (
              <div
                onClick={() => onJumpToMessage?.(replyTo.id)}
                className={`mb-1 px-3 py-1.5 rounded-xl border-l-[3px] border-indigo-400 cursor-pointer max-w-full ${darkMode ? 'bg-slate-800/80' : 'bg-slate-100'}`}
              >
                <p className="text-xs font-semibold text-indigo-500 truncate">{replyTo.senderName}</p>
                <p className={`text-xs truncate mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {replyTo.type === 'deleted' ? '🚫 Message deleted' :
                   replyTo.type === 'voice' ? '🎤 Voice note' :
                   replyTo.type === 'image' ? '📷 Photo' :
                   replyTo.text}
                </p>
              </div>
            )}

            <div
              className={`px-4 py-2.5 rounded-2xl transition-all duration-200 ${
                highlight ? 'ring-2 ring-yellow-400 ring-offset-1' : ''
              } ${
                isOwn ? `${sentBubble} rounded-br-sm` : `${recvBubble} rounded-bl-sm`
              } ${type === 'image' ? '!p-1.5' : ''}`}
            >
              {isDeleted ? (
                <p className={`text-sm italic flex items-center gap-1.5 ${isOwn ? 'text-white/50' : darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  <i className="ri-forbid-line" /> Message deleted
                </p>
              ) : type === 'voice' && duration ? (
                <GroupAudioPlayer duration={duration} audioUrl={audioUrl} isOwn={isOwn} />
              ) : type === 'image' && imageUrl ? (
                <img
                  src={imageUrl}
                  alt="sent image"
                  className="rounded-xl max-w-[220px] max-h-[220px] object-cover cursor-pointer"
                  onClick={() => setImgOpen(true)}
                />
              ) : (
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{text}</p>
              )}
            </div>

            <div className={`flex items-center gap-1 mt-0.5 px-1 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
              <span className={`text-[11px] ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{timestamp}</span>
              {isOwn && !isDeleted && (
                status === 'seen'
                  ? <i className="ri-check-double-line text-[10px] text-violet-200" />
                  : status === 'delivered'
                  ? <i className="ri-check-double-line text-[10px] text-white/60" />
                  : <i className="ri-check-line text-[10px] text-white/60" />
              )}
            </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setImgOpen(false)}>
          <img src={imageUrl} alt="full" className="max-w-[90vw] max-h-[90vh] rounded-2xl object-contain shadow-2xl" />
          <button className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 text-white cursor-pointer hover:bg-white/30">
            <i className="ri-close-line text-xl" />
          </button>
        </div>
      )}
    </>
  );
}

function GroupAudioPlayer({ duration, audioUrl, isOwn }: { duration: string; audioUrl?: string; isOwn: boolean }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [displayTime, setDisplayTime] = useState(duration);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const bars = [3, 5, 8, 6, 4, 7, 9, 5, 3, 6, 8, 4, 7, 5, 3, 8, 5, 3, 6, 7, 4, 9, 5, 8, 3, 6, 4, 7];

  useEffect(() => {
    if (!audioUrl) return;
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    audio.onloadedmetadata = () => {
      const secs = Math.floor(audio.duration);
      setDisplayTime(`${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`);
    };
    audio.ontimeupdate = () => {
      setProgress((audio.currentTime / audio.duration) * 100);
      const secs = Math.floor(audio.currentTime);
      setDisplayTime(`${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`);
    };
    audio.onended = () => {
      setPlaying(false);
      setProgress(0);
      const secs = Math.floor(audio.duration);
      setDisplayTime(`${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`);
    };
    return () => { audio.pause(); audioRef.current = null; };
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); } else { audioRef.current.play(); }
    setPlaying(!playing);
  };

  return (
    <div className="flex items-center gap-2.5 min-w-[160px]">
      <button onClick={togglePlay} disabled={!audioUrl} className={`w-8 h-8 flex items-center justify-center rounded-full cursor-pointer flex-shrink-0 disabled:opacity-40 transition-colors ${isOwn ? 'bg-white/20 hover:bg-white/30' : 'bg-indigo-100 hover:bg-indigo-200'}`}>
        <i className={`${playing ? 'ri-pause-fill' : 'ri-play-fill'} text-sm ${isOwn ? 'text-white' : 'text-indigo-600'}`} />
      </button>
      <div className="flex items-end gap-0.5 h-7 flex-1">
        {bars.map((h, i) => {
          const filled = (i / bars.length) * 100 <= progress;
          return (
            <div key={i} className={`rounded-full flex-1 transition-colors ${filled ? (isOwn ? 'bg-white/85' : 'bg-indigo-500') : (isOwn ? 'bg-white/30' : 'bg-indigo-200')}`} style={{ height: h * 2 + 'px' }} />
          );
        })}
      </div>
      <span className={`text-xs flex-shrink-0 tabular-nums ${isOwn ? 'text-white/70' : 'text-slate-500'}`}>{displayTime}</span>
    </div>
  );
}
