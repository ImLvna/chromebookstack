import type { ServerWebSocket } from "bun";
import {
  type Client,
  Packet,
  WsEvent,
  PAYLOADSTATUS,
  ClientType,
  ClientStatus,
} from "../shared/websocket";
import { clients } from "..";

export const event = WsEvent.PAYLOADRESULT;

export default async (
  ws: ServerWebSocket<Client>,
  packet: Packet<WsEvent.PAYLOADRESULT>
) => {
  console.log(packet.data);
  // Check if all are idle
  if (
    clients.reduce(
      (a, c) =>
        (c.data.status === ClientStatus.IDLE ||
          c.data.status === ClientStatus.ERROR) &&
        a,
      true
    )
  ) {
    const statusPacket = new Packet(WsEvent.PAYLOADSTATUS, PAYLOADSTATUS.IDLE);
    statusPacket.sendAll(clients, ClientType.MANAGER);
  }
};
