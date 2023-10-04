import type { ServerWebSocket } from "bun";

import { clients } from "..";
import { type Client, Packet, WsEvent } from "../shared/websocket";

export const event = WsEvent.PROXY;

export default (ws: ServerWebSocket<Client>, packet: Packet<WsEvent.PROXY>) => {
  // packet data packet data packet data packet data packet data packet data
  const outPacket = new Packet(
    packet.data.packet.event,
    packet.data.packet.data,
  );

  if (packet.data.id === "*") {
    outPacket.sendAll(clients);
    return;
  }

  const client = clients.find((c) => c.data.id === packet.data.id);

  if (!client) return;

  outPacket.send(client);
};
