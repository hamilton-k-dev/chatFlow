import { Server, Socket } from "socket.io";
import { PrismaClient } from "../generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const onlineUsers = new Set<string>();

// In-memory block cache: "userA:userB" means A and B are in a blocked relationship.
// Stored bidirectionally so lookups are O(1).
const blockedPairs = new Set<string>();

function blockKey(a: string, b: string) { return `${a}:${b}`; }
function cacheBlock(a: string, b: string) {
  blockedPairs.add(blockKey(a, b));
  blockedPairs.add(blockKey(b, a));
}
function uncacheBlock(a: string, b: string) {
  blockedPairs.delete(blockKey(a, b));
  blockedPairs.delete(blockKey(b, a));
}
function isBlocked(a: string, b: string) { return blockedPairs.has(blockKey(a, b)); }

async function initBlockCache() {
  const blocks = await prisma.conversationMember.findMany({
    where: { isBlocked: true },
    include: { conversation: { select: { members: { select: { userId: true } } } } },
  });
  for (const cm of blocks) {
    const other = cm.conversation.members.find((m) => m.userId !== cm.userId);
    if (other) cacheBlock(cm.userId, other.userId);
  }
}

function formatTime(date: Date): string {
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();
  if (isToday) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (isYesterday) return "Yesterday";
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

type RawMsg = {
  id: string;
  senderId: string;
  type: string;
  text: string | null;
  imageUrl: string | null;
  audioUrl: string | null;
  duration: string | null;
  status: string;
  isDeleted: boolean;
  replyToId: string | null;
  replyTo: {
    id: string;
    type: string;
    text: string | null;
    isDeleted: boolean;
    sender: { name: string | null; email: string };
  } | null;
  createdAt: Date;
  sender: { id: string; name: string | null; email: string; image: string | null };
};

function formatMessageBase(msg: RawMsg) {
  const deleted = msg.isDeleted;
  return {
    id: msg.id,
    senderId: msg.senderId,
    senderName: msg.sender.name ?? msg.sender.email,
    senderAvatar: msg.sender.image ?? "",
    text: deleted ? undefined : (msg.text ?? undefined),
    type: deleted ? "deleted" : msg.type,
    duration: deleted ? undefined : (msg.duration ?? undefined),
    imageUrl: deleted ? undefined : (msg.imageUrl ?? undefined),
    audioUrl: deleted ? undefined : (msg.audioUrl ?? undefined),
    timestamp: formatTime(msg.createdAt),
    status: msg.status,
    replyTo: msg.replyTo
      ? {
          id: msg.replyTo.id,
          senderName: msg.replyTo.sender.name ?? msg.replyTo.sender.email,
          text: msg.replyTo.isDeleted ? undefined : (msg.replyTo.text ?? undefined),
          type: msg.replyTo.isDeleted ? "deleted" : msg.replyTo.type,
        }
      : undefined,
  };
}

function formatMessage(msg: RawMsg, viewerUserId: string) {
  return { ...formatMessageBase(msg), isOwn: msg.senderId === viewerUserId };
}

function formatMessageForBroadcast(msg: RawMsg) {
  return { ...formatMessageBase(msg), isOwn: false };
}

const replyInclude = {
  sender: true,
  replyTo: {
    include: { sender: { select: { name: true, email: true } } },
  },
} as const;

async function loadConversations(userId: string) {
  const members = await prisma.conversationMember.findMany({
    where: { userId },
    include: {
      conversation: {
        include: {
          members: { include: { user: true } },
          messages: { orderBy: { createdAt: "desc" }, take: 1, include: { sender: true } },
        },
      },
    },
    orderBy: { conversation: { updatedAt: "desc" } },
  });

  return members.map((cm) => {
    const conv = cm.conversation;
    const other = conv.members.find((m) => m.userId !== userId);
    const lastMsg = conv.messages[0];
    return {
      id: conv.id,
      userId: other?.userId ?? "",
      name: other?.user.name ?? other?.user.email ?? "Unknown",
      avatar: other?.user.image ?? "",
      lastMessage: lastMsg?.text ?? (lastMsg ? `[${lastMsg.type}]` : "No messages yet"),
      timestamp: lastMsg ? formatTime(lastMsg.createdAt) : "",
      unread: 0,
      online: other ? (onlineUsers.has(other.userId) && !isBlocked(userId, other.userId)) : false,
      isBlocked: cm.isBlocked,
    };
  });
}

async function loadGroups(userId: string) {
  const members = await prisma.groupMember.findMany({
    where: { userId },
    include: {
      group: {
        include: {
          members: { include: { user: true } },
          messages: { orderBy: { createdAt: "desc" }, take: 1, include: { sender: true } },
        },
      },
    },
    orderBy: { group: { updatedAt: "desc" } },
  });

  return members.map((gm) => {
    const group = gm.group;
    const lastMsg = group.messages[0];
    const adminIds = group.members.filter((m) => m.isAdmin).map((m) => m.userId);
    const senderName = lastMsg?.sender.name ?? lastMsg?.sender.email ?? "";
    const lastText = lastMsg?.text ?? (lastMsg ? `[${lastMsg.type}]` : "");
    return {
      id: group.id,
      isGroup: true as const,
      name: group.name,
      avatar: group.avatar ?? "",
      description: group.description ?? "",
      memberIds: group.members.map((m) => m.userId),
      adminIds,
      lastMessage: lastMsg ? `${senderName}: ${lastText}` : "No messages yet",
      timestamp: lastMsg ? formatTime(lastMsg.createdAt) : "",
      unread: 0,
    };
  });
}

async function loadUsers(excludeUserId: string) {
  const users = await prisma.user.findMany({
    where: { id: { not: excludeUserId } },
    select: { id: true, name: true, email: true, image: true },
  });
  return users.map((u) => ({
    id: u.id,
    name: u.name ?? u.email,
    avatar: u.image ?? "",
    online: onlineUsers.has(u.id) && !isBlocked(excludeUserId, u.id),
    bio: "",
  }));
}

// Synchronous — reads in-memory cache, zero DB queries.
function broadcastOnlineUsers(io: Server) {
  const onlineArray = Array.from(onlineUsers);
  for (const uid of onlineArray) {
    const visible = onlineArray.filter((id) => !isBlocked(uid, id));
    io.to(`user:${uid}`).emit("online_users", visible);
  }
}

export function setupSocketHandlers(io: Server) {
  // Warm the block cache once before handling any connection
  initBlockCache().catch(console.error);

  io.on("connection", async (socket: Socket) => {
    const userId = socket.handshake.auth.userId as string;
    if (!userId) { socket.disconnect(); return; }

    socket.join(`user:${userId}`);
    onlineUsers.add(userId);
    broadcastOnlineUsers(io);

    try {
      const [conversations, groups, users] = await Promise.all([
        loadConversations(userId),
        loadGroups(userId),
        loadUsers(userId),
      ]);
      socket.emit("init", { conversations, groups, users });
    } catch (e) {
      console.error("init error", e);
    }

    socket.on("disconnect", () => {
      onlineUsers.delete(userId);
      broadcastOnlineUsers(io);
    });

    // ─── DM messages ─────────────────────────────────────────────────────

    socket.on("join_conversation", (conversationId: string) => {
      socket.join(`conv:${conversationId}`);
    });

    socket.on("get_messages", async ({ conversationId, before }: { conversationId: string; before?: string }) => {
      try {
        let cursorWhere = {};
        if (before) {
          const cursor = await prisma.message.findUnique({ where: { id: before } });
          if (cursor) cursorWhere = { createdAt: { lt: cursor.createdAt } };
        }

        const messages = await prisma.message.findMany({
          where: { conversationId, ...cursorWhere },
          include: replyInclude,
          orderBy: { createdAt: "desc" },
          take: 41,
        });

        const hasMore = messages.length === 41;
        if (hasMore) messages.pop();
        const ordered = messages.reverse();

        socket.emit("messages_loaded", {
          conversationId,
          messages: ordered.map((m) => formatMessage(m, userId)),
          hasMore,
          prepend: !!before,
        });
      } catch (e) {
        console.error("get_messages error", e);
      }
    });

    socket.on(
      "send_message",
      async ({ conversationId, text, type, imageUrl, audioUrl, duration, replyToId }: {
        conversationId: string; text?: string; type: string;
        imageUrl?: string; audioUrl?: string; duration?: string; replyToId?: string;
      }) => {
        try {
          // 1 query: membership check + block check + members for broadcast (replaces 3 separate queries)
          const members = await prisma.conversationMember.findMany({ where: { conversationId } });
          if (!members.find((m) => m.userId === userId)) return;
          if (members.some((m) => m.isBlocked)) return;

          // 2 parallel queries: create message + bump conversation timestamp
          const [message] = await Promise.all([
            prisma.message.create({
              data: { conversationId, senderId: userId, type, text, imageUrl, audioUrl, duration, status: "sent", replyToId: replyToId ?? null },
              include: replyInclude,
            }),
            prisma.conversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } }),
          ]);

          const formatted = formatMessageForBroadcast(message);
          socket.broadcast.to(`conv:${conversationId}`).emit("new_message", { conversationId, message: formatted });

          // Reuse the already-fetched members list
          members.forEach((cm) => {
            io.to(`user:${cm.userId}`).emit("conversation_updated", {
              conversationId,
              lastMessage: text ?? `[${type}]`,
              timestamp: formatTime(message.createdAt),
              unread: cm.userId === userId ? 0 : 1,
            });
          });
        } catch (e) {
          console.error("send_message error", e);
        }
      }
    );

    socket.on("delete_message", async ({ messageId }: { messageId: string }) => {
      try {
        const message = await prisma.message.findUnique({ where: { id: messageId } });
        if (!message || message.senderId !== userId) return;

        await prisma.message.update({ where: { id: messageId }, data: { isDeleted: true } });

        if (message.conversationId) {
          io.to(`conv:${message.conversationId}`).emit("message_deleted", { conversationId: message.conversationId, messageId });
        } else if (message.groupId) {
          io.to(`group:${message.groupId}`).emit("message_deleted", { groupId: message.groupId, messageId });
        }
      } catch (e) {
        console.error("delete_message error", e);
      }
    });

    socket.on("typing", ({ conversationId }: { conversationId: string }) => {
      // Skip if this user is in a blocked relationship (cache check, no DB)
      const otherOnline = Array.from(onlineUsers).find(
        (id) => id !== userId && isBlocked(userId, id)
      );
      if (otherOnline) return;
      socket.to(`conv:${conversationId}`).emit("user_typing", { conversationId, userId });
    });

    socket.on("mark_seen", async ({ conversationId }: { conversationId: string }) => {
      try {
        await prisma.message.updateMany({
          where: { conversationId, senderId: { not: userId }, status: { not: "seen" } },
          data: { status: "seen" },
        });
        socket.to(`conv:${conversationId}`).emit("messages_seen", { conversationId, byUserId: userId });
      } catch {}
    });

    socket.on("block_user", async ({ conversationId }: { conversationId: string }) => {
      try {
        const [_, other] = await Promise.all([
          prisma.conversationMember.updateMany({ where: { conversationId, userId }, data: { isBlocked: true, blockedBy: userId } }),
          prisma.conversationMember.findFirst({ where: { conversationId, userId: { not: userId } } }),
        ]);
        if (other) cacheBlock(userId, other.userId);
        broadcastOnlineUsers(io);
      } catch {}
    });

    socket.on("unblock_user", async ({ conversationId }: { conversationId: string }) => {
      try {
        const [_, other] = await Promise.all([
          prisma.conversationMember.updateMany({ where: { conversationId, userId, blockedBy: userId }, data: { isBlocked: false, blockedBy: null } }),
          prisma.conversationMember.findFirst({ where: { conversationId, userId: { not: userId } } }),
        ]);
        if (other) uncacheBlock(userId, other.userId);
        broadcastOnlineUsers(io);
      } catch {}
    });

    socket.on("start_conversation", async ({ targetUserId }: { targetUserId: string }) => {
      try {
        const existing = await prisma.conversation.findFirst({
          where: { AND: [{ members: { some: { userId } } }, { members: { some: { userId: targetUserId } } }] },
          include: { members: { include: { user: true } }, messages: { orderBy: { createdAt: "desc" }, take: 1 } },
        });

        if (existing) {
          const other = existing.members.find((m) => m.userId !== userId);
          const lastMsg = existing.messages[0];
          socket.emit("conversation_started", {
            id: existing.id,
            userId: other?.userId ?? "",
            name: other?.user.name ?? other?.user.email ?? "Unknown",
            avatar: other?.user.image ?? "",
            lastMessage: lastMsg?.text ?? "No messages yet",
            timestamp: lastMsg ? formatTime(lastMsg.createdAt) : "",
            unread: 0,
            online: other ? onlineUsers.has(other.userId) : false,
            isBlocked: false,
          });
          return;
        }

        const conv = await prisma.conversation.create({
          data: { members: { create: [{ userId }, { userId: targetUserId }] } },
          include: { members: { include: { user: true } } },
        });

        const other = conv.members.find((m) => m.userId !== userId);
        const convData = {
          id: conv.id,
          userId: other?.userId ?? "",
          name: other?.user.name ?? other?.user.email ?? "Unknown",
          avatar: other?.user.image ?? "",
          lastMessage: "No messages yet",
          timestamp: "",
          unread: 0,
          online: other ? onlineUsers.has(other.userId) : false,
          isBlocked: false,
        };

        socket.emit("conversation_started", convData);

        const myUser = conv.members.find((m) => m.userId === userId);
        io.to(`user:${targetUserId}`).emit("conversation_started", {
          ...convData,
          userId: myUser?.userId ?? userId,
          name: myUser?.user.name ?? myUser?.user.email ?? "Unknown",
          avatar: myUser?.user.image ?? "",
          online: onlineUsers.has(userId),
        });
      } catch (e) {
        console.error("start_conversation error", e);
      }
    });

    socket.on("search_messages", async ({ query }: { query: string }) => {
      if (!query || query.trim().length < 2) return;
      try {
        const q = query.trim();
        const [dmMessages, groupMessages] = await Promise.all([
          prisma.message.findMany({
            where: {
              isDeleted: false,
              text: { contains: q, mode: "insensitive" },
              conversation: { members: { some: { userId } } },
            },
            include: { sender: true, conversation: { include: { members: { include: { user: true } } } } },
            orderBy: { createdAt: "desc" },
            take: 15,
          }),
          prisma.message.findMany({
            where: {
              isDeleted: false,
              text: { contains: q, mode: "insensitive" },
              group: { members: { some: { userId } } },
            },
            include: { sender: true, group: true },
            orderBy: { createdAt: "desc" },
            take: 15,
          }),
        ]);

        const results = [
          ...dmMessages.map((m) => {
            const other = m.conversation?.members.find((mem) => mem.userId !== userId);
            return {
              messageId: m.id,
              conversationId: m.conversationId,
              groupId: null,
              conversationName: other?.user.name ?? other?.user.email ?? "Unknown",
              conversationAvatar: other?.user.image ?? "",
              senderName: m.sender.name ?? m.sender.email,
              text: m.text ?? "",
              timestamp: formatTime(m.createdAt),
              isGroup: false,
            };
          }),
          ...groupMessages.map((m) => ({
            messageId: m.id,
            conversationId: null,
            groupId: m.groupId,
            conversationName: m.group?.name ?? "Unknown",
            conversationAvatar: m.group?.avatar ?? "",
            senderName: m.sender.name ?? m.sender.email,
            text: m.text ?? "",
            timestamp: formatTime(m.createdAt),
            isGroup: true,
          })),
        ];

        socket.emit("search_results", { query: q, results });
      } catch (e) {
        console.error("search_messages error", e);
      }
    });

    // ─── Group messages ───────────────────────────────────────────────────

    socket.on("join_group", (groupId: string) => {
      socket.join(`group:${groupId}`);
    });

    socket.on("get_group_messages", async ({ groupId, before }: { groupId: string; before?: string }) => {
      try {
        let cursorWhere = {};
        if (before) {
          const cursor = await prisma.message.findUnique({ where: { id: before } });
          if (cursor) cursorWhere = { createdAt: { lt: cursor.createdAt } };
        }

        const messages = await prisma.message.findMany({
          where: { groupId, ...cursorWhere },
          include: replyInclude,
          orderBy: { createdAt: "desc" },
          take: 41,
        });

        const hasMore = messages.length === 41;
        if (hasMore) messages.pop();
        const ordered = messages.reverse();

        socket.emit("group_messages_loaded", {
          groupId,
          messages: ordered.map((m) => formatMessage(m, userId)),
          hasMore,
          prepend: !!before,
        });
      } catch (e) {
        console.error("get_group_messages error", e);
      }
    });

    socket.on(
      "send_group_message",
      async ({ groupId, text, type, imageUrl, audioUrl, duration, replyToId }: {
        groupId: string; text?: string; type: string;
        imageUrl?: string; audioUrl?: string; duration?: string; replyToId?: string;
      }) => {
        try {
          const member = await prisma.groupMember.findUnique({ where: { groupId_userId: { groupId, userId } } });
          if (!member) return;

          const message = await prisma.message.create({
            data: { groupId, senderId: userId, type, text, imageUrl, audioUrl, duration, status: "sent", replyToId: replyToId ?? null },
            include: replyInclude,
          });

          await prisma.group.update({ where: { id: groupId }, data: { updatedAt: new Date() } });

          const formatted = formatMessageForBroadcast(message);
          socket.broadcast.to(`group:${groupId}`).emit("new_group_message", { groupId, message: formatted });

          const senderName = message.sender.name ?? message.sender.email ?? "";
          const lastText = text ?? `[${type}]`;
          const groupMembers = await prisma.groupMember.findMany({ where: { groupId } });
          groupMembers.forEach((gm) => {
            io.to(`user:${gm.userId}`).emit("group_updated", {
              groupId,
              lastMessage: `${senderName}: ${lastText}`,
              timestamp: formatTime(message.createdAt),
              unread: gm.userId === userId ? 0 : 1,
            });
          });
        } catch (e) {
          console.error("send_group_message error", e);
        }
      }
    );

    socket.on("group_typing", async ({ groupId }: { groupId: string }) => {
      try {
        const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } });
        const name = user?.name ?? user?.email ?? "Someone";
        socket.to(`group:${groupId}`).emit("group_user_typing", { groupId, userId, name });
      } catch {}
    });

    socket.on("create_group", async ({ name, description, memberIds, avatar }: { name: string; description: string; memberIds: string[]; avatar?: string }) => {
      try {
        const allMemberIds = Array.from(new Set([userId, ...memberIds]));
        const group = await prisma.group.create({
          data: {
            name, description, avatar,
            members: { create: allMemberIds.map((mid) => ({ userId: mid, isAdmin: mid === userId })) },
          },
          include: { members: { include: { user: true } } },
        });

        const systemMsg = await prisma.message.create({
          data: { groupId: group.id, senderId: userId, type: "system", text: `Group "${name}" was created`, status: "sent" },
          include: { sender: true },
        });

        const adminIds = group.members.filter((m) => m.isAdmin).map((m) => m.userId);
        const groupData = {
          id: group.id, isGroup: true as const, name: group.name, avatar: group.avatar ?? "",
          description: group.description ?? "", memberIds: group.members.map((m) => m.userId), adminIds,
          lastMessage: "No messages yet", timestamp: "", unread: 0,
          systemMessage: formatMessage(systemMsg as unknown as RawMsg, userId),
        };

        group.members.forEach((m) => { io.to(`user:${m.userId}`).emit("group_created", groupData); });
      } catch (e) {
        console.error("create_group error", e);
      }
    });

    socket.on("leave_group", async ({ groupId }: { groupId: string }) => {
      try {
        await prisma.groupMember.deleteMany({ where: { groupId, userId } });
        socket.leave(`group:${groupId}`);
        socket.emit("group_left", { groupId });
        io.to(`group:${groupId}`).emit("group_member_removed", { groupId, memberId: userId });
      } catch (e) {
        console.error("leave_group error", e);
      }
    });

    socket.on("add_members", async ({ groupId, memberIds }: { groupId: string; memberIds: string[] }) => {
      try {
        const admin = await prisma.groupMember.findUnique({ where: { groupId_userId: { groupId, userId } } });
        if (!admin?.isAdmin) return;

        await prisma.groupMember.createMany({ data: memberIds.map((mid) => ({ groupId, userId: mid, isAdmin: false })), skipDuplicates: true });

        const updatedGroup = await prisma.group.findUnique({ where: { id: groupId }, include: { members: true } });
        if (!updatedGroup) return;

        io.to(`group:${groupId}`).emit("group_members_updated", { groupId, memberIds: updatedGroup.members.map((m) => m.userId) });
        memberIds.forEach((mid) => { io.to(`user:${mid}`).emit("added_to_group", { groupId }); });
      } catch (e) {
        console.error("add_members error", e);
      }
    });

    socket.on("remove_member", async ({ groupId, memberId }: { groupId: string; memberId: string }) => {
      try {
        const admin = await prisma.groupMember.findUnique({ where: { groupId_userId: { groupId, userId } } });
        if (!admin?.isAdmin) return;
        await prisma.groupMember.delete({ where: { groupId_userId: { groupId, userId: memberId } } });
        io.to(`group:${groupId}`).emit("group_member_removed", { groupId, memberId });
        io.to(`user:${memberId}`).emit("group_left", { groupId });
      } catch (e) {
        console.error("remove_member error", e);
      }
    });

    socket.on("update_group", async ({ groupId, name, description, avatar }: { groupId: string; name: string; description: string; avatar?: string }) => {
      try {
        const admin = await prisma.groupMember.findUnique({ where: { groupId_userId: { groupId, userId } } });
        if (!admin?.isAdmin) return;
        const updated = await prisma.group.update({ where: { id: groupId }, data: { name, description, ...(avatar ? { avatar } : {}) } });
        io.to(`group:${groupId}`).emit("group_info_updated", { groupId, name: updated.name, description: updated.description ?? "", avatar: updated.avatar ?? undefined });
      } catch (e) {
        console.error("update_group error", e);
      }
    });
  });
}
