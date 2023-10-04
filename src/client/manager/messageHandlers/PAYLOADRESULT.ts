import { Packet, WsEvent } from "../../../shared/websocket";
import type { Contexts } from "../types/contexts";

export default (
  ws: WebSocket,
  packet: Packet<WsEvent.PAYLOADRESULTMANAGER>,
  contexts: Contexts,
) => {
  contexts.payloadResult.update((all) => [...all, packet.data]);
};
