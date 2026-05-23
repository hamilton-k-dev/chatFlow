export type MessageStatus = 'sent' | 'delivered' | 'seen';
export type MessageType = 'text' | 'voice' | 'image' | 'system' | 'deleted';

export interface ReplyMessage {
  id: string;
  senderName: string;
  text?: string;
  type: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName?: string;
  senderAvatar?: string;
  text?: string;
  type: MessageType;
  duration?: string;
  imageUrl?: string;
  audioUrl?: string;
  timestamp: string;
  status: MessageStatus;
  isOwn: boolean;
  replyTo?: ReplyMessage;
}

export interface Conversation {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  online: boolean;
  isBlocked: boolean;
  isGroup?: false;
}

export interface GroupConversation {
  id: string;
  isGroup: true;
  name: string;
  avatar: string;
  description: string;
  memberIds: string[];
  adminIds: string[];
  lastMessage: string;
  timestamp: string;
  unread: number;
  isMuted?: boolean;
}

export type AnyConversation = Conversation | GroupConversation;

export interface User {
  id: string;
  name: string;
  avatar: string;
  online: boolean;
  bio: string;
}
