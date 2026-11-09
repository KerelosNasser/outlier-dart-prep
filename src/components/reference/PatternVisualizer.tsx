import React, { useState } from 'react';
import { Sparkles, Layers, CheckCircle2, ChevronRight, Terminal } from 'lucide-react';
import { executeDartCode } from '../../lib/dartRunner';

interface PatternPreset {
  id: string;
  name: string;
  description: string;
  dartCode: string;
  testValues: { label: string; snippet: string }[];
}

const PRESETS: PatternPreset[] = [
  {
    id: 'record_destructuring',
    name: 'Record Destructuring with Named Fields',
    description: 'Extracts positional values and named fields from an anonymous record tuple.',
    dartCode: `String evaluateUser(dynamic input) {
  return switch (input) {
    (String name, age: >= 18, role: 'admin') => 'Superuser: \$name',
    (String name, age: >= 18, role: _) => 'Standard Adult: \$name',
    (String name, age: < 18, role: _) => 'Minor: \$name (Restricted)',
    _ => 'Invalid Record Shape',
  };
}

void main() {
  print(evaluateUser(('Alex', age: 24, role: 'admin')));
  print(evaluateUser(('Sam', age: 16, role: 'viewer')));
}`,
    testValues: [
      { label: 'Admin (Age 24)', snippet: "('Alex', age: 24, role: 'admin')" },
      { label: 'Minor (Age 16)', snippet: "('Sam', age: 16, role: 'viewer')" },
    ],
  },
  {
    id: 'sealed_hierarchy',
    name: 'Sealed Class Exhaustive State',
    description: 'Guarantees 100% compiler exhaustiveness across all sealed subclasses without a default case.',
    dartCode: `sealed class AuthState {}
class Unauthenticated extends AuthState {}
class Authenticating extends AuthState { final double progress; Authenticating(this.progress); }
class Authenticated extends AuthState { final String userId; Authenticated(this.userId); }

String describe(AuthState state) {
  // Exhaustive switch expression: No default '_' needed!
  return switch (state) {
    Unauthenticated() => 'Prompt Login',
    Authenticating(progress: var p) => 'Loading \${(p * 100).toInt()}%',
    Authenticated(userId: var id) => 'Welcome back User #\$id',
  };
}

void main() {
  print(describe(Authenticating(0.75)));
  print(describe(Authenticated('42')));
}`,
    testValues: [
      { label: 'Authenticating', snippet: 'Authenticating(0.75)' },
      { label: 'Authenticated', snippet: "Authenticated('42')" },
    ],
  },
  {
    id: 'list_patterns',
    name: 'List Patterns with Rest Elements (...)',
    description: 'Matches list structures, extracts head/tail elements, and handles variable lengths with rest patterns.',
    dartCode: `String parseCommand(List<String> args) {
  return switch (args) {
    [] => 'No arguments provided',
    ['help'] => 'Displaying manual...',
    ['run', var target, ...var flags] => 'Running \$target with flags: \$flags',
    [var cmd, ...] => 'Unrecognized command: \$cmd',
  };
}

void main() {
  print(parseCommand(['run', 'build.dart', '--release', '--verbose']));
  print(parseCommand(['help']));
}`,
    testValues: [
      { label: 'Run with flags', snippet: "['run', 'build.dart', '--release']" },
      { label: 'Empty list', snippet: '[]' },
    ],
  },
];

export const PatternVisualizer: React.FC = () => {
  const [activePreset, setActivePreset] = useState<PatternPreset>(PRESETS[0]);
  const [editorCode, setEditorCode] = useState<string>(PRESETS[0].dartCode);
  const [output, setOutput] = useState<string>('');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);

  const handleSelectPreset = (p: PatternPreset) => {
    setActivePreset(p);
    setEditorCode(p.dartCode);
    setOutput('');
  };

  const handleRunPattern = async () => {
    setIsExecuting(true);
    try {
      const res = await executeDartCode(editorCode);
      setOutput(res.stdout || res.stderr || 'No output produced.');
    } catch (err: any) {
      setOutput(`Error: ${err.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-lg p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="text-xs font-mono text-purple-400 font-medium mb-0.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>INTERACTIVE DART 3 LABORATORY</span>
          </div>
          <h2 className="text-sm font-bold text-white tracking-tight">Pattern Matching & Exhaustiveness Visualizer</h2>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 text-xs">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelectPreset(p)}
              className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap text-xs font-medium ${
                activePreset.id === p.id
                  ? 'bg-purple-950/40 border border-purple-500/40 text-purple-300'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {p.name.split(' ')[0]} Pattern
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed">
        {activePreset.description}
      </p>

      {/* Code Snippet and Live Sandbox Runner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>pattern_demo.dart</span>
            <button
              onClick={handleRunPattern}
              disabled={isExecuting}
              className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded transition-colors flex items-center gap-1 text-[11px]"
            >
              <Terminal className="w-3 h-3" />
              <span>{isExecuting ? 'Running in SDK...' : 'Run Pattern in Dart 3'}</span>
            </button>
          </div>

          <textarea
            rows={12}
            value={editorCode}
            onChange={(e) => setEditorCode(e.target.value)}
            className="w-full p-3 bg-[#0d1322] border border-slate-800 rounded font-mono text-xs text-slate-200 leading-relaxed focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="lg:col-span-4 space-y-2 flex flex-col">
          <div className="text-xs font-mono text-slate-400">Execution Output</div>
          <div className="flex-1 p-3 bg-slate-900 border border-slate-800 rounded font-mono text-xs text-slate-200 overflow-auto whitespace-pre-wrap min-h-[140px]">
            {output ? (
              output
            ) : (
              <span className="text-slate-600 font-sans text-xs">
                Click "Run Pattern in Dart 3" to compile and execute live through the native SDK.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
