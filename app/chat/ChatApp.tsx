'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import ConversationsList from './components/ConversationsList';
import ChatWindow from './components/ChatWindow';
import GroupChatWindow from './components/GroupChatWindow';
import NewChatModal from './components/NewChatModal';
import CreateGroupModal from './components/CreateGroupModal';
import SettingsPanel from './components/SettingsPanel';
import GlobalSearchModal from './components/GlobalSearchModal';
import { ChatContext } from './ChatContext';
import { getSocket, disconnectSocket } from '@/lib/socket-client';
import { signOutAction } from '@/lib/actions-auth';
import {
  Conversation,
  GroupConversation,
  AnyConversation,
  User,
} from './data/mockData';

type View = 'list' | 'chat' | 'settings';

interface AuthUser {
  id: string;
  name: string;
  avatar: string;
  email: string;
}

interface Props {
  authUser: AuthUser;
}

export default function ChatApp({ authUser }: Props) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [groups, setGroups] = useState<GroupConversation[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeIdRef = useRef<string | null>(null);
  activeIdRef.current = activeId;
  const [darkMode, setDarkMode] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [connected, setConnected] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [pendingSearch, setPendingSearch] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<View>('list');

  const allConversations: AnyConversation[] = [...conversations, ...groups];
  const activeConversation = conversations.find(c => c.id === activeId) || null;
  const activeGroup = groups.find(g => g.id === activeId) || null;

  useEffect(() => {
    const s = getSocket(authUser.id);
    setSocket(s);

    s.on('init', ({ conversations: convs, groups: grps, users: usrs }) => {
      setConversations(convs);
      setGroups(grps);
      setUsers(usrs);
      setInitialized(true);
    });

    s.on('online_users', (onlineIds: string[]) => {
      setConversations(prev =>
        prev.map(c => ({ ...c, online: c.isBlocked ? false : onlineIds.includes(c.userId) }))
      );
      setUsers(prev => prev.map(u => ({ ...u, online: onlineIds.includes(u.id) })));
    });

    s.on('new_message', ({ conversationId, message }: { conversationId: string; message: { text?: string; type: string; timestamp: string } }) => {
      setConversations(prev =>
        prev.map(c =>
          c.id === conversationId
            ? {
                ...c,
                lastMessage: message.text ?? `[${message.type}]`,
                timestamp: message.timestamp,
              }
            : c
        )
      );
    });

    s.on('conversation_updated', ({ conversationId, lastMessage, timestamp, unread }: { conversationId: string; lastMessage: string; timestamp: string; unread: number }) => {
      setConversations(prev =>
        prev.map(c =>
          c.id === conversationId && !c.isBlocked
            ? { ...c, lastMessage, timestamp, unread: c.id === activeIdRef.current ? 0 : c.unread + unread }
            : c
        )
      );
    });

    s.on('new_group_message', ({ groupId, message }: { groupId: string; message: { text?: string; type: string; timestamp: string } }) => {
      setGroups(prev =>
        prev.map(g =>
          g.id === groupId
            ? {
                ...g,
                lastMessage: message.text ?? `[${message.type}]`,
                timestamp: message.timestamp,
              }
            : g
        )
      );
    });

    s.on('group_updated', ({ groupId, lastMessage, timestamp, unread }: { groupId: string; lastMessage: string; timestamp: string; unread: number }) => {
      setGroups(prev =>
        prev.map(g =>
          g.id === groupId
            ? { ...g, lastMessage, timestamp, unread: g.id === activeIdRef.current ? 0 : g.unread + unread }
            : g
        )
      );
    });

    s.on('conversation_started', (conv: Conversation) => {
      setConversations(prev => {
        if (prev.find(c => c.id === conv.id)) return prev;
        return [conv, ...prev];
      });
      setActiveId(conv.id);
      setMobileView('chat');
    });

    s.on('group_created', (group: GroupConversation & { systemMessage?: unknown }) => {
      const { systemMessage: _, ...groupData } = group as GroupConversation & { systemMessage?: unknown };
      setGroups(prev => {
        if (prev.find(g => g.id === groupData.id)) return prev;
        return [groupData, ...prev];
      });
      if (groupData.memberIds.includes(authUser.id)) {
        setActiveId(groupData.id);
        setMobileView('chat');
      }
    });

    s.on('group_left', ({ groupId }: { groupId: string }) => {
      setGroups(prev => prev.filter(g => g.id !== groupId));
      setActiveId(prev => (prev === groupId ? null : prev));
      setMobileView('list');
    });

    s.on('group_members_updated', ({ groupId, memberIds }: { groupId: string; memberIds: string[] }) => {
      setGroups(prev => prev.map(g => g.id === groupId ? { ...g, memberIds } : g));
    });

    s.on('group_member_removed', ({ groupId, memberId }: { groupId: string; memberId: string }) => {
      setGroups(prev =>
        prev.map(g =>
          g.id === groupId
            ? { ...g, memberIds: g.memberIds.filter(id => id !== memberId) }
            : g
        )
      );
    });

    s.on('group_info_updated', ({ groupId, name, description, avatar }: { groupId: string; name: string; description: string; avatar?: string }) => {
      setGroups(prev =>
        prev.map(g =>
          g.id === groupId
            ? { ...g, name, description, ...(avatar ? { avatar } : {}) }
            : g
        )
      );
    });

    s.on('added_to_group', () => {
      // server sends group_created to all new members
    });

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);

    return () => {
      s.off('init');
      s.off('online_users');
      s.off('new_message');
      s.off('conversation_updated');
      s.off('new_group_message');
      s.off('group_updated');
      s.off('conversation_started');
      s.off('group_created');
      s.off('group_left');
      s.off('group_members_updated');
      s.off('group_member_removed');
      s.off('group_info_updated');
      s.off('added_to_group');
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
      disconnectSocket();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser.id]);

  useEffect(() => {
    const total = conversations.reduce((s, c) => s + (c.unread ?? 0), 0)
      + groups.reduce((s, g) => s + (g.unread ?? 0), 0);
    document.title = total > 0 ? `(${total}) ChatFlow` : 'ChatFlow';
  }, [conversations, groups]);

  const handleSelectConversation = useCallback((id: string) => {
    setActiveId(id);
    setConversations(prev => prev.map(c => c.id === id ? { ...c, unread: 0 } : c));
    setGroups(prev => prev.map(g => g.id === id ? { ...g, unread: 0 } : g));
    setMobileView('chat');
  }, []);

  const handleBlock = useCallback((id: string) => {
    setConversations(prev => prev.map(c => c.id === id ? { ...c, isBlocked: !c.isBlocked } : c));
    if (socket) {
      const conv = conversations.find(c => c.id === id);
      if (conv) {
        socket.emit(conv.isBlocked ? 'unblock_user' : 'block_user', { conversationId: id });
      }
    }
  }, [socket, conversations]);

  const handleUnblock = useCallback((id: string) => {
    setConversations(prev => prev.map(c => c.id === id ? { ...c, isBlocked: false } : c));
    if (socket) socket.emit('unblock_user', { conversationId: id });
  }, [socket]);

  const handleStartChat = useCallback((userId: string) => {
    if (!socket) return;
    const existing = conversations.find(c => c.userId === userId);
    if (existing) { handleSelectConversation(existing.id); return; }
    socket.emit('start_conversation', { targetUserId: userId });
    setShowNewChat(false);
  }, [socket, conversations, handleSelectConversation]);

  const handleCreateGroup = useCallback((name: string, description: string, memberIds: string[], image?: string) => {
    if (!socket) return;
    socket.emit('create_group', { name, description, memberIds, avatar: image });
    setShowNewGroup(false);
  }, [socket]);

  const handleLeaveGroup = useCallback((groupId: string) => {
    if (!socket) return;
    socket.emit('leave_group', { groupId });
  }, [socket]);

  const handleAddMembers = useCallback((groupId: string, memberIds: string[]) => {
    if (!socket) return;
    socket.emit('add_members', { groupId, memberIds });
  }, [socket]);

  const handleRemoveMember = useCallback((groupId: string, memberId: string) => {
    if (!socket) return;
    socket.emit('remove_member', { groupId, memberId });
  }, [socket]);

  const handleUpdateGroup = useCallback((groupId: string, name: string, description: string, image?: string) => {
    if (!socket) return;
    socket.emit('update_group', { groupId, name, description, avatar: image });
  }, [socket]);

  const handleLogout = useCallback(async () => {
    disconnectSocket();
    await signOutAction();
  }, []);

  const settingsProps = {
    onClose: () => setMobileView(activeId ? 'chat' : 'list'),
    darkMode,
    onToggleDark: () => setDarkMode(!darkMode),
    conversations,
    onUnblock: handleUnblock,
    currentUser: { name: authUser.name, avatar: authUser.avatar },
    onLogout: handleLogout,
  };

  const handleSearchInChat = useCallback((convId: string) => {
    handleSelectConversation(convId);
    setPendingSearch(convId);
  }, [handleSelectConversation]);

  const listProps = {
    conversations: allConversations,
    activeId,
    onSelect: handleSelectConversation,
    onNewChat: () => setShowNewChat(true),
    onNewGroup: () => setShowNewGroup(true),
    onGlobalSearch: () => setShowGlobalSearch(true),
    onBlock: handleBlock,
    onSearchInChat: handleSearchInChat,
    loading: !initialized,
    darkMode,
    currentUserAvatar: authUser.avatar,
    currentUserName: authUser.name,
    onOpenSettings: () => setMobileView('settings'),
  };

  return (
    <ChatContext.Provider value={{
      currentUserId: authUser.id,
      currentUserName: authUser.name,
      currentUserAvatar: authUser.avatar,
      users,
    }}>
      {!connected && (
        <div className="fixed top-0 inset-x-0 z-50 flex items-center justify-center gap-2 py-2.5 bg-amber-500 text-white text-xs font-semibold tracking-wide shadow-md">
          <i className="ri-wifi-off-line" /> Connection lost — reconnecting...
        </div>
      )}
      <div className={`flex h-screen overflow-hidden ${darkMode ? 'bg-slate-950' : 'bg-slate-100'}`}>
        <div className={`flex-shrink-0 w-full md:w-80 ${mobileView === 'list' ? 'flex' : 'hidden'} md:flex flex-col h-full`}>
          {mobileView === 'settings' ? (
            <SettingsPanel {...settingsProps} />
          ) : (
            <ConversationsList {...listProps} />
          )}
        </div>

        <div className={`flex-1 flex ${mobileView !== 'list' ? 'flex' : 'hidden'} md:flex h-full overflow-hidden`}>
          {mobileView === 'settings' ? (
            <div className="flex-1">
              <SettingsPanel {...settingsProps} />
            </div>
          ) : activeGroup ? (
            <div className="flex-1">
              <GroupChatWindow
                group={activeGroup}
                socket={socket}
                onBack={() => setMobileView('list')}
                darkMode={darkMode}
                onLeaveGroup={handleLeaveGroup}
                onAddMembers={handleAddMembers}
                onRemoveMember={handleRemoveMember}
                onUpdateGroup={handleUpdateGroup}
              />
            </div>
          ) : activeConversation ? (
            <div className="flex-1">
              <ChatWindow
                conversation={activeConversation}
                socket={socket}
                onBlock={handleBlock}
                darkMode={darkMode}
                onBack={() => setMobileView('list')}
                openSearch={pendingSearch === activeConversation.id}
                onSearchClose={() => setPendingSearch(null)}
              />
            </div>
          ) : (
            <div className={`flex-1 flex flex-col items-center justify-center gap-5 ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}
              style={{
                backgroundImage: darkMode
                  ? 'radial-gradient(circle, rgba(255,255,255,0.02) 1px, transparent 1px)'
                  : 'radial-gradient(circle, rgba(99,102,241,0.06) 1px, transparent 1px)',
                backgroundSize: '28px 28px',
              }}
            >
              <div className="w-20 h-20 flex items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-xl shadow-indigo-300/30">
                <i className="ri-chat-3-fill text-4xl text-white" />
              </div>
              <div className="text-center">
                <h2 className={`text-xl font-bold mb-1.5 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  Hello, {authUser.name} 👋
                </h2>
                <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Select a conversation or start a new one
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowNewChat(true)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-semibold transition-all cursor-pointer whitespace-nowrap text-sm shadow-sm shadow-indigo-200"
                >
                  New Chat
                </button>
                <button
                  onClick={() => setShowNewGroup(true)}
                  className={`px-5 py-2.5 rounded-xl border font-semibold transition-colors cursor-pointer whitespace-nowrap text-sm ${darkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-white'}`}
                >
                  New Group
                </button>
              </div>
            </div>
          )}

          <div className={`hidden lg:flex flex-col w-72 border-l ${darkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
            <SettingsPanel {...settingsProps} onClose={() => {}} />
          </div>
        </div>

        <NewChatModal
          isOpen={showNewChat}
          onClose={() => setShowNewChat(false)}
          users={users}
          onStartChat={handleStartChat}
          darkMode={darkMode}
        />

        <CreateGroupModal
          isOpen={showNewGroup}
          onClose={() => setShowNewGroup(false)}
          users={users}
          onCreateGroup={handleCreateGroup}
          darkMode={darkMode}
        />

        <GlobalSearchModal
          isOpen={showGlobalSearch}
          onClose={() => setShowGlobalSearch(false)}
          socket={socket}
          onSelectConversation={handleSelectConversation}
          darkMode={darkMode}
        />
      </div>
    </ChatContext.Provider>
  );
}
