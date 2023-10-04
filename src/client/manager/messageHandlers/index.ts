import { Packet, WsEvent } from "../../../shared/websocket";
import type { Contexts } from "../types/contexts";

const messageHandlers: Record<
  string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (ws: WebSocket, packet: Packet<any>, contexts: Contexts) => void
> = {};

import HEARTBEAT from "./HEARTBEAT";
messageHandlers[WsEvent.HEARTBEAT] = HEARTBEAT;
import REFRESH from "./REFRESH";
messageHandlers[WsEvent.REFRESH] = REFRESH;
import CLIENTS from "./CLIENTS";
messageHandlers[WsEvent.CLIENTS] = CLIENTS;
import PAYLOADSTATUS from "./PAYLOADSTATUS";
messageHandlers[WsEvent.PAYLOADSTATUS] = PAYLOADSTATUS;
import PAYLOADERROR from "./PAYLOADERROR";
messageHandlers[WsEvent.PAYLOADERROR] = PAYLOADERROR;
import PAYLOADRESULT from "./PAYLOADRESULT";
messageHandlers[WsEvent.PAYLOADRESULTMANAGER] = PAYLOADRESULT;
import EVALRESULT from "./EVALRESULT";
messageHandlers[WsEvent.EVALRESULTMANAGER] = EVALRESULT;

export default messageHandlers;
