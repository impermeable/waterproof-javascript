import { DocChange, InputAreaStatus, markdown, Severity, TextContentOfSpecifier, ThemeStyle, WaterproofEditor, WaterproofEditorConfig, WrappingDocChange } from "@impermeable/waterproof-editor";
import intro from "./introduction.md";
import { HeaderType, processDocumentHeader } from "./processDocument";
import { exerciseData } from "./exerciseData";
import { javascript, snippets } from "@codemirror/lang-javascript";
import { defaultHighlightStyle } from "@codemirror/language";
import { dump } from "js-yaml";

// Import Waterproof editor style sheets
import "@impermeable/waterproof-editor/styles.css";
import "@impermeable/waterproof-editor/waterproof-defaults.css";

window.onload = () => { createEditor(); }

let currentHeaderData : HeaderType | null = null;

function createEditor (doc: string | undefined = undefined) {
  const editorElem = document.getElementById("editor");
  editorElem?.replaceChildren();
  
  const contents = doc ?? intro;
  
  if (editorElem === null) return;
  
  const [offset, headerData] = processDocumentHeader(contents);
  currentHeaderData = headerData;
  
  const config: WaterproofEditorConfig = {
    completions: [...snippets.map(s => ({...s, template: s.label, type: s.type?? "", detail: s.detail?? ""}))],
    symbols: [],
    api: {
      executeCommand: function (command: string, time: number): void {
      },
      executeHelp: function (): void {
      },
      editorReady: function (): void {
      },
      documentChange: function (change: DocChange | WrappingDocChange): void {
      },
      applyStepError: function (errorMessage: string): void {
      },
      cursorChange: function (cursorPosition: number): void {
      },
      viewportHint: function (start: number, end: number): void {
      }
    },
    documentConstructor: v => markdown.parse(v, {language: "js", startParsingFrom: offset}),
    tagConfiguration: markdown.configuration("js"),
    menubarEntries: [{
      title: "Check",
      hoverText: "Check the current document",
      callback: () => { checkDocument(editor, headerData.sheetId); },
      buttonVisibility: {
        showByDefault: true
      }
    }, {
      title: "Export",
      hoverText: "Export the current document",
      callback: () => { exportSheet(editor); },
      buttonVisibility: {
        showByDefault: true
      }
    }, {
      title: "Copy",
      hoverText: "Copy document to clipboard",
      callback: () => { copyDocToClipboard(editor); },
      buttonVisibility: {
        showByDefault: true
      }
    }, {
      title: "Import",
      hoverText: "Import document from filesystem",
      callback: () => { loadDocument(); },
      buttonVisibility: {
        showByDefault: true
      }
    }],
    languageConfig: {
      languageSupport: javascript(),
      highlightDark: defaultHighlightStyle,
      highlightLight: defaultHighlightStyle
    }
  }
  const editor = new WaterproofEditor(editorElem, config, ThemeStyle.Light);
  
  editor.init(contents);
}

function exportSheet(editor: WaterproofEditor) {
  const docText = editor.serializeDocument();
  if (docText === undefined || currentHeaderData === null) return;
  const yaml = dump(currentHeaderData);
  const el = document.createElement("a");
  const docTitle = currentHeaderData?.sheetTitle ?? "document";
  el.download = `${docTitle}.md`;
  const blob = new Blob(["---\n", yaml, "---\n\n", docText], {type: "text/markdown"});
  const url = URL.createObjectURL(blob);
  el.href = url;
  el.click();
}

function copyDocToClipboard(editor: WaterproofEditor) {
  const docText = editor.serializeDocument();
  if (docText === undefined) return;
  navigator.clipboard.writeText(docText);
}

function loadDocument() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".md,.txt";
  
  input.onchange = e => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = e => {
      const content = e.target?.result;
      if (typeof content === "string") {
        createEditor(content);
      }
    };
    reader.readAsText(file);
  };
  
  input.click();
}

// Check the document by extracting all code parts and running the code in workers
function checkDocument(editor: WaterproofEditor, sheetId: number) {
  const contents = editor.textContentOfInputAreas(TextContentOfSpecifier.CODE);
  
  const jsParts = contents.map(t => (t[0].matchAll(/function ([^(]+)/g).toArray())[0]);
  const name = "function ".length;
  const positions = jsParts.map((m, idx) => [name + contents[idx][1].start, name + m[1].length + contents[idx][1].start]);
  const codeParts = contents.map(m => m[0]);
  
  const workers: Array<Worker> = [];
  const passed = new Array<InputAreaStatus>(exerciseData[sheetId].length);
  let i = 0;
  
  editor.clearDiagnostics();
  editor.startSpinner();
  
  let checkedCount = 0;
  const totalExercises = codeParts.length;
  
  for (const part of codeParts) {
    const worker = new Worker("worker.js");
    workers.push(worker);
    worker.postMessage(
      {
        ...exerciseData[sheetId][i],
        code: part
      }
    );
    worker.onmessage = (e) => {
      if (!e.data.success) {
        console.error("Error:", e.data.error);
        return;
      }
      
      if (e.data.results.every((r: any) => r.pass)) {
        passed[e.data.idx] = InputAreaStatus.Correct;
      }
    };
    i++;
  }
  
  const workerPromises = workers.map((worker, idx) => new Promise<{ idx: number; data?: any; timedOut?: boolean }>(resolve => {
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      worker.terminate();
      checkedCount++;
      editor.reportProgress(checkedCount, totalExercises, `Checking exercises... (${checkedCount}/${totalExercises})`);
      resolve({ idx, timedOut: true });
    }, exerciseData[sheetId][idx].timeout);
    const handler = (e: MessageEvent) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      checkedCount++;
      editor.reportProgress(checkedCount, totalExercises, `Checking exercises... (${checkedCount}/${totalExercises})`);
      resolve({ idx, data: e.data });
    };
    worker.addEventListener("message", handler);
  }));
  
  const allWorkersDone = Promise.all(workerPromises);
  
  allWorkersDone.then(results => {
    for (const r of results) {
      if (r.timedOut) {
        console.error(`Worker ${r.idx} timed out`);
        passed[r.idx] = InputAreaStatus.Invalid;
        editor.pushDiagnostics({
          message: "Execution timed out",
          startOffset: positions[r.idx][0],
          endOffset: positions[r.idx][1],
          severity: Severity.Warning
        });
        continue;
      }
      const data = r.data;
      if (!data || !data.success) {
        console.error(`Worker ${r.idx} error:`, data?.error);
        passed[r.idx] = InputAreaStatus.Invalid;
        editor.pushDiagnostics({
          message: `Runtime error: ${data?.error}`,
          startOffset: positions[r.idx][0],
          endOffset: positions[r.idx][1],
          severity: Severity.Error
        });
        continue;
      }
      if (data.results.every((res: any) => res.pass)) {
        passed[r.idx] = InputAreaStatus.Correct;
      } else {
        passed[r.idx] = InputAreaStatus.Incorrect;
        editor.pushDiagnostics({
          message: `Not all test cases passed`,
          startOffset: positions[r.idx][0],
          endOffset: positions[r.idx][1],
          severity: Severity.Error
        });
      }
    }
    
    editor.setInputAreaStatus(passed);
    workers.forEach(worker => worker.terminate());
    editor.reportProgress(1, 1, `Done checking exercises.`);
    editor.stopSpinner();
  });
}