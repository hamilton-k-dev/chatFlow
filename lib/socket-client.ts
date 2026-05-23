"use client";
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(userId: string): Socket {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001", {
      auth: { userId },
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
