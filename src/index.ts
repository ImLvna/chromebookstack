import { readdir, stat } from "fs/promises";
import {
  type Client,
  WsEvent,
  ClientStatus,
  Packet,
  ClientType,
} from "./shared/websocket";
import type { Server, ServerWebSocket } from "bun";
import { Router } from "itty-router";

const messageHandlers: Record<
  string,
  (ws: ServerWebSocket<Client>, packet: Packet<any>) => void
> = {};

for (const file of await readdir("./src/messageHandlers")) {
  const handler = await import(`./messageHandlers/${file}`);
  messageHandlers[handler.event] = handler.default;
}

export const clients: ServerWebSocket<Client>[] = [];

const workerBuild = await Bun.build({
  entrypoints: ["./src/client/worker/index.ts"],
  target: "browser",
  minify: true,
  publicPath: "/worker/",
});
if (!workerBuild.success) throw new Error("Failed to transform");
const workerScript = await workerBuild.outputs[0].text();

const app = Router();

function registerWs(type: ClientType, server: Server, req: Request) {
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
      type: type,
      lastHeartbeat: Date.now(),
    },
  });
  if (!success) {
    return new Response("Failed to upgrade", { status: 400 });
  } else {
    return new Response("Upgraded");
  }
}

app.get("/worker", () => {
  return new Response(Bun.file("./src/client/worker/index.html"));
});
app.get("/worker/ws", (req, server: Server) => {
  return registerWs(ClientType.WORKER, server, req);
});
app.get("/worker/index.js", async (req) => {
  return new Response(workerScript, {
    headers: {
      "content-type": "application/javascript",
    },
  });
});
app.get("/worker/*", (req) => {
  return new Response(Bun.file("./src/client" + new URL(req.url).pathname));
});

app.get("/manager", (req) => {
  return new Response(Bun.file("./public/manager/index.html"));
});
app.get("/manager/ws", (req, server: Server) => {
  return registerWs(ClientType.MANAGER, server, req);
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
    clients.map((c) => c.data).filter((c) => c.type === ClientType.WORKER)
  );
  packet.sendAll(clients, ClientType.MANAGER);
}, 100);

// Refresh all clients when the server restarts
setTimeout(() => {
  const packet = new Packet(WsEvent.REFRESH, undefined);
  packet.sendAll(clients);
}, 1000);

console.log("Server started");
