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
  PAYLOAD = "PAYLOAD",
  PAYLOADRESULT = "PAYLOADRESULT",
  PAYLOADRESULTMANAGER = "PAYLOADRESULTMANAGER",
  PAYLOADERROR = "PAYLOADERROR",
  DATA = "DATA",
}
export interface PacketMap {
  [WsEvent.HEARTBEAT]: undefined;
  [WsEvent.STATUS]: ClientStatus;
  [WsEvent.REFRESH]: undefined;
  [WsEvent.EVAL]: string;
  [WsEvent.EVALRESULT]: {
    code: string;
    result: unknown;
  };
  [WsEvent.EVALRESULTMANAGER]: {
    id: number;
    code: string;
    result: unknown;
  };
  [WsEvent.CLIENTS]: Client[];
  [WsEvent.PROXY]: {
    id: number | "*";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    packet: Packet<any>;
  };
  [WsEvent.PAYLOADSTATUS]: PAYLOADSTATUS;
  [WsEvent.PAYLOAD]: {
    type: PAYLOAD_TYPE;
    code?: string;
  };
  [WsEvent.PAYLOADRESULT]: unknown;
  [WsEvent.PAYLOADRESULTMANAGER]: {
    id: number;
    result: unknown;
  };
  [WsEvent.PAYLOADERROR]: string;
  [WsEvent.DATA]: {
    id?: number;
    ip?: string;
    name?: string;
  };
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
      }),
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
  name?: string;
  ip: string;
  status: ClientStatus;
  type: ClientType;
  lastHeartbeat: number;
}
