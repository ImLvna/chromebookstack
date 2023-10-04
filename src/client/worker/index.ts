/// <reference lib="dom" />

import {
  ClientStatus,
  ClientType,
  Packet,
  WsEvent,
} from "../../shared/websocket";
import messageHandlers from "./messageHandlers";

declare global {
  interface Window {
    ws: WebSocket;
  }
}

export function setStatus(status: ClientStatus) {
  const packet = new Packet(WsEvent.STATUS, status);
  packet.send(window.ws);
  const statusEl = document.getElementById("status");
  if (statusEl) {
    statusEl.innerText = status;
  }
}

function main() {
  const ws = new WebSocket("ws://localhost:8080/worker/ws");
  window.ws = ws;

  ws.onopen = () => {
    console.log("Connected to server");
    setStatus(ClientStatus.IDLE);
  };
  ws.onclose = () => {
    console.log("Disconnected...");
    setStatus(ClientStatus.ERROR);
    setTimeout(main, 1000);
  };

  ws.onmessage = (e) => {
    const json = JSON.parse(e.data as string);
    const event = json.event;
    const data = json.data;

    const handler = messageHandlers[event];
    if (handler) {
      handler(ws, new Packet(event, data));
    }
  };
}

const logsEl = document.getElementById("logs") as HTMLUListElement;
const oldLog = console.log;
console.log = (...args: any[]) => {
  oldLog(...args);
  const li = document.createElement("li");
  li.innerText = args.join(" ");
  logsEl.prepend(li);
};
const oldError = console.error;
console.error = (...args: any[]) => {
  oldError(...args);
  const li = document.createElement("li");
  li.innerText = args.join(" ");
  li.style.color = "red";
  logsEl.prepend(li);
};
main();
