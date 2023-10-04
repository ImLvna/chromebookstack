/// <reference types="svelte" />
/// <reference types="vite/client" />

declare global {
  interface Window {
    ws: WebSocket;
  }
}

declare const DEFAULTPAYLOAD: string;
