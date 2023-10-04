<script lang="ts">
  import { writable } from "svelte/store";
  import {
    ClientType,
    Packet,
    WsEvent,
    type Client,
    PAYLOADSTATUS,
  } from "../../shared/websocket";
  import messageHandlers from "./messageHandlers";
  import { setContext as _setContext } from "svelte";
  import { CURRENT_TAB, Tabs, type Contexts } from "./types/contexts";

  const contexts: Contexts = {} as any;

  function setContext<T>(key: string, value: T) {
    contexts[key] = value;
    _setContext(key, value);
  }

  let ws: WebSocket;

  const clients = writable<Client[]>([]);
  console.log(clients);
  setContext("clients", clients);

  const currentTab = writable<CURRENT_TAB>(CURRENT_TAB.HOME);
  setContext("currentTab", currentTab);

  const currentClient = writable<number>(0);
  setContext("currentClient", currentClient);

  const payloadStatus = writable<PAYLOADSTATUS>(PAYLOADSTATUS.IDLE);
  setContext("payloadStatus", payloadStatus);

  function connectWs() {
    ws = new WebSocket("ws://localhost:8080/manager/ws");
    window.ws = ws;
    ws.onclose = () => {
      setTimeout(connectWs, 100);
    };
    ws.onmessage = (msg: MessageEvent<string>) => {
      const packetJson = JSON.parse(msg.data);
      const packet = new Packet(packetJson.event, packetJson.data);
      if (messageHandlers[packet.event])
        messageHandlers[packet.event](ws, packet, contexts);
    };
  }

  connectWs();
</script>

<div class="tabs">
  {#each Object.keys(Tabs) as tab}
    <button
      class:active={$currentTab === tab}
      on:click={() =>
        // @ts-ignore
        ($currentTab = tab)}
    >
      {tab}
    </button>
  {/each}
</div>

<div class="page">
  <svelte:component this={Tabs[$currentTab]} />
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: sans-serif;
    background-color: #333;
    color: #fff;
  }

  .page {
    width: 100%;
    height: 100%;
  }
</style>
