<script lang="ts">
  import { getContext } from "svelte";
  import { writable, type Writable } from "svelte/store";
  import { WsEvent, type Client, Packet } from "../../../shared/websocket";
  import type { editor } from "monaco-editor";
  import Monaco from "../components/Monaco.svelte";
  import { CURRENT_TAB } from "../types/contexts";

  const currentClient = getContext<Writable<number>>("currentClient");
  const clients = getContext<Writable<Client[]>>("clients");
  const currentTab = getContext<Writable<CURRENT_TAB>>("currentTab");

  const client = writable<Client>({} as any);
  $: {
    const _client = $clients.find((c) => c.id === $currentClient);
    if (_client) $client = _client;
    else currentTab.set(CURRENT_TAB.HOME);
  }

  let editor: editor.IStandaloneCodeEditor;
  let packetType: WsEvent;

  function sendPacket() {
    const value = editor.getValue();
    const packet = new Packet(
      packetType,
      packetType === WsEvent.EVAL ? value : JSON.parse(value)
    );
    const outPacket = new Packet(WsEvent.PROXY, {
      id: $client.id,
      packet,
    });
    outPacket.send(window.ws);
  }

  const defaultCode = "";

  function checkLang() {
    if (packetType === WsEvent.EVAL) {
      lang.set("javascript");
      editor.setValue("");
    } else {
      lang.set("json");
      editor.setValue("{}");
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
  <Monaco {defaultCode} bind:editor language={$lang} />
</div>

<style>
  .editor {
    width: 100%;
    height: 50%;
  }
</style>
