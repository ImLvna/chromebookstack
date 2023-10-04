import type { Server, ServerWebSocket } from "bun";
import { readdir } from "fs/promises";
import { Router } from "itty-router";

import {
  type Client,
  ClientStatus,
  ClientType,
  Packet,
  WsEvent,
} from "./shared/websocket";

const messageHandlers: Record<
  string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (ws: ServerWebSocket<Client>, packet: Packet<any>) => void
> = {};

for (const file of await readdir("./src/messageHandlers")) {
  const handler = await import(`./messageHandlers/${file}`);
  messageHandlers[handler.event] = handler.default;
}

export const clients: ServerWebSocket<Client>[] = [];

const app = Router();

app.get("/worker/ws", (req, server: Server) => {
  const idsInUse = clients.map((client) => client.data.id);
  let id = 0;
  for (let i = 0; i < Math.max(...idsInUse) + 2; i++) {
    if (!idsInUse.includes(i)) {
      id = i;
      break;
    }
  }
  const success = server.upgrade(req, {
    data: {
      id,
      status: ClientStatus.IDLE,
      type: ClientType.WORKER,
      lastHeartbeat: Date.now(),
    },
  });
  if (!success) {
    return new Response("Failed to upgrade", { status: 400 });
  } else {
    return new Response("Upgraded");
  }
});
app.get("/manager/ws", (req, server: Server) => {
  const success = server.upgrade(req, {
    data: {
      id: -1,
      status: ClientStatus.IDLE,
      type: ClientType.MANAGER,
      lastHeartbeat: Date.now(),
    },
  });
  if (!success) {
    return new Response("Failed to upgrade", { status: 400 });
  } else {
    return new Response("Upgraded");
  }
});

app.get("/worker", () => {
  return new Response(Bun.file("./dist/worker/index.html"));
});
app.get("/worker/*", (req) => {
  return new Response(Bun.file("./dist" + new URL(req.url).pathname));
});

app.get("/manager", () => {
  return new Response(Bun.file("./dist/manager/index.html"));
});
app.get("/manager/*", (req) => {
  return new Response(Bun.file("./dist" + new URL(req.url).pathname));
});
app.get("/payload/*", (req) => {
  return new Response(Bun.file("./dist" + new URL(req.url).pathname));
});

app.get("*", (req) => {
  return new Response(Bun.file("./public" + new URL(req.url).pathname));
});

Bun.serve<Client>({
  fetch: (req, server) => app.handle(req, server),
  websocket: {
    open(ws) {
      clients.push(ws);
    },
    close(ws) {
      clients.splice(clients.indexOf(ws), 1);
    },
    message(ws, message: string) {
      const json = JSON.parse(message);
      const event = json.event;

      if (json.data.type === "Buffer") {
        json.data = Buffer.from(json.data);
      }
      const data = json.data;

      const packet = new Packet(event, data);

      if (event in messageHandlers) {
        messageHandlers[event](ws, packet);
      }
    },
  },

  port: 8080,
});

setInterval(() => {
  const packet = new Packet(WsEvent.HEARTBEAT, undefined);
  clients.forEach((client) => {
    if (Date.now() - client.data.lastHeartbeat > 10000) {
      client.close();
    }
  });
  packet.sendAll(clients);
}, 1000);

setInterval(() => {
  const packet = new Packet(
    WsEvent.CLIENTS,
    clients.map((c) => c.data).filter((c) => c.type === ClientType.WORKER),
  );
  packet.sendAll(clients, ClientType.MANAGER);
}, 100);

// Refresh all clients when the server restarts
setTimeout(() => {
  const packet = new Packet(WsEvent.REFRESH, undefined);
  packet.sendAll(clients);
}, 1000);

console.log("Server started");
