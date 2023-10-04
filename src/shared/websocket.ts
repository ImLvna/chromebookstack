import type { ServerWebSocket } from "bun";

// Have an enum for events, have a map of event to packet type, and provide typing for the packet type
export enum ClientType {
  MANAGER,
  WORKER,
}

export enum WsEvent {
  HEARTBEAT = "HEARTBEAT",
  STATUS = "STATUS",
  REFRESH = "REFRESH",
  EVAL = "EVAL",
  EVALRESULT = "EVALRESULT",
  EVALRESULTMANAGER = "EVALRESULTMANAGER",
  CLIENTS = "CLIENTS",
  PROXY = "PROXY",
  PAYLOADSTATUS = "PAYLOADSTATUS",
  SENDPAYLOAD = "SENDPAYLOAD",
  PAYLOAD = "PAYLOAD",
  PAYLOADRESULT = "PAYLOADRESULT",
  PAYLOADRESULTMANAGER = "PAYLOADRESULTMANAGER",
  PAYLOADERROR = "PAYLOADERROR",
}
export interface PacketMap {
  [WsEvent.HEARTBEAT]: undefined;
  [WsEvent.STATUS]: ClientStatus;
  [WsEvent.REFRESH]: undefined;
  [WsEvent.EVAL]: string;
  [WsEvent.EVALRESULT]: {
    code: string;
    result: any;
  };
  [WsEvent.EVALRESULTMANAGER]: {
    id: number;
    code: string;
    result: any;
  };
  [WsEvent.CLIENTS]: Client[];
  [WsEvent.PROXY]: {
    id: number;
    packet: Packet<any>;
  };
  [WsEvent.PAYLOADSTATUS]: PAYLOADSTATUS;
  [WsEvent.SENDPAYLOAD]: {
    type: PAYLOAD_TYPE;
    code: string;
  };
  [WsEvent.PAYLOAD]: {
    type: PAYLOAD_TYPE;
    code?: string;
  };
  [WsEvent.PAYLOADRESULT]: any;
  [WsEvent.PAYLOADRESULTMANAGER]: {
    id: number;
    result: any;
  };
  [WsEvent.PAYLOADERROR]: string;
}

export class Packet<T extends WsEvent> {
  event: WsEvent;
  data: PacketMap[T];

  constructor(event: T, data: PacketMap[T]) {
    this.event = event;
    if (data === undefined) this.data = {} as PacketMap[T];
    else this.data = data;
  }

  send(ws: ServerWebSocket<Client> | WebSocket) {
    ws.send(
      JSON.stringify({
        event: this.event,
        data: this.data,
      })
    );
  }

  sendAll(clients: ServerWebSocket<Client>[], type?: ClientType) {
    if (type !== undefined)
      clients = clients.filter((c) => c.data.type === type);
    clients.forEach((client) => this.send(client));
  }
}

export enum ClientStatus {
  IDLE = "IDLE",
  DOWNLOADING = "DOWNLOADING",
  RUNNING = "RUNNING",
  UPLOADING = "UPLOADING",
  ERROR = "ERROR",
}

export enum PAYLOADSTATUS {
  IDLE = "IDLE",
  COMPILING = "COMPILING",
  RUNNING = "RUNNING",
}

export enum PAYLOAD_TYPE {
  RUST,
  JAVASCRIPT,
  TYPESCRIPT,
}

export interface Client {
  id: number;
  status: ClientStatus;
  type: ClientType;
  lastHeartbeat: number;
}
