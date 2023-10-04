import { Packet, WsEvent } from "../../../shared/websocket";
import type { Contexts } from "../types/contexts";

export default (
  ws: WebSocket,
  packet: Packet<WsEvent.PAYLOADERROR>,
  contexts: Contexts,
) => {
  contexts.notification.set(`Payload failed to compile!`);
  contexts.payloadError.set(packet.data);
};
