import type { ServerWebSocket } from "bun";
import {
  type Client,
  Packet,
  WsEvent,
  PAYLOADSTATUS,
  ClientType,
} from "../shared/websocket";
import { rename } from "fs/promises";
import { clients } from "..";

export const event = WsEvent.SENDPAYLOAD;

export default async (
  ws: ServerWebSocket<Client>,
  packet: Packet<WsEvent.SENDPAYLOAD>
) => {
  const code = packet.data;

  const statusPacket = new Packet(
    WsEvent.PAYLOADSTATUS,
    PAYLOADSTATUS.COMPILING
  );
  statusPacket.sendAll(clients, ClientType.MANAGER);

  // Build the worker

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
      "../public/payload",
    ],
    {
      cwd: "./build",
      stdio: ["ignore", "ignore", "pipe"],
    }
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
  const payloadPacket = new Packet(WsEvent.PAYLOAD, undefined);
  payloadPacket.sendAll(clients, ClientType.WORKER);
};
