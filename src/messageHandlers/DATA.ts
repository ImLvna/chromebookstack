import type { ServerWebSocket } from "bun";

import { clients } from "..";
import { type Client, Packet, WsEvent } from "../shared/websocket";

export const event = WsEvent.DATA;

export default (ws: ServerWebSocket<Client>, packet: Packet<WsEvent.DATA>) => {
  let client = ws;
  if (packet.data.id !== undefined) {
    client = clients.find((c) => c.data.id === packet.data.id)!;
  }

  if (packet.data.ip !== undefined) {
    client.data.ip = packet.data.ip;
  }
  if (packet.data.name !== undefined) {
    // If the name is "", unset it
    client.data.name = packet.data.name || undefined;
  }

  new Packet(WsEvent.DATA, {
    ip: client.data.ip,
    name: client.data.name,
  }).send(client);
};
