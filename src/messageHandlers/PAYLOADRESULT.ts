import type { ServerWebSocket } from "bun";
import {
  type Client,
  Packet,
  WsEvent,
  PAYLOADSTATUS,
  ClientType,
} from "../shared/websocket";
import { clients } from "..";

export const event = WsEvent.PAYLOADRESULT;

export default async (
  ws: ServerWebSocket<Client>,
  packet: Packet<WsEvent.PAYLOADRESULT>
) => {
  const statusPacket = new Packet(WsEvent.PAYLOADSTATUS, PAYLOADSTATUS.IDLE);
  statusPacket.sendAll(clients, ClientType.MANAGER);
};
