import { ClientStatus, Packet, WsEvent } from "../../../shared/websocket";
import { setStatus } from "..";

export default async (ws: WebSocket, packet: Packet<WsEvent.EVAL>) => {
  setStatus(ClientStatus.RUNNING);
  let result;
  try {
    result = await eval(packet.data);
  } catch (e) {
    result = e;
  }
  const resultPacket = new Packet(WsEvent.EVALRESULT, {
    code: packet.data,
    result,
  });
  resultPacket.send(ws);
  setStatus(ClientStatus.IDLE);
};
