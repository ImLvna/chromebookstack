<script lang="ts">
  import { getContext } from "svelte";
  import { type Writable, writable } from "svelte/store";

  import {
    Packet,
    PAYLOAD_TYPE,
    PAYLOADSTATUS,
    WsEvent,
  } from "../../../shared/websocket";
  import Monaco from "../components/Monaco.svelte";

  const payloadStatus = getContext<Writable<PAYLOADSTATUS>>("payloadStatus");
  const payloadError = getContext<Writable<string>>("payloadError");
  const payloadResult = getContext<Writable<string[]>>("payloadResult");

  const lang = writable<PAYLOAD_TYPE>(PAYLOAD_TYPE.RUST);
  const langStr = writable<string>("rust");

  const payloadResultString = writable<string>("");
  payloadResult.subscribe((result) => {
    payloadResultString.set(JSON.stringify(result, null, 2));
  });

  const code = writable<string>(DEFAULT_RUST);

  function sendPayload() {
    $payloadError = "";
    $payloadResult = [];
    const packet = new Packet(WsEvent.SENDPAYLOAD, {
      type: $lang,
      code: $code,
    });
    packet.send(window.ws);
  }

  lang.subscribe((newLang) => {
    if (newLang === PAYLOAD_TYPE.RUST) {
      code.set(DEFAULT_RUST);
      langStr.set("rust");
    } else if (newLang === PAYLOAD_TYPE.JAVASCRIPT) {
      code.set(DEFAULT_JS);
      langStr.set("javascript");
    } else if (newLang === PAYLOAD_TYPE.TYPESCRIPT) {
      code.set(DEFAULT_TS);
      langStr.set("typescript");
    }
  });
</script>

<h1>Generate Payload</h1>
<h2>Status: {$payloadStatus}</h2>

<h1>Send a payload</h1>
<button on:click={sendPayload}>Send</button>
<select bind:value={$lang}>
  <option value={PAYLOAD_TYPE.RUST}>Rust</option>
  <option value={PAYLOAD_TYPE.JAVASCRIPT}>JavaScript</option>
  <option value={PAYLOAD_TYPE.TYPESCRIPT}>TypeScript</option>
</select>
<div class="editor">
  <Monaco {code} language={langStr} />
</div>
{#if $payloadResult.length > 0}
  <h2>Result:</h2>
  <div class="editor smaller">
    <Monaco code={payloadResultString} language="rust" />
  </div>
{/if}
{#if $payloadError}
  <h2 class="error">Error:</h2>
  <div class="editor">
    <Monaco code={payloadError} language="rust" />
  </div>
{/if}

<style>
  .error {
    color: red;
  }
  .editor {
    width: 100%;
    height: 45vh;
  }

  .smaller {
    height: 20vh;
  }
</style>
