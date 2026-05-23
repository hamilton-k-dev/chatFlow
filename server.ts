import "dotenv/config";
import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server as SocketIOServer } from "socket.io";
import { setupSocketHandlers } from "./lib/socket-server";

const dev = process.env.NODE_ENV !== "production";
const port = parseInt(process.env.PORT ?? "3001", 10);

const app = next({ dev, hostname: "0.0.0.0", port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  setupSocketHandlers(io);

  // Suppress noisy ErrorEvent logs from the ws transport on abrupt client disconnects
  io.engine.on("connection_error", (err: Error) => {
    if (process.env.NODE_ENV === "development") {
      console.warn("[socket] connection error:", err.message);
    }
  });

  httpServer.listen(port, "0.0.0.0", () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
