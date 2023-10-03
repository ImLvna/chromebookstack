import type { ServerWebSocket } from "bun";
import { type Client, Packet, WsEvent } from "../shared/websocket";

export const event = WsEvent.HEARTBEAT;

export default (
  ws: ServerWebSocket<Client>,
  packet: Packet<WsEvent.HEARTBEAT>
) => {
  ws.data.lastHeartbeat = Date.now();
};
