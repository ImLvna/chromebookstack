import { Packet, WsEvent } from "../../../shared/websocket";
import type { Contexts } from "../types/contexts";

const messageHandlers: Record<
  string,
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

export default messageHandlers;