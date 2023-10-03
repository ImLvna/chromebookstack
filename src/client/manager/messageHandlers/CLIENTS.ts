import { Packet, WsEvent } from "../../../shared/websocket";
import type { Contexts } from "../types/contexts";

export default (
  ws: WebSocket,
  packet: Packet<WsEvent.CLIENTS>,
  contexts: Contexts
) => {
  contexts.clients.set(packet.data);
};
