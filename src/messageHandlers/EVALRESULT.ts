import type { ServerWebSocket } from "bun";
import { type Client, Packet, WsEvent, ClientType } from "../shared/websocket";
import { clients } from "..";

export const event = WsEvent.EVALRESULT;

export default (
  ws: ServerWebSocket<Client>,
  packet: Packet<WsEvent.EVALRESULT>
) => {
  const managerPacket = new Packet(WsEvent.EVALRESULTMANAGER, {
    id: ws.data.id,
    ...packet.data,
  });

  managerPacket.sendAll(clients, ClientType.MANAGER);
};
