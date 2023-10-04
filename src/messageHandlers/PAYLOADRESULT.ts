import type { ServerWebSocket } from "bun";

import { clients } from "..";
import {
  type Client,
  ClientStatus,
  ClientType,
  Packet,
  PAYLOADSTATUS,
  WsEvent,
} from "../shared/websocket";

export const event = WsEvent.PAYLOADRESULT;

export default async (
  ws: ServerWebSocket<Client>,
  packet: Packet<WsEvent.PAYLOADRESULT>,
) => {
  const managerPacket = new Packet(WsEvent.PAYLOADRESULTMANAGER, packet.data);
  managerPacket.sendAll(clients, ClientType.MANAGER);
  // Check if all are idle
  if (
    clients.reduce(
      (a, c) =>
        (c.data.status === ClientStatus.IDLE ||
          c.data.status === ClientStatus.ERROR) &&
        a,
      true,
    )
  ) {
    const statusPacket = new Packet(WsEvent.PAYLOADSTATUS, PAYLOADSTATUS.IDLE);
    statusPacket.sendAll(clients, ClientType.MANAGER);
  }
};
