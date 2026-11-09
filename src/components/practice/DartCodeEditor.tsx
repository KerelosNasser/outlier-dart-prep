import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import Editor, { OnMount, loader } from '@monaco-editor/react';
import { 
  Copy, 
  Check, 
  Play, 
  FileCheck, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  Sparkles, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Eye, 
  Code2, 
  HelpCircle,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { DartDiagnostic } from '../../lib/dartRunner';

export interface DartCodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  onRun?: () => void;
  onFormat?: () => void;
  diagnostics?: DartDiagnostic[];
  isAnalyzing?: boolean;
  disabled?: boolean;
  jumpToLine?: { line: number; column?: number } | null;
}

/**
 * Configure Dart syntax tokens, completion items, and custom dark theme in Monaco
 */
function setupMonacoDartEnvironment(monaco: any) {
  // 1. Define high-contrast theme for ADHD focus and clarity
  monaco.editor.defineTheme('outlier-dart-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '64748b', fontStyle: 'italic' },
      { token: 'string', foreground: '34d399', fontStyle: 'bold' },
      { token: 'keyword', foreground: '818cf8', fontStyle: 'bold' },
      { token: 'type', foreground: '38bdf8', fontStyle: 'bold' },
      { token: 'number', foreground: 'fcd34d' },
      { token: 'annotation', foreground: 'fbbf24', fontStyle: 'bold' },
      { token: 'delimiter', foreground: '94a3b8' },
      { token: 'identifier', foreground: 'f1f5f9' },
    ],
    colors: {
      'editor.background': '#090d16',
      'editor.foreground': '#f1f5f9',
      'editorCursor.foreground': '#38bdf8',
      'editor.lineHighlightBackground': '#11182788',
      'editorLineNumber.foreground': '#475569',
      'editorLineNumber.activeForeground': '#38bdf8',
      'editor.selectionBackground': '#0284c740',
      'editor.inactiveSelectionBackground': '#0284c725',
      'editorGutter.background': '#090d16',
      'editorBracketMatch.background': '#38bdf830',
      'editorBracketMatch.border': '#38bdf8',
      'editorOverviewRuler.border': '#1e293b',
      'editorOverviewRuler.errorForeground': '#f43f5e',
      'editorOverviewRuler.warningForeground': '#f59e0b',
      'editorOverviewRuler.infoForeground': '#38bdf8',
      'editorWarning.foreground': '#f59e0b',
      'editorError.foreground': '#f43f5e',
      'editorInfo.foreground': '#38bdf8',
    },
  });

  // 2. Register Dart language configuration if not already fully registered
  try {
    monaco.languages.setLanguageConfiguration('dart', {
      comments: {
        lineComment: '//',
        blockComment: ['/*', '*/'],
      },
      brackets: [
        ['{', '}'],
        ['[', ']'],
        ['(', ')'],
      ],
      autoClosingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: "'", close: "'", notIn: ['string', 'comment'] },
        { open: '"', close: '"', notIn: ['string'] },
        { open: '`', close: '`', notIn: ['string', 'comment'] },
      ],
      surroundingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: "'", close: "'" },
        { open: '"', close: '"' },
      ],
      indentationRules: {
        increaseIndentPattern: /^.*(\{[^}]*|\([^)]*|\[[^\]]*)$/,
        decreaseIndentPattern: /^\s*(\}|\]|\)).*$/,
      },
    });

    // 3. Register Dart 3 completion provider (records, patterns, sealed classes, core types)
    monaco.languages.registerCompletionItemProvider('dart', {
      provideCompletionItems: (model: any, position: any) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const suggestions = [
          // Dart 3 keywords & constructs
          {
            label: 'sealed class',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'sealed class ${1:State} {}\n\nclass ${2:Loading} extends ${1:State} {}\nclass ${3:Success} extends ${1:State} {}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Dart 3 exhaustive sealed class hierarchy',
            range,
          },
          {
            label: 'switch pattern match',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'switch (${1:value}) {\n  ${2:case} => ${3:result},\n  _ => ${4:fallback},\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Dart 3 pattern matching switch expression',
            range,
          },
          {
            label: 'record type',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '(${1:int}, ${2:String}) ${3:record} = (${4:42}, "${5:text}");',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Dart 3 anonymous tuple record declaration',
            range,
          },
          {
            label: 'void main()',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'void main() {\n  ${1:print("Hello Dart 3");}\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Standard Dart entry point',
            range,
          },
          {
            label: 'print',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'print(${1:message});',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Prints an object to the console',
            range,
          },
          {
            label: 'final',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'final ',
            range,
          },
          {
            label: 'const',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'const ',
            range,
          },
          {
            label: 'late',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'late ',
            range,
          },
          {
            label: 'Future<void>',
            kind: monaco.languages.CompletionItemKind.TypeParameter,
            insertText: 'Future<void> ${1:fetchData}() async {\n  ${2:// await ...}\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Asynchronous Future function',
            range,
          },
          {
            label: 'Stream<T>',
            kind: monaco.languages.CompletionItemKind.TypeParameter,
            insertText: 'Stream<${1:int}> ${2:streamValues}() async* {\n  ${3:yield 1;}\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Asynchronous Stream generator',
            range,
          },
        ];

        return { suggestions };
      },
    });
  } catch {
    // Already registered or initialized
  }
}

export const DartCodeEditor: React.FC<DartCodeEditorProps> = ({
  value,
  onChange,
  onRun,
  onFormat,
  diagnostics = [],
  isAnalyzing = false,
  disabled = false,
  jumpToLine,
}) => {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);

  const [fontSize, setFontSize] = useState<number>(15);
  const [wordWrap, setWordWrap] = useState<boolean>(true);
  const [showMinimap, setShowMinimap] = useState<boolean>(false);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [copied, setCopied] = useState(false);
  const [activeDiagnostic, setActiveDiagnostic] = useState<DartDiagnostic | null>(null);

  // Separate error / warning / info counts
  const errorCount = useMemo(() => diagnostics.filter((d) => d.severity === 'error').length, [diagnostics]);
  const warningCount = useMemo(() => diagnostics.filter((d) => d.severity === 'warning').length, [diagnostics]);
  const infoCount = useMemo(() => diagnostics.filter((d) => d.severity === 'info').length, [diagnostics]);

  // Handle Monaco mounting
  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    setupMonacoDartEnvironment(monaco);
    monaco.editor.setTheme('outlier-dart-dark');

    // Track cursor movements
    editor.onDidChangeCursorPosition((e) => {
      setCursorPos({
        line: e.position.lineNumber,
        col: e.position.column,
      });

      // Find if cursor is directly on a diagnostic
      const active = diagnostics.find(
        (d) =>
          e.position.lineNumber >= d.startLine &&
          e.position.lineNumber <= d.endLine &&
          (e.position.lineNumber > d.startLine || e.position.column >= d.startColumn) &&
          (e.position.lineNumber < d.endLine || e.position.column <= d.endColumn)
      );
      setActiveDiagnostic(active || null);
    });

    // Keyboard shortcut: Run code with Cmd+Enter / Ctrl+Enter
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      onRun?.();
    });

    // Keyboard shortcut: Format code with Shift+Alt+F / Cmd+Alt+F
    editor.addCommand(monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF, () => {
      onFormat?.();
    });

    // Update markers immediately if diagnostics exist
    updateMarkers(editor, monaco, diagnostics);
  };

  // Sync model markers (inline squiggles, gutter icons, tooltips)
  const updateMarkers = useCallback((editor: any, monaco: any, diags: DartDiagnostic[]) => {
    if (!editor || !monaco) return;
    const model = editor.getModel();
    if (!model) return;

    const markers = diags.map((d) => {
      let severity = monaco.MarkerSeverity.Info;
      if (d.severity === 'error') severity = monaco.MarkerSeverity.Error;
      if (d.severity === 'warning') severity = monaco.MarkerSeverity.Warning;

      const messageDetails = d.correction
        ? `${d.message}\n\n💡 Quick Fix: ${d.correction}`
        : d.message;

      return {
        startLineNumber: Math.max(1, d.startLine),
        startColumn: Math.max(1, d.startColumn),
        endLineNumber: Math.max(d.startLine, d.endLine),
        endColumn: Math.max(d.startColumn + 1, d.endColumn),
        message: messageDetails,
        severity,
        source: 'Dart 3.13 Analyzer',
        code: d.code,
      };
    });

    monaco.editor.setModelMarkers(model, 'dart', markers);
  }, []);

  // Re-apply markers whenever diagnostics array changes
  useEffect(() => {
    if (editorRef.current && monacoRef.current) {
      updateMarkers(editorRef.current, monacoRef.current, diagnostics);
    }
  }, [diagnostics, updateMarkers]);

  // Handle jumpToLine request from problems tray
  useEffect(() => {
    if (jumpToLine && editorRef.current) {
      editorRef.current.revealLineInCenter(jumpToLine.line);
      editorRef.current.setPosition({
        lineNumber: jumpToLine.line,
        column: jumpToLine.column || 1,
      });
      editorRef.current.focus();
    }
  }, [jumpToLine]);

  // Jump to next error / warning
  const handleJumpToNextIssue = () => {
    if (diagnostics.length === 0 || !editorRef.current) return;
    const next = diagnostics.find((d) => d.startLine > cursorPos.line) || diagnostics[0];
    if (next) {
      editorRef.current.revealLineInCenter(next.startLine);
      editorRef.current.setPosition({
        lineNumber: next.startLine,
        column: next.startColumn,
      });
      editorRef.current.focus();
      setActiveDiagnostic(next);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const lineCount = useMemo(() => value.split('\n').length, [value]);

  return (
    <div className="relative flex flex-col h-full min-h-0 bg-[#090d16] border-2 border-slate-800 rounded-xl overflow-hidden focus-within:border-sky-500/80 transition-colors shadow-2xl">
      {/* Superior Monaco IDE Sub-Header Toolbar */}
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#0c1220] border-b-2 border-slate-800 text-xs shrink-0 select-none">
        {/* Left: Language badge & In-line Analyzer status badge */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-slate-300 font-bold font-mono">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span>Dart 3.13.7</span>
          </div>

          <span className="text-slate-700 font-bold">|</span>

          {/* Real-Time Live Diagnostics Indicator */}
          {isAnalyzing ? (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-sky-950/60 border border-sky-500/40 text-sky-300 font-mono text-[11px] font-bold animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
              <span>Analyzing AST...</span>
            </div>
          ) : diagnostics.length === 0 ? (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 font-mono text-[11px] font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>0 issues · Sound Type System</span>
            </div>
          ) : (
            <button
              onClick={handleJumpToNextIssue}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded font-mono text-[11px] font-bold transition-all border ${
                errorCount > 0
                  ? 'bg-rose-950/50 border-rose-500/60 text-rose-300 hover:bg-rose-900/50'
                  : 'bg-amber-950/50 border-amber-500/60 text-amber-300 hover:bg-amber-900/50'
              }`}
              title="Click to jump to next issue in code"
            >
              {errorCount > 0 ? (
                <AlertCircle className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span>
                {errorCount > 0 && `${errorCount} error${errorCount > 1 ? 's' : ''}`}
                {errorCount > 0 && warningCount > 0 && ', '}
                {warningCount > 0 && `${warningCount} warning${warningCount > 1 ? 's' : ''}`}
              </span>
              <span className="text-[10px] bg-slate-800 px-1 rounded ml-1 text-slate-300">Jump →</span>
            </button>
          )}
        </div>

        {/* Right: Quick actions & Editor controls */}
        <div className="flex items-center gap-1.5">
          {/* Zoom In/Out */}
          <button
            onClick={() => setFontSize((s) => Math.min(24, s + 1))}
            className="p-1 text-slate-400 hover:text-slate-100 rounded hover:bg-slate-800 transition-colors"
            title="Increase font size (ADHD Large Text)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setFontSize((s) => Math.max(12, s - 1))}
            className="p-1 text-slate-400 hover:text-slate-100 rounded hover:bg-slate-800 transition-colors"
            title="Decrease font size"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          {/* Word Wrap Toggle */}
          <button
            onClick={() => setWordWrap((w) => !w)}
            className={`px-1.5 py-0.5 text-[11px] font-mono rounded font-bold border transition-colors ${
              wordWrap ? 'bg-sky-950/60 border-sky-500/50 text-sky-300' : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
            title="Toggle word wrap"
          >
            Wrap
          </button>

          {/* Minimap Toggle */}
          <button
            onClick={() => setShowMinimap((m) => !m)}
            className={`px-1.5 py-0.5 text-[11px] font-mono rounded font-bold border transition-colors ${
              showMinimap ? 'bg-sky-950/60 border-sky-500/50 text-sky-300' : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
            title="Toggle code minimap"
          >
            Map
          </button>

          <span className="text-slate-700">|</span>

          {/* Copy Code */}
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors"
            title="Copy code to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Active In-line Diagnostic Banner if cursor is right on an error */}
      {activeDiagnostic && (
        <div
          className={`flex items-start justify-between gap-3 px-4 py-2 border-b text-xs font-mono shrink-0 transition-all ${
            activeDiagnostic.severity === 'error'
              ? 'bg-rose-950/40 border-rose-500/50 text-rose-200'
              : 'bg-amber-950/40 border-amber-500/50 text-amber-200'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {activeDiagnostic.severity === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-bold flex items-center gap-2">
                <span>Line {activeDiagnostic.startLine}, Col {activeDiagnostic.startColumn}:</span>
                <span className="text-[11px] px-1.5 py-0.2 rounded bg-black/40 border border-current font-bold uppercase">
                  {activeDiagnostic.code}
                </span>
              </div>
              <div className="mt-0.5 font-sans font-semibold text-white leading-relaxed">
                {activeDiagnostic.message}
              </div>
              {activeDiagnostic.correction && (
                <div className="mt-1 text-emerald-300 font-sans font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Fix suggestion: {activeDiagnostic.correction}</span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setActiveDiagnostic(null)}
            className="text-slate-400 hover:text-white text-xs px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Monaco Editor Container */}
      <div className="relative flex-1 h-full min-h-0 overflow-hidden bg-[#090d16]">
        <Editor
          height="100%"
          language="dart"
          theme="outlier-dart-dark"
          value={value}
          onChange={(val) => onChange(val || '')}
          onMount={handleEditorDidMount}
          loading={
            <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400 font-mono text-sm">
              <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
              <span>Initializing Monaco Dart Engine...</span>
            </div>
          }
          options={{
            fontSize,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Menlo, monospace",
            fontWeight: '600',
            lineHeight: Math.round(fontSize * 1.7),
            minimap: { enabled: showMinimap },
            scrollBeyondLastLine: false,
            wordWrap: wordWrap ? 'on' : 'off',
            tabSize: 2,
            insertSpaces: true,
            automaticLayout: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            smoothScrolling: true,
            bracketPairColorization: { enabled: true },
            guides: { bracketPairs: true, indentation: true },
            padding: { top: 12, bottom: 12 },
            renderLineHighlight: 'all',
            folding: true,
            glyphMargin: true,
            quickSuggestions: true,
            suggestOnTriggerCharacters: true,
            parameterHints: { enabled: true },
            readOnly: disabled,
          }}
        />
      </div>

      {/* Editor Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#0c1220] border-t-2 border-slate-800 text-xs font-mono font-bold text-slate-400 select-none shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="text-sky-400">Ln {cursorPos.line}</span>
            <span>,</span>
            <span className="text-sky-400">Col {cursorPos.col}</span>
          </div>
          <span className="text-slate-700">·</span>
          <span>{lineCount} lines</span>
          <span className="text-slate-700 hidden sm:inline">·</span>
          <span className="text-slate-400 hidden sm:inline">UTF-8</span>
          <span className="text-slate-700 hidden md:inline">·</span>
          <span className="text-slate-400 hidden md:inline">2 Spaces</span>
          <span className="text-slate-700 hidden lg:inline">·</span>
          <span className="text-slate-400 hidden lg:inline">Dart 3 AST</span>
        </div>

        <div className="flex items-center gap-3">
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-400">
            ⌘↵ Run
          </kbd>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-400">
            ⇧⌥F Format
          </kbd>
        </div>
      </div>
    </div>
  );
};
