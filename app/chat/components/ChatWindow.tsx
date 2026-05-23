'use client';
import { useState, useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import Avatar from './ui/Avatar';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import BlockModal from './BlockModal';
import ChatSearchBar from './ChatSearchBar';
import ProfileModal from './ProfileModal';
import { MessageSkeleton } from './ui/Skeleton';
import { useChatContext } from '../ChatContext';
import { Conversation, Message, ReplyMessage, User } from '../data/mockData';

interface Props {
  conversation: Conversation;
  socket: Socket | null;
  onBlock: (id: string) => void;
  darkMode: boolean;
  onBack: () => void;
  openSearch?: boolean;
  onSearchClose?: () => void;
}

export default function ChatWindow({ conversation, socket, onBlock, darkMode, onBack, openSearch, onSearchClose }: Props) {
  const { currentUserId, users } = useChatContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [typing, setTyping] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<ReplyMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Open search bar when triggered from conversation list
  useEffect(() => {
    if (openSearch) {
      setShowSearch(true);
      onSearchClose?.();
    }
  }, [openSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevScrollHeightRef = useRef(0);
  const isBlockedRef = useRef(conversation.isBlocked);
  isBlockedRef.current = conversation.isBlocked;

  const contactUser: User = users.find(u => u.id === conversation.userId) ?? {
    id: conversation.userId, name: conversation.name,
    avatar: conversation.avatar, online: conversation.online, bio: '',
  };

  useEffect(() => {
    if (!socket) return;
    setMessages([]);
    setTyping(false);
    setShowSearch(false);
    setHighlightId(null);
    setReplyingTo(null);
    setLoading(true);
    setHasMore(false);

    socket.emit('join_conversation', conversation.id);
    socket.emit('get_messages', { conversationId: conversation.id });
    socket.emit('mark_seen', { conversationId: conversation.id });
  }, [socket, conversation.id]);

  // Reconnect: re-join room
  useEffect(() => {
    if (!socket) return;
    const onReconnect = () => socket.emit('join_conversation', conversation.id);
    socket.on('connect', onReconnect);
    return () => { socket.off('connect', onReconnect); };
  }, [socket, conversation.id]);

  useEffect(() => {
    if (!socket) return;

    const onMessagesLoaded = ({ conversationId, messages: msgs, hasMore: more, prepend }: {
      conversationId: string; messages: Message[]; hasMore: boolean; prepend: boolean;
    }) => {
      if (conversationId !== conversation.id) return;
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

    const onNewMessage = ({ conversationId, message }: { conversationId: string; message: Message }) => {
      if (conversationId === conversation.id && !isBlockedRef.current) {
        setMessages(prev => [...prev, { ...message, isOwn: message.senderId === currentUserId }]);
        socket.emit('mark_seen', { conversationId: conversation.id });
      }
    };

    const onMessageDeleted = ({ conversationId, messageId }: { conversationId: string; messageId: string }) => {
      if (conversationId === conversation.id) {
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, type: 'deleted' as const, text: undefined } : m));
      }
    };

    const onUserTyping = ({ conversationId, userId }: { conversationId: string; userId: string }) => {
      if (conversationId === conversation.id && userId !== currentUserId && !isBlockedRef.current) {
        setTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setTyping(false), 3000);
      }
    };

    const onMessagesSeen = ({ conversationId }: { conversationId: string }) => {
      if (conversationId === conversation.id) {
        setMessages(prev => prev.map(m => m.isOwn ? { ...m, status: 'seen' } : m));
      }
    };

    socket.on('messages_loaded', onMessagesLoaded);
    socket.on('new_message', onNewMessage);
    socket.on('message_deleted', onMessageDeleted);
    socket.on('user_typing', onUserTyping);
    socket.on('messages_seen', onMessagesSeen);

    return () => {
      socket.off('messages_loaded', onMessagesLoaded);
      socket.off('new_message', onNewMessage);
      socket.off('message_deleted', onMessageDeleted);
      socket.off('user_typing', onUserTyping);
      socket.off('messages_seen', onMessagesSeen);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [socket, conversation.id, currentUserId]);

  useEffect(() => {
    if (!loading) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing, loading]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 200);
    if (el.scrollTop < 80 && hasMore && !loadingMore) {
      prevScrollHeightRef.current = el.scrollHeight;
      setLoadingMore(true);
      socket?.emit('get_messages', { conversationId: conversation.id, before: messages[0]?.id });
    }
  };

  const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleSendText = (text: string, replyToId?: string) => {
    if (!socket) return;
    setMessages(prev => [...prev, {
      id: `temp_${Date.now()}`, senderId: currentUserId, text, type: 'text',
      timestamp: now(), status: 'sent', isOwn: true,
      replyTo: replyToId && replyingTo ? replyingTo : undefined,
    }]);
    socket.emit('send_message', { conversationId: conversation.id, text, type: 'text', replyToId });
    setReplyingTo(null);
  };

  const handleSendVoice = (duration: string, audioUrl: string, replyToId?: string) => {
    if (!socket) return;
    setMessages(prev => [...prev, {
      id: `temp_${Date.now()}`, senderId: currentUserId, type: 'voice', duration, audioUrl,
      timestamp: now(), status: 'sent', isOwn: true,
    }]);
    socket.emit('send_message', { conversationId: conversation.id, type: 'voice', duration, audioUrl, replyToId });
    setReplyingTo(null);
  };

  const handleSendImage = (dataUrl: string, replyToId?: string) => {
    if (!socket) return;
    setMessages(prev => [...prev, {
      id: `temp_${Date.now()}`, senderId: currentUserId, type: 'image', imageUrl: dataUrl,
      timestamp: now(), status: 'sent', isOwn: true,
    }]);
    socket.emit('send_message', { conversationId: conversation.id, type: 'image', imageUrl: dataUrl, replyToId });
    setReplyingTo(null);
  };

  const handleTyping = () => socket?.emit('typing', { conversationId: conversation.id });

  const handleReply = (message: Message) => {
    setReplyingTo({
      id: message.id,
      senderName: message.isOwn ? 'You' : conversation.name,
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

  const handleBlockConfirm = () => { onBlock(conversation.id); setShowBlockModal(false); };

  const skeletons = [false, true, false, true, true, false];

  const hdrBtn = `w-9 h-9 flex items-center justify-center rounded-xl cursor-pointer transition-colors ${darkMode ? 'hover:bg-slate-700 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`;

  return (
    <div className={`flex flex-col h-full ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      {/* Header */}
      <div className={`relative z-10 flex items-center gap-3 px-4 py-3 border-b backdrop-blur-sm ${darkMode ? 'border-slate-800 bg-slate-900/95' : 'border-slate-200 bg-white/95'}`}>
        <button onClick={onBack} className={`md:hidden ${hdrBtn}`}>
          <i className="ri-arrow-left-s-line text-xl" />
        </button>
        <button onClick={() => setShowProfile(true)} className="cursor-pointer">
          <Avatar src={conversation.avatar} name={conversation.name} size="lg" online={conversation.online} />
        </button>
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setShowProfile(true)}>
          <h2 className={`font-semibold text-[15px] truncate ${darkMode ? 'text-white' : 'text-slate-900'}`}>{conversation.name}</h2>
          <p className={`text-xs font-medium ${conversation.online ? 'text-emerald-500' : darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            {conversation.isBlocked ? 'Blocked' : conversation.online ? '● Online' : 'Last seen recently'}
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
              <button onClick={() => { setShowProfile(true); setShowMenu(false); }} className={`w-full flex items-center gap-2.5 px-4 py-3 text-sm cursor-pointer transition-colors ${darkMode ? 'text-slate-200 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-50'}`}>
                <i className="ri-user-3-line text-slate-400" /> View profile
              </button>
              <button onClick={() => { setShowSearch(true); setShowMenu(false); }} className={`w-full flex items-center gap-2.5 px-4 py-3 text-sm cursor-pointer transition-colors ${darkMode ? 'text-slate-200 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-50'}`}>
                <i className="ri-search-line text-slate-400" /> Search
              </button>
              <div className={`mx-3 border-t ${darkMode ? 'border-slate-700' : 'border-slate-100'}`} />
              <button onClick={() => { setShowBlockModal(true); setShowMenu(false); }} className={`w-full flex items-center gap-2.5 px-4 py-3 text-sm cursor-pointer transition-colors ${conversation.isBlocked ? 'text-emerald-500' : 'text-red-500'} ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-50'}`}>
                <i className={conversation.isBlocked ? 'ri-lock-unlock-line' : 'ri-forbid-line'} />
                {conversation.isBlocked ? 'Unblock' : 'Block'}
              </button>
            </div>
          )}
        </div>
      </div>

      {showSearch && (
        <ChatSearchBar messages={messages} darkMode={darkMode} onClose={() => setShowSearch(false)} onJumpTo={handleJumpTo} />
      )}

      {/* Messages */}
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
              <MessageBubble
                key={msg.id}
                message={msg}
                darkMode={darkMode}
                highlight={highlightId === msg.id}
                onReply={handleReply}
                onDelete={handleDelete}
                onJumpToMessage={handleJumpTo}
              />
            ))}
            {typing && <TypingIndicator darkMode={darkMode} />}
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

      {conversation.isBlocked && (
        <div className={`px-4 py-6 flex flex-col items-center gap-3 border-t ${darkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
          <div className={`w-12 h-12 flex items-center justify-center rounded-full ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
            <i className="ri-forbid-line text-2xl text-slate-400" />
          </div>
          <p className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>You have blocked this user</p>
          <button onClick={() => setShowBlockModal(true)} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-sm font-semibold transition-all cursor-pointer whitespace-nowrap shadow-sm">
            Unblock
          </button>
        </div>
      )}

      {!conversation.isBlocked && (
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
      )}

      <BlockModal isOpen={showBlockModal} onClose={() => setShowBlockModal(false)} onConfirm={handleBlockConfirm} userName={conversation.name} isBlocked={conversation.isBlocked} />
      <ProfileModal user={contactUser} isOpen={showProfile} onClose={() => setShowProfile(false)} darkMode={darkMode} />
    </div>
  );
}
