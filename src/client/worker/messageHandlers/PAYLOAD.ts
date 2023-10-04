import {
  ClientStatus,
  Packet,
  PAYLOAD_TYPE,
  WsEvent,
} from "../../../shared/websocket";
import { setStatus } from "..";

declare global {
  interface Window {
    getPayload: () => Promise<() => () => unknown>;
  }
}

export default async (ws: WebSocket, packet: Packet<WsEvent.PAYLOAD>) => {
  console.log("Running payload");

  switch (packet.data.type) {
    case PAYLOAD_TYPE.RUST:
      setStatus(ClientStatus.DOWNLOADING);
      try {
        setStatus(ClientStatus.DOWNLOADING);
        // Functions is in window, so vite doesnt bundle the import
        const payload = await window.getPayload();
        setStatus(ClientStatus.RUNNING);
        let result = payload();
        setStatus(ClientStatus.UPLOADING);
        if (result instanceof Promise) result = await result;
        setStatus(ClientStatus.IDLE);
        const resultPacket = new Packet(WsEvent.PAYLOADRESULT, result);
        resultPacket.send(ws);
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

      break;

    case PAYLOAD_TYPE.JAVASCRIPT:
      setStatus(ClientStatus.RUNNING);
      try {
        let result = eval(packet.data.code!);
        if (result instanceof Promise) result = await result;
        setStatus(ClientStatus.IDLE);
        const resultPacket = new Packet(WsEvent.PAYLOADRESULT, result);
        resultPacket.send(ws);
      } catch (e) {
        setStatus(ClientStatus.ERROR);
        console.error(e);
        const resultPacket = new Packet(WsEvent.PAYLOADRESULT, e);
        resultPacket.send(ws);
        setTimeout(() => {
          setStatus(ClientStatus.IDLE);
        }, 1000);
      }
      break;
  }
};
