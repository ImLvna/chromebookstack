import type { ServerWebSocket } from "bun";
import { type Client, Packet, WsEvent } from "../shared/websocket";
import { clients } from "..";

export const event = WsEvent.PROXY;

export default (ws: ServerWebSocket<Client>, packet: Packet<WsEvent.PROXY>) => {
  const client = clients.find((c) => c.data.id === packet.data.id);

  if (!client) {
    console.log(`Client ${packet.data.id} not found`);
    return;
  }

  // packet data packet data packet data packet data packet data packet data
  const outPacket = new Packet(
    packet.data.packet.event,
    packet.data.packet.data
  );

  outPacket.send(client);
};
