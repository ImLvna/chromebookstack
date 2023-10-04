<script lang="ts">
  import * as monaco from "monaco-editor";
  import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
  import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
  import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
  import { onDestroy, onMount } from "svelte";
  import type { Writable } from "svelte/store";

  export let code: Writable<string> | string;
  export let language: Writable<string> | string;
  let editorElement: HTMLDivElement;
  export let editor: monaco.editor.IStandaloneCodeEditor | null = null;
  let model: monaco.editor.ITextModel;

  let writableCode: Writable<string>;
  let stringCode: string;
  if (typeof code === "object") {
    writableCode = code;
    code.subscribe((newCode) => {
      const oldCode = editor?.getValue();
      if (oldCode === newCode) return;
      editor?.setValue(newCode);
    });
  } else {
    stringCode = code;
  }
  let writableLanguage: Writable<string>;
  let stringLanguage: string;
  if (typeof language === "object") {
    writableLanguage = language;
    language.subscribe((newLanguage) => {
      if (!model) return;
      monaco.editor.setModelLanguage(model, newLanguage);
    });
  } else {
    stringLanguage = language;
  }

  function loadCode(code: string, language: string) {
    model = monaco.editor.createModel(code, language);

    editor!.setModel(model);
  }

  onMount(async () => {
    self.MonacoEnvironment = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    let lang = stringLanguage || $writableLanguage;

    if (writableCode) loadCode($writableCode, lang);
    else loadCode(stringCode, lang);

    editor.onDidChangeModelContent(() => {
      writableCode?.set(editor!.getValue());
    });
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
