/// <reference types="svelte" />
/// <reference types="vite/client" />

declare global {
  interface Window {
    ws: WebSocket;
  }
}
