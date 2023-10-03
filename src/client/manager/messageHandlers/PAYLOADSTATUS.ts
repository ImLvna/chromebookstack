import { Packet, WsEvent } from "../../../shared/websocket";
import type { Contexts } from "../types/contexts";

export default (
  ws: WebSocket,
  packet: Packet<WsEvent.PAYLOADSTATUS>,
  contexts: Contexts
) => {
  contexts.payloadStatus.set(packet.data);
};
