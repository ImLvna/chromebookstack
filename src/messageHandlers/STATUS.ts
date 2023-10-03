import type { ServerWebSocket } from "bun";
import { type Client, Packet, WsEvent } from "../shared/websocket";

export const event = WsEvent.STATUS;

export default (
  ws: ServerWebSocket<Client>,
  packet: Packet<WsEvent.STATUS>
) => {
  ws.data.status = packet.data;
};
