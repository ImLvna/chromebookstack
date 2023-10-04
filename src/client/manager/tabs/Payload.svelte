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

  const clients = getContext<Writable<Client[]>>("clients");
  const payloadStatus = getContext<Writable<PAYLOADSTATUS>>("payloadStatus");

  let editor: editor.IStandaloneCodeEditor;

  const defaultCode = `use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    // Js functions
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[wasm_bindgen]
pub fn main() {
    // Your code here
    log("Hello from Rust!");
}`;

  function sendPayload() {
    const code = editor.getValue();
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

<style>
  .editor {
    width: 100%;
    height: 50%;
  }
</style>
