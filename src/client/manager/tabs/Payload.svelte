<script lang="ts">
  import { getContext } from "svelte";
  import { writable, type Writable } from "svelte/store";
  import {
    WsEvent,
    type Client,
    Packet,
    PAYLOADSTATUS,
  } from "../../../shared/websocket";
  import type { editor } from "monaco-editor";
  import Monaco from "../components/Monaco.svelte";
  import { CURRENT_TAB } from "../types/contexts";

  const payloadStatus = getContext<Writable<PAYLOADSTATUS>>("payloadStatus");
  const payloadError = getContext<Writable<string>>("payloadError");

  let editor: editor.IStandaloneCodeEditor;

  const defaultCode = DEFAULTPAYLOAD;

  function sendPayload() {
    const code = editor.getValue();
    $payloadError = "";
    const packet = new Packet(WsEvent.SENDPAYLOAD, code);
    packet.send(window.ws);
  }
</script>

<h1>Generate Payload</h1>
<h2>Status: {$payloadStatus}</h2>

<h1>Send a payload</h1>
<button on:click={sendPayload}>Send</button>
<div class="editor">
  <Monaco {defaultCode} bind:editor language="rust" />
</div>
{#if $payloadError}
  <h2 class="error">Error:</h2>
  <Monaco defaultCode={$payloadError} language="rust" />
{/if}

<style>
  .error {
    color: red;
  }
  .editor {
    width: 100%;
    height: 50%;
  }
</style>
