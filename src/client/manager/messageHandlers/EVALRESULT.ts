import { Packet, WsEvent } from "../../../shared/websocket";
import type { Contexts } from "../types/contexts";

export default (
  ws: WebSocket,
  packet: Packet<WsEvent.EVALRESULTMANAGER>,
  contexts: Contexts,
) => {
  let data = packet.data.result as string;
  if (typeof data === "object") {
    data = JSON.stringify(data, null, 2);
  } else data = data.toString();
  contexts.evalResult.set(data);
};
