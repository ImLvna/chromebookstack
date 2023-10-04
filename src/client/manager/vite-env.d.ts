/// <reference types="svelte" />
/// <reference types="vite/client" />

declare global {
  interface Window {
    ws: WebSocket;
  }
}

declare const DEFAULT_RUST: string;
declare const DEFAULT_JS: string;
declare const DEFAULT_TS: string;
