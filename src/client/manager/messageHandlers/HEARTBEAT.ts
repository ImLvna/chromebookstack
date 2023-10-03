import { Packet, WsEvent } from "../../../shared/websocket";

export default (ws: WebSocket) => {
  const packet = new Packet(WsEvent.HEARTBEAT, undefined);
  packet.send(ws);
};
