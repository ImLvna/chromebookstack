import type { ServerWebSocket } from "bun";

import { type Client, Packet, WsEvent } from "../shared/websocket";

export const event = WsEvent.DATA;

export default (ws: ServerWebSocket<Client>, packet: Packet<WsEvent.DATA>) => {
  ws.data.ip = packet.data.ip;
};
