import { Packet, WsEvent } from "../../../shared/websocket";

const messageHandlers: Record<
  string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (ws: WebSocket, packet: Packet<any>) => void
> = {};

import HEARTBEAT from "./HEARTBEAT";
messageHandlers[WsEvent.HEARTBEAT] = HEARTBEAT;
import REFRESH from "./REFRESH";
messageHandlers[WsEvent.REFRESH] = REFRESH;
import EVAL from "./EVAL";
messageHandlers[WsEvent.EVAL] = EVAL;
import PAYLOAD from "./PAYLOAD";
messageHandlers[WsEvent.PAYLOAD] = PAYLOAD;
import DATA from "./DATA";
messageHandlers[WsEvent.DATA] = DATA;

export default messageHandlers;
