import type { ServerWebSocket } from "bun";
import { rm } from "fs/promises";

import { clients } from "..";
import {
  type Client,
  ClientType,
  Packet,
  PAYLOAD_TYPE,
  PAYLOADSTATUS,
  WsEvent,
} from "../shared/websocket";

export const event = WsEvent.SENDPAYLOAD;

export default async (
  ws: ServerWebSocket<Client>,
  packet: Packet<WsEvent.SENDPAYLOAD>,
) => {
  const { code, type } = packet.data;

  const statusPacket = new Packet(
    WsEvent.PAYLOADSTATUS,
    PAYLOADSTATUS.COMPILING,
  );
  statusPacket.sendAll(clients, ClientType.MANAGER);

  switch (type) {
    case PAYLOAD_TYPE.RUST: {
      // Build the worker

      await rm("./dist/payload", { recursive: true, force: true });

      const libFile = Bun.file("./build/src/lib.rs");
      await Bun.write(libFile, code);

      const proc = Bun.spawn(
        [
          "wasm-pack",
          "build",
          "--target",
          "web",
          "--no-typescript",
          "--no-pack",
          "--out-name",
          "wasm",
          "--out-dir",
          "../dist/payload",
        ],
        {
          cwd: "./build",
          stdio: ["ignore", "ignore", "pipe"],
        },
      );

      const output = await new Response(proc.stderr).text();

      const failed = output.includes("error:");

      if (failed) {
        const errorPacket = new Packet(WsEvent.PAYLOADERROR, output);
        errorPacket.sendAll(clients, ClientType.MANAGER);
        statusPacket.data = PAYLOADSTATUS.IDLE;
        statusPacket.sendAll(clients, ClientType.MANAGER);
        return;
      }

      statusPacket.data = PAYLOADSTATUS.RUNNING;
      statusPacket.sendAll(clients, ClientType.MANAGER);
      const payloadPacket = new Packet(WsEvent.PAYLOAD, {
        type,
      });
      payloadPacket.sendAll(clients, ClientType.WORKER);

      break;
    }
    case PAYLOAD_TYPE.JAVASCRIPT: {
      const outPacketJs = new Packet(WsEvent.PAYLOAD, {
        type,
        code,
      });
      statusPacket.data = PAYLOADSTATUS.RUNNING;
      statusPacket.sendAll(clients, ClientType.MANAGER);
      outPacketJs.sendAll(clients, ClientType.WORKER);
      break;
    }
    case PAYLOAD_TYPE.TYPESCRIPT: {
      const transpiler = new Bun.Transpiler();
      const jsCode = await transpiler.transform(code, "ts");
      const outPacketTs = new Packet(WsEvent.PAYLOAD, {
        type: PAYLOAD_TYPE.JAVASCRIPT,
        code: jsCode,
      });
      statusPacket.data = PAYLOADSTATUS.RUNNING;
      statusPacket.sendAll(clients, ClientType.MANAGER);
      outPacketTs.sendAll(clients, ClientType.WORKER);
      break;
    }
  }
};
