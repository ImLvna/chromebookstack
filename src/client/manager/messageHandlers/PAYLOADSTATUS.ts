import { Packet, WsEvent } from "../../../shared/websocket";
import type { Contexts } from "../types/contexts";
import { startUppercase } from "../utils";

export default (
  ws: WebSocket,
  packet: Packet<WsEvent.PAYLOADSTATUS>,
  contexts: Contexts,
) => {
  contexts.payloadStatus.set(packet.data);
  contexts.notification.set(`Payload status: ${startUppercase(packet.data)}`);
};
