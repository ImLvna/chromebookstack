import type { ServerWebSocket } from "bun";

import { clients } from "..";
import { type Client, ClientType, Packet, WsEvent } from "../shared/websocket";

export const event = WsEvent.EVALRESULT;

export default (
  ws: ServerWebSocket<Client>,
  packet: Packet<WsEvent.EVALRESULT>,
) => {
  const managerPacket = new Packet(WsEvent.EVALRESULTMANAGER, {
    id: ws.data.id,
    ...packet.data,
  });

  managerPacket.sendAll(clients, ClientType.MANAGER);
};
