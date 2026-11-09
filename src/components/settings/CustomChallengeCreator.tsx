import React, { useState } from 'react';
import { PlusCircle, Play, CheckCircle2, XCircle, Code2, Sparkles } from 'lucide-react';
import { executeDartCode } from '../../lib/dartRunner';

export const CustomChallengeCreator: React.FC = () => {
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [solutionCode, setSolutionCode] = useState(`int multiply(int a, int b) {
  return a * b;
}`);
  const [testHarness, setTestHarness] = useState(`void main() {
  assert(multiply(4, 5) == 20);
  assert(multiply(-2, 3) == -6);
  print("ALL_TESTS_PASS");
}`);

  const [isRunning, setIsRunning] = useState(false);
  const [testOutput, setTestOutput] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestRun = async () => {
    setIsRunning(true);
    try {
      const res = await executeDartCode(solutionCode, testHarness);
      if (res.success && res.stdout.includes('ALL_TESTS_PASS')) {
        setTestOutput({ success: true, message: 'Test harness passed cleanly in native Dart 3 SDK!' });
      } else {
        setTestOutput({
          success: false,
          message: res.stderr || res.stdout || 'Test assertion failed or failed to execute.',
        });
      }
    } catch (err: any) {
      setTestOutput({ success: false, message: `Execution failed: ${err.message}` });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <div className="text-xs font-mono text-sky-400 font-medium mb-0.5 flex items-center gap-1.5">
            <PlusCircle className="w-3.5 h-3.5" />
            <span>CUSTOM CHALLENGE BUILDER</span>
          </div>
          <h2 className="text-sm font-bold text-white tracking-tight">Create & Validate Custom Dart Exercises</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="space-y-1">
          <label className="text-slate-300 font-medium">Exercise Title:</label>
          <input
            type="text"
            placeholder="e.g. Implement Bounded Stack"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-sky-500 font-sans"
          />
        </div>

        <div className="space-y-1">
          <label className="text-slate-300 font-medium">Prompt / Requirements:</label>
          <input
            type="text"
            placeholder="e.g. Must handle overflow and throw StateError"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-sky-500 font-sans"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Solution Code (Dart 3)</span>
          </div>
          <textarea
            rows={8}
            value={solutionCode}
            onChange={(e) => setSolutionCode(e.target.value)}
            className="w-full p-3 bg-[#0d1322] border border-slate-800 rounded font-mono text-xs text-slate-200 focus:outline-none focus:border-sky-500 leading-relaxed"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Test Harness (dart test or asserts)</span>
            <button
              onClick={handleTestRun}
              disabled={isRunning}
              className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded font-sans font-medium text-[11px] flex items-center gap-1"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>{isRunning ? 'Validating...' : 'Validate in SDK'}</span>
            </button>
          </div>
          <textarea
            rows={8}
            value={testHarness}
            onChange={(e) => setTestHarness(e.target.value)}
            className="w-full p-3 bg-[#0d1322] border border-slate-800 rounded font-mono text-xs text-slate-200 focus:outline-none focus:border-sky-500 leading-relaxed"
          />
        </div>
      </div>

      {testOutput && (
        <div className={`p-3 rounded border text-xs flex items-center gap-2 font-mono ${
          testOutput.success ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300' : 'bg-rose-950/20 border-rose-500/40 text-rose-300'
        }`}>
          {testOutput.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
          <span>{testOutput.message}</span>
        </div>
      )}
    </div>
  );
};
