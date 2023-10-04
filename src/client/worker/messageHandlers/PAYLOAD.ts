import { setStatus } from "..";
import { ClientStatus, Packet, WsEvent } from "../../../shared/websocket";

declare global {
  interface Window {
    getPayload: () => Promise<() => any>;
  }
}

export default async (ws: WebSocket, packet: Packet<WsEvent.PAYLOAD>) => {
  setStatus(ClientStatus.DOWNLOADING);
  try {
    setStatus(ClientStatus.DOWNLOADING);
    // @ts-ignore
    const { default: payload } = await import("/payload/wasm.js");
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
};
