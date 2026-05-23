"use client";
import { createContext, useContext } from "react";
import { User } from "./data/mockData";

interface ChatContextValue {
  currentUserId: string;
  currentUserName: string;
  currentUserAvatar: string;
  users: User[];
}

export const ChatContext = createContext<ChatContextValue>({
  currentUserId: "",
  currentUserName: "",
  currentUserAvatar: "",
  users: [],
});

export function useChatContext() {
  return useContext(ChatContext);
}
