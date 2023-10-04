import type { Writable } from "svelte/store";

import type { Client, PAYLOADSTATUS } from "../../../shared/websocket";
import Home from "../tabs/Home.svelte";
import Payload from "../tabs/Payload.svelte";
import View from "../tabs/View.svelte";

export enum CURRENT_TAB {
  HOME = "Home",
  VIEW = "Client View",
  PAYLOAD = "Payload",
}
export const Tabs = {
  [CURRENT_TAB.HOME]: Home,
  [CURRENT_TAB.VIEW]: View,
  [CURRENT_TAB.PAYLOAD]: Payload,
};

export interface Contexts {
  clients: Writable<Client[]>;
  currentTab: Writable<CURRENT_TAB>;
  payloadStatus: Writable<PAYLOADSTATUS>;
  payloadError: Writable<string>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payloadResult: Writable<any[]>;
  notification: Writable<string>;
  evalResult: Writable<string>;
}
