<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import * as monaco from "monaco-editor";
  import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
  import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
  import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";

  export let defaultCode: string;
  export let language: string;
  let editorElement: HTMLDivElement;
  export let editor: monaco.editor.IStandaloneCodeEditor | null = null;
  let model: monaco.editor.ITextModel;

  function loadCode(code: string, language: string) {
    model = monaco.editor.createModel(code, language);

    editor!.setModel(model);
  }

  onMount(async () => {
    self.MonacoEnvironment = {
      getWorker: function (_: any, label: string) {
        if (label === "json") {
          return new jsonWorker();
        }
        if (label === "typescript" || label === "javascript") {
          return new tsWorker();
        }
        return new editorWorker();
      },
    };

    monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);

    editor = monaco.editor.create(editorElement, {
      automaticLayout: true,
      theme: "vs-dark",
    });

    loadCode(defaultCode, language);
  });

  onDestroy(() => {
    editor?.getModel()?.dispose();
    editor?.dispose();
  });
</script>

<div class="editor" bind:this={editorElement} />

<style>
  .editor {
    height: 100%;
    width: 100%;
  }
</style>
