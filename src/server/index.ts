import { WebSocketServer } from "ws";
import { createServer } from "http";
import { logger } from "@/lib/observability/logging";
import { ensureCollections } from "@/lib/db/mongodb";
import { handleConnection, heartbeatCheck } from "./realtime-handler";
import { WS_CONFIG } from "./config";

async function startServer(): Promise<void> {
  try {
    await ensureCollections();
    logger.info("MongoDB collections ensured");
  } catch (error) {
    logger.error("Failed to ensure MongoDB collections", {
      error: String(error),
    });
  }

  const server = createServer();
  const wss = new WebSocketServer({
    server,
    maxPayload: WS_CONFIG.maxPayload,
  });

  wss.on("connection", (ws) => {
    handleConnection(ws).catch((error) => {
      logger.error("Connection handler error", { error: String(error) });
    });
  });

  wss.on("error", (error) => {
    logger.error("WebSocket server error", { error: String(error) });
  });

  const heartbeatTimer = setInterval(
    heartbeatCheck,
    WS_CONFIG.heartbeatInterval
  );

  wss.on("close", () => {
    clearInterval(heartbeatTimer);
  });

  server.listen(WS_CONFIG.port, WS_CONFIG.host, () => {
    logger.info(`Realtime WebSocket server started`, {
      host: WS_CONFIG.host,
      port: WS_CONFIG.port,
    });
    console.log(`\n  🎙️  Voice server ready on ws://${WS_CONFIG.host}:${WS_CONFIG.port}\n`);
  });
}

startServer().catch((error) => {
  logger.error("Failed to start server", { error: String(error) });
  process.exit(1);
});
