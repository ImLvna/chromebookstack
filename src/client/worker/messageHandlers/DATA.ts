import { Packet, WsEvent } from "../../../shared/websocket";

export default (ws: WebSocket, packet: Packet<WsEvent.DATA>) => {
  const nameElem = document.getElementById("name") as HTMLInputElement;
  const oldName = nameElem.value;
  const newName = packet.data.name || "";
  if (oldName !== newName) {
    nameElem.value = newName;
  }
  window.localStorage.setItem("name", newName);
};
