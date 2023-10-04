import type { ServerWebSocket } from "bun";

import { type Client, WsEvent } from "../shared/websocket";

export const event = WsEvent.HEARTBEAT;

export default (ws: ServerWebSocket<Client>) => {
  ws.data.lastHeartbeat = Date.now();
};
