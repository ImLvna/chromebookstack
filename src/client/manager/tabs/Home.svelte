<script lang="ts">
  import { getContext } from "svelte";
  import type { Writable } from "svelte/store";

  import { type Client } from "../../../shared/websocket";
  import { CURRENT_TAB } from "../types/contexts";

  const clients = getContext<Writable<Client[]>>("clients");

  const currentClient = getContext<Writable<number>>("currentClient");
  const currentTab = getContext<Writable<CURRENT_TAB>>("currentTab");
</script>

<div class="clients">
  {#each $clients as client}
    <button
      class="client"
      on:click={() => {
        $currentClient = client.id;
        $currentTab = CURRENT_TAB.VIEW;
      }}
    >
      <h2>{client.name || client.id}</h2>
      {#if client.name}<p>({client.id})</p>{/if}
      {#if client.ip}<p>{client.ip}</p>{/if}
      <h2>{client.status}</h2>
    </button>
  {/each}
</div>

<style>
  .clients {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    grid-gap: 1rem;
    padding: 1rem;
  }
  .client {
    background-color: #444;
    padding: 1rem;
    border-radius: 0.5rem;
  }

  button {
    background: none;
    color: inherit;
    border: none;
    padding: 0;
    font: inherit;
    cursor: pointer;
    outline: inherit;
  }
</style>
