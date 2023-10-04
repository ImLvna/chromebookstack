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
  import { slide } from "svelte/transition";

  const contexts: Contexts = {} as any;

  function setContext<T>(key: string, value: T) {
    contexts[key] = value;
    _setContext(key, value);
  }

  let ws: WebSocket;

  const clients = writable<Client[]>([]);
  setContext("clients", clients);

  const currentTab = writable<CURRENT_TAB>(CURRENT_TAB.HOME);
  setContext("currentTab", currentTab);

  const currentClient = writable<number>(0);
  setContext("currentClient", currentClient);

  const payloadStatus = writable<PAYLOADSTATUS>(PAYLOADSTATUS.IDLE);
  setContext("payloadStatus", payloadStatus);

  const notification = writable<string>("");
  setContext("notification", notification);

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

  const notificationList = writable<string[]>([]);

  $: {
    if ($notification) {
      notificationList.update((list) => [...list, $notification]);
      setTimeout(() => {
        notificationList.update((list) => list.slice(1));
      }, 5000);
      $notification = "";
    }
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
<div class="notificationWrapper">
  {#each $notificationList as notification}
    <div
      class="notification"
      transition:slide={{ axis: "y" }}
      data-notif-id={Math.random()}
    >
      <div class="notification-text">
        {notification}
      </div>
    </div>
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

  .tabs {
    /* left aligned, make them pretty */
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    width: 100%;
    height: 50px;
    background-color: #222;
  }

  .tabs button {
    /* make them pretty */
    border: none;
    background-color: #222;
    color: #fff;
    padding: 10px;
    margin: 0 10px;
    cursor: pointer;
    transition: 0.2s ease-in-out;
  }

  .tabs button:hover,
  .tabs button.active {
    background-color: #333;
  }

  .notificationWrapper {
    position: absolute;
    top: 50px;
    right: 0;
    background-color: #111;
    display: flex;
    flex-direction: column;
    font-size: 1.5rem;
    z-index: 999;
    overflow: hidden;
    border-radius: 0 0 0 10px;
  }

  .notification {
    height: 50px;
    background-color: #252525;
    margin-left: 5px;
    margin-right: 5px;
    margin-bottom: 5px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
  }

  .notification-text {
    padding: 0 10px;
  }
</style>
