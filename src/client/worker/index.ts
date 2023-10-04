/// <reference lib="dom" />

import { ClientStatus, Packet, WsEvent } from "../../shared/websocket";
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

let ip = "";
async function getIp() {
  if (ip) return ip;
  try {
    const json = await fetch("https://ipinfo.io/json").then((res) =>
      res.json(),
    );
    ip = json.ip;
  } catch (e) {
    console.log("Failed to get IP, check for adblock");
  }
  return ip;
}

function main() {
  const base = window.location.protocol === "https:" ? "wss://" : "ws://";
  const domain = window.location.host;

  const ws = new WebSocket(`${base}${domain}/worker/ws`);
  window.ws = ws;

  ws.onopen = async () => {
    console.log("Connected to server");
    setStatus(ClientStatus.IDLE);
    const dataPacket = new Packet(WsEvent.DATA, { ip: await getIp() });
    dataPacket.send(ws);
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
console.log = (...args: any[]) => {
  oldLog(...args);
  const li = document.createElement("li");
  li.innerText = args.join(" ");
  logsEl.prepend(li);
};
const oldError = console.error;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
console.error = (...args: any[]) => {
  oldError(...args);
  const li = document.createElement("li");
  li.innerText = args.join(" ");
  li.style.color = "red";
  logsEl.prepend(li);
};
main();
