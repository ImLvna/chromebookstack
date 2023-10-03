import type { ServerWebSocket } from "bun";
import { type Client, Packet, WsEvent } from "../shared/websocket";

export const event = WsEvent.EVALRESULT;

export default (
  ws: ServerWebSocket<Client>,
  packet: Packet<WsEvent.EVALRESULT>
) => {};
