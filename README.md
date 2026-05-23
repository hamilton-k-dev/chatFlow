# ChatFlow

A real-time full-stack chat application built with Next.js 15, Socket.IO, Prisma, and Neon PostgreSQL. Supports private messaging, group chats, voice messages, image sharing, message replies, and more.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js) ![Socket.IO](https://img.shields.io/badge/Socket.IO-4-white?logo=socket.io&logoColor=black) ![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)

---

## Features

- **Real-time messaging** — instant delivery via WebSocket (Socket.IO)
- **Private chats** — one-on-one direct messages
- **Group chats** — create groups, add/remove members, admin controls, group info panel
- **Voice messages** — record and send audio clips with a waveform player
- **Image sharing** — send images with full-screen preview
- **Message replies** — reply to any message with a quoted preview
- **Delete messages** — soft-delete with "Message deleted" placeholder
- **Message search** — search within a conversation or globally across all messages
- **Typing indicator** — live bouncing-dots indicator (no name shown in private chats)
- **Online presence** — real-time green dot, hidden between blocked users
- **Block / Unblock** — blocks message delivery, typing events, and online visibility in both directions
- **Unread badge** — unread count per conversation and browser tab title badge
- **Skeleton loaders** — shimmer placeholders while conversations and messages load
- **Pagination** — cursor-based infinite scroll for message history
- **Dark mode** — full dark/light theme toggle
- **Responsive** — mobile-first layout with back navigation
- **Authentication** — email/password via Better Auth with session management
- **Settings panel** — profile editing, blocked users list, appearance

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| Real-time | Socket.IO 4 (custom Node server via `tsx`) |
| Database | Neon (serverless PostgreSQL) |
| ORM | Prisma 7 with `@prisma/adapter-neon` |
| Auth | Better Auth |
| Styling | Tailwind CSS 3 |
| File uploads | Cloudinary |
| Forms | React Hook Form + Zod |

---

## Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) PostgreSQL database
- A [Cloudinary](https://cloudinary.com) account (for voice/image uploads)

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/chatflow.git
cd chatflow
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_APP_URL` | Public URL of the app (e.g. `http://localhost:3001`) |
| `BETTER_AUTH_URL` | Same as above — used by Better Auth |
| `BETTER_AUTH_SECRET` | Random secret — generate with `openssl rand -base64 32` |
| `DATABASE_URL` | Neon **pooled** connection string |
| `DIRECT_URL` | Neon **direct** URL — required for `prisma migrate` |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

### 4. Push the database schema

```bash
npx prisma migrate deploy
# or for development
npx prisma migrate dev
```

### 5. (Optional) Seed the database with demo users

```bash
npm run seed
```

### 6. Run the development server

```bash
npm run dev
```

The app runs on [http://localhost:3001](http://localhost:3001) by default.

---

## Project Structure

```
├── app/
│   ├── (auth)/               # Sign-in / sign-up pages
│   ├── (protected)/          # Route guard for authenticated users
│   ├── api/                  # API routes (auth, file uploads)
│   └── chat/
│       ├── ChatApp.tsx        # Root client component — socket lifecycle, state
│       ├── ChatContext.tsx    # React context for current user + users list
│       └── components/        # All UI components
│           ├── ChatWindow.tsx
│           ├── GroupChatWindow.tsx
│           ├── ConversationsList.tsx
│           ├── MessageBubble.tsx
│           ├── MessageInput.tsx
│           └── ...
├── lib/
│   ├── socket-server.ts       # All Socket.IO event handlers + in-memory caches
│   ├── socket-client.ts       # Singleton socket client
│   ├── auth.ts                # Better Auth configuration
│   └── db.ts                  # Prisma client
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Demo data seeder
└── server.ts                  # Custom Node server (Next.js + Socket.IO)
```

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run seed` | Seed the database with demo users |
| `npm run studio` | Open Prisma Studio |
| `npm run migrate:dev` | Run migrations in development |

---

## License

MIT
