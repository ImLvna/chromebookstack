import { setStatus } from "..";
import { ClientStatus, Packet, WsEvent } from "../../../shared/websocket";

declare global {
  interface Window {
    getPayload: () => Promise<() => any>;
  }
}

export default async (ws: WebSocket, packet: Packet<WsEvent.PAYLOAD>) => {
  console.log("Running payload");
  setStatus(ClientStatus.DOWNLOADING);
  try {
    setStatus(ClientStatus.DOWNLOADING);
    // Functions is in window, so vite doesnt bundle the import
    const payload = await window.getPayload();
    setStatus(ClientStatus.RUNNING);
    let result = payload();
    setStatus(ClientStatus.UPLOADING);
    if (result instanceof Promise) result = await result;
    const resultPacket = new Packet(WsEvent.PAYLOADRESULT, result);
    resultPacket.send(ws);
    setStatus(ClientStatus.IDLE);
  } catch (e) {
    const resultPacket = new Packet(WsEvent.PAYLOADRESULT, e);
    resultPacket.send(ws);
    setStatus(ClientStatus.ERROR);
    console.error(e);
    setTimeout(() => {
      setStatus(ClientStatus.IDLE);
    }, 1000);
  }
  console.log("Finished payload");
};
