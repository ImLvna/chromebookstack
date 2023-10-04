<script lang="ts">
  import { getContext } from "svelte";
  import { type Writable, writable } from "svelte/store";

  import { type Client, Packet } from "../../../shared/websocket";
  import { WsEvent } from "../../../shared/websocket";
  import Monaco from "../components/Monaco.svelte";
  import { CURRENT_TAB } from "../types/contexts";

  const currentClient = getContext<Writable<number>>("currentClient");
  const clients = getContext<Writable<Client[]>>("clients");
  const currentTab = getContext<Writable<CURRENT_TAB>>("currentTab");
  const notification = getContext<Writable<string>>("notification");
  const evalResult = getContext<Writable<string>>("evalResult");

  const client = writable<Client>({} as Client);
  $: {
    const _client = $clients.find((c) => c.id === $currentClient);
    if (_client) $client = _client;
    else {
      notification.set("Please select a client first");
      currentTab.set(CURRENT_TAB.HOME);
    }
  }

  let packetType: WsEvent;

  function sendPacket() {
    $evalResult = "";
    const packet = new Packet(
      packetType,
      packetType === WsEvent.EVAL ? $code : JSON.parse($code),
    );
    const outPacket = new Packet(WsEvent.PROXY, {
      id: $client.id,
      packet,
    });
    outPacket.send(window.ws);
  }

  const code = writable<string>("");

  function checkLang() {
    if (packetType === WsEvent.EVAL) {
      lang.set("javascript");
      $code = "console.log('Hello World!')";
    } else {
      lang.set("json");
      $code = "{}";
    }
  }

  const lang = writable("javascript");
</script>

<h1>Client {$client.id}</h1>
<h2>Status: {$client.status}</h2>

<h1>Send a packet</h1>
<select bind:value={packetType} on:change={checkLang}>
  {#each Object.values(WsEvent) as event}
    <option value={event} selected={event === WsEvent.EVAL}>{event}</option>
  {/each}
</select>
<button on:click={sendPacket}>Send</button>
<div class="editor">
  <Monaco {code} language={lang} />
</div>
{#if $evalResult}
  <h2>Result:</h2>
  <div class="editor smaller">
    <Monaco code={evalResult} language="javascript" />
  </div>
{/if}

<style>
  .editor {
    width: 100%;
    height: 20vh;
  }
</style>
