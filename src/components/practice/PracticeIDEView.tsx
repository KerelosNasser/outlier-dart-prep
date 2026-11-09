import React, { useState, useEffect, useRef } from 'react';
import { DartCodeEditor } from './DartCodeEditor';
import confetti from 'canvas-confetti';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RotateCcw, 
  Lightbulb, 
  Terminal, 
  Sparkles, 
  BookOpen, 
  Check, 
  ChevronRight,
  Code2,
  FileCheck
} from 'lucide-react';
import { Question, UserAttempt } from '../../types';
import { executeDartCode, analyzeDartCode, formatDartCode, DartRunResult, DartDiagnostic } from '../../lib/dartRunner';
import { recordAttempt, saveCodeDraft, getCodeDraft } from '../../lib/storage';
import { deriveQualityRating } from '../../lib/adaptive';

interface PracticeIDEViewProps {
  question: Question;
  onNextQuestion?: () => void;
  onBackToCurriculum?: () => void;
}

export const PracticeIDEView: React.FC<PracticeIDEViewProps> = ({
  question,
  onNextQuestion,
  onBackToCurriculum,
}) => {
  // Code editor state
  const [code, setCode] = useState<string>(question.starterCode || question.brokenCode || '');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [revealedHints, setRevealedHints] = useState<number>(0);

  // Execution, Diagnostics & Test states
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [diagnostics, setDiagnostics] = useState<DartDiagnostic[]>([]);
  const [jumpToLine, setJumpToLine] = useState<{ line: number; column?: number } | null>(null);
  const [runResult, setRunResult] = useState<DartRunResult | null>(null);
  const [analysisOutput, setAnalysisOutput] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<{ id: string; name: string; passed: boolean; message?: string }[]>([]);
  const [activeConsoleTab, setActiveConsoleTab] = useState<'problems' | 'tests' | 'console' | 'explanation'>('problems');

  // Submission state
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [submissionFeedback, setSubmissionFeedback] = useState<string>('');
  const startTimeRef = useRef<number>(Date.now());

  // Load saved draft if exists
  useEffect(() => {
    let isMounted = true;
    startTimeRef.current = Date.now();
    setIsSubmitted(false);
    setIsSuccess(false);
    setSelectedOption(null);
    setRunResult(null);
    setTestResults([]);
    setRevealedHints(0);
    setSubmissionFeedback('');

    getCodeDraft(question.id).then((draft) => {
      if (isMounted) {
        if (draft) {
          setCode(draft);
        } else {
          const defaultTemplate = question.starterCode || question.brokenCode || 
            `// Dart 3 Playground: ${question.title}\n// Domain: ${question.moduleName} · ${question.topic}\n\nvoid main() {\n  print('Dart Mastery Lab is ready.');\n  // Test hypotheses or experiment with modern Dart features here!\n}\n`;
          setCode(defaultTemplate);
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, [question.id]);

  // Auto-save code drafts
  const handleCodeChange = (newCode: string | undefined) => {
    const val = newCode || '';
    setCode(val);
    saveCodeDraft(question.id, val);
  };

  // Live debounced static analysis (runs 400ms after user pauses typing)
  useEffect(() => {
    let isCancelled = false;
    const timer = setTimeout(async () => {
      setIsAnalyzing(true);
      try {
        const result = await analyzeDartCode(code);
        if (!isCancelled) {
          setDiagnostics(result.diagnostics || []);
          setAnalysisOutput(result.output || 'No analysis issues found. Code conforms to analyzer rules.');
        }
      } catch (err: any) {
        if (!isCancelled) {
          setAnalysisOutput(`Analysis check failed: ${err.message}`);
        }
      } finally {
        if (!isCancelled) {
          setIsAnalyzing(false);
        }
      }
    }, 400);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [code]);

  // Run student code independently in native Dart 3 sandbox
  const handleRunCode = async () => {
    setIsRunning(true);
    setActiveConsoleTab('console');
    try {
      const result = await executeDartCode(code);
      setRunResult(result);
      // If compile error, also refresh analysis
      if (result.isCompileError) {
        const analysis = await analyzeDartCode(code);
        setDiagnostics(analysis.diagnostics || []);
      }
    } catch (err: any) {
      setRunResult({
        success: false,
        exitCode: 1,
        stdout: '',
        stderr: `Execution error: ${err.message}`,
        isCompileError: false,
        isRuntimeError: true,
        durationMs: 0,
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Run manual static analysis on code and focus problems panel
  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setActiveConsoleTab('problems');
    try {
      const result = await analyzeDartCode(code);
      setDiagnostics(result.diagnostics || []);
      setAnalysisOutput(result.output || 'No analysis issues found. Code conforms to analyzer rules.');
    } catch (err: any) {
      setAnalysisOutput(`Analysis check failed: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Auto-format using official Effective Dart formatter
  const handleFormat = async () => {
    try {
      const result = await formatDartCode(code);
      if (result.success && result.formattedCode) {
        setCode(result.formattedCode);
        saveCodeDraft(question.id, result.formattedCode);
      }
    } catch (err) {
      console.warn('Format failed', err);
    }
  };

  // Reset to original starter code
  const handleReset = () => {
    const defaultCode = question.starterCode || question.brokenCode || 
      `// Dart 3 Playground: ${question.title}\n// Domain: ${question.moduleName} · ${question.topic}\n\nvoid main() {\n  print('Dart Mastery Lab is ready.');\n  // Test hypotheses or experiment with modern Dart features here!\n}\n`;
    setCode(defaultCode);
    saveCodeDraft(question.id, defaultCode);
    setRunResult(null);
    setTestResults([]);
  };

  // Reveal next hint progressively (1 to 4)
  const handleRevealNextHint = () => {
    if (revealedHints < question.hints.length) {
      setRevealedHints((prev) => prev + 1);
    }
  };

  // Evaluate submission (MCQ or Automated Tests)
  const handleSubmit = async () => {
    const elapsedSeconds = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
    let passed = false;
    let earnedScore = 0;
    let feedback = '';

    // Case 1: MCQ / Options
    if (question.options && question.options.length > 0) {
      if (!selectedOption) {
        setSubmissionFeedback('⚠️ Please select an answer option from the choices on the left before submitting.');
        setIsSubmitted(true);
        setIsSuccess(false);
        setActiveConsoleTab('explanation');
        return;
      }

      const selected = question.options.find((o) => o.id === selectedOption);
      passed = !!selected?.isCorrect;
      earnedScore = passed ? Math.max(10, 100 - revealedHints * 20) : 0;
      feedback = passed
        ? 'Correct answer! Your analysis aligns with the modern Dart language specification.'
        : 'Incorrect. Review the detailed explanation and Dart rule below to understand why.';
    } 
    // Case 2: Code challenge / Debugging with test cases
    else if (question.testCases && question.testCases.length > 0) {
      setIsRunning(true);
      setActiveConsoleTab('tests');

      const results: { id: string; name: string; passed: boolean; message?: string }[] = [];
      let allPassed = true;

      for (const tc of question.testCases) {
        // Run code with appended test harness
        const testRes = await executeDartCode(code, tc.testCode);
        const testPassed = testRes.success && (testRes.stdout.includes('PASS') || testRes.exitCode === 0);
        if (!testPassed) allPassed = false;

        results.push({
          id: tc.id,
          name: tc.name,
          passed: testPassed,
          message: testRes.stderr || (testPassed ? 'Test passed' : 'Assertion failed'),
        });
      }

      setTestResults(results);
      passed = allPassed;
      earnedScore = passed ? Math.max(20, 100 - revealedHints * 15) : 10;
      feedback = passed
        ? 'All test cases passed! Your Dart implementation satisfied all functional and edge-case requirements.'
        : 'One or more test assertions failed. Inspect the test case outputs and adjust your implementation.';
      setIsRunning(false);
    } else {
      // Freeform or review
      passed = true;
      earnedScore = 85;
      feedback = 'Submission recorded. Compare your reasoning with the reference solution.';
    }

    setIsSubmitted(true);
    setIsSuccess(passed);
    setSubmissionFeedback(feedback);
    setActiveConsoleTab('explanation');

    if (passed) {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.8 },
      });
    }

    // Record attempt in IndexedDB
    const attempt: UserAttempt = {
      id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      questionId: question.id,
      timestamp: Date.now(),
      timeSpentSeconds: elapsedSeconds,
      isCorrect: passed,
      score: earnedScore,
      submittedCode: code,
      selectedOptionId: selectedOption || undefined,
      hintsRevealed: revealedHints,
      feedback,
      taskType: question.taskType,
      moduleId: question.moduleId,
    };

    await recordAttempt(attempt);
  };

  const isCodeChallenge = question.taskType === 'coding_challenge' || 
                          question.taskType === 'debugging' || 
                          question.taskType === 'project_simulation';

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-full overflow-hidden bg-[#0b0f19]">
      {/* Exercise Subheader Bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-[#0f172a] border-b-2 border-slate-800 text-xs md:text-sm shrink-0 font-bold">
        <div className="flex items-center gap-3">
          {onBackToCurriculum && (
            <button
              onClick={onBackToCurriculum}
              className="text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 font-bold"
            >
              <BookOpen className="w-4 h-4 text-sky-400" />
              <span>Curriculum</span>
            </button>
          )}
          <span className="text-slate-600 font-mono">/</span>
          <span className="text-slate-300 font-mono font-bold">{question.moduleName}</span>
          <span className="text-slate-600 font-mono">/</span>
          <span className="text-white font-extrabold truncate max-w-md">{question.title}</span>
        </div>

        <div className="flex items-center gap-3">
          {isSubmitted && isSuccess && onNextQuestion && (
            <button
              onClick={onNextQuestion}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs md:text-sm rounded-lg flex items-center gap-1 shadow-lg shadow-emerald-600/30 transition-all hover:scale-105 active:scale-95"
            >
              <span>Next Challenge</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
          <span className="text-slate-300 font-mono font-bold capitalize">{question.taskType.replace('_', ' ')}</span>
          <span className="text-slate-600">·</span>
          <span className="text-amber-400 font-mono font-bold capitalize">{question.difficulty}</span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-300 font-mono font-bold">~{question.estimatedMinutes}m</span>
        </div>
      </div>

      {/* Main 2-Pane Workspace (Left: Instructions & Guidance, Right: Code Editor & Console) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">
        {/* Left Column: Challenge Prompt, Hints, Objectives (5 cols) */}
        <div className="lg:col-span-5 border-r-2 border-slate-800 overflow-y-auto p-6 md:p-7 space-y-6 bg-[#0f172a]/70">
          <div>
            <div className="text-xs md:text-sm font-mono text-sky-400 font-extrabold mb-1.5 uppercase tracking-wider">
              {question.topic} · {question.subtopic}
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-snug">
              {question.title}
            </h1>
          </div>

          {/* Prompt Brief (ADHD High-Contrast Visual Focus Box) */}
          <div className="text-base md:text-[17px] text-slate-100 font-medium whitespace-pre-line leading-relaxed bg-[#111827] p-5 rounded-xl border-2 border-slate-700/80 border-l-4 border-l-sky-400 shadow-md">
            {question.prompt}
          </div>

          {/* If MCQ / Code Tracing Options */}
          {question.options && question.options.length > 0 && (
            <div className="space-y-3">
              <div className="text-xs md:text-sm font-black text-slate-200 uppercase tracking-wider">
                Select the correct answer:
              </div>
              {question.options.map((opt) => {
                const isSelected = selectedOption === opt.id;
                let borderClass = 'border-2 border-slate-700/80 hover:border-slate-500 bg-slate-900/80';
                if (isSelected) borderClass = 'border-2 border-sky-400 bg-sky-950/40 text-white font-extrabold shadow-sm';
                if (isSubmitted && opt.isCorrect) borderClass = 'border-2 border-emerald-400 bg-emerald-950/40 text-emerald-100 font-extrabold';
                if (isSubmitted && isSelected && !opt.isCorrect) borderClass = 'border-2 border-rose-500 bg-rose-950/40 text-rose-100 font-extrabold';

                return (
                  <div
                    key={opt.id}
                    onClick={() => !isSubmitted && setSelectedOption(opt.id)}
                    className={`p-4 rounded-xl cursor-pointer transition-all text-sm md:text-base font-bold leading-relaxed shadow-sm ${borderClass}`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div className={`w-5 h-5 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center ${
                        isSelected ? 'border-sky-400 bg-sky-500' : 'border-slate-500'
                      }`}>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <span className="text-slate-100 whitespace-pre-line leading-relaxed">{opt.text}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Learning Objectives */}
          {question.learningObjectives && question.learningObjectives.length > 0 && (
            <div className="p-5 bg-slate-900/80 border-2 border-slate-800 rounded-xl space-y-2.5 shadow-sm">
              <div className="text-sm font-black text-slate-200 flex items-center gap-2">
                <Check className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Competence Objectives</span>
              </div>
              <ul className="text-sm text-slate-300 font-semibold space-y-1.5 list-disc pl-5 leading-relaxed">
                {question.learningObjectives.map((obj, i) => (
                  <li key={i}>{obj}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 4-Tier Progressive Hint Ladder */}
          {question.hints && question.hints.length > 0 && (
            <div className="p-5 bg-slate-900/80 border-2 border-amber-500/30 rounded-xl space-y-3.5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-black text-amber-400">
                  <Lightbulb className="w-4 h-4" />
                  <span>Progressive Hint Ladder</span>
                </div>
                <span className="text-xs font-mono font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {revealedHints} of {question.hints.length} revealed
                </span>
              </div>

              {/* Revealed hints */}
              <div className="space-y-2.5">
                {question.hints.slice(0, revealedHints).map((hint, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-800/80 rounded-lg text-sm border border-slate-700 space-y-1">
                    <div className="text-amber-300 font-bold">Hint {hint.level}: {hint.title}</div>
                    <div className="text-slate-200 text-xs md:text-sm font-medium leading-relaxed">{hint.content}</div>
                  </div>
                ))}
              </div>

              {revealedHints < question.hints.length && (
                <button
                  onClick={handleRevealNextHint}
                  className="w-full py-2.5 text-sm font-black text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border-2 border-amber-500/40 rounded-lg transition-colors shadow-sm"
                >
                  Unlock Hint {revealedHints + 1}
                </button>
              )}
            </div>
          )}

          {/* Submission Feedback & Explanation */}
          {isSubmitted && (
            <div className={`p-5 rounded-xl border-2 text-sm space-y-3.5 shadow-md ${
              isSuccess ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200' : 'bg-rose-950/30 border-rose-500/50 text-rose-200'
            }`}>
              <div className="flex items-center gap-2.5 font-black text-base">
                {isSuccess ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <XCircle className="w-5 h-5 text-rose-400" />}
                <span>{isSuccess ? 'Assessment Passed' : 'Needs Correction'}</span>
              </div>
              <p className="text-slate-100 font-semibold leading-relaxed">{submissionFeedback}</p>

              {/* Core Reasoning & Dart Rule */}
              {question.explanation && (
                <div className="pt-3 border-t border-slate-800 text-slate-200 space-y-2">
                  <div className="font-bold text-sky-400 text-sm">Dart Rule & Soundness:</div>
                  <div className="text-xs md:text-sm font-medium leading-relaxed text-slate-200">
                    {question.explanation.coreReasoning}
                  </div>
                  {question.explanation.dartRule && (
                    <div className="p-3 bg-slate-900 rounded-lg font-mono text-xs md:text-sm font-bold text-slate-200 border border-slate-800">
                      {question.explanation.dartRule}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Code Editor & Execution Console (7 cols) */}
        <div className="lg:col-span-7 flex flex-col min-h-0 bg-[#0d1322]">
          {/* Editor Action Toolbar */}
          <div className="flex items-center justify-between px-5 py-2.5 bg-[#0d1322] border-b-2 border-slate-800 text-xs md:text-sm">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-slate-200">main.dart</span>
              <span className="text-slate-600 font-bold">·</span>
              <span className="text-emerald-400 font-mono text-xs font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                <span>Auto-saved</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleFormat}
                className="px-2.5 md:px-3 py-1.5 text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors text-xs font-bold border border-slate-700 shadow-sm"
                title="Auto-format using Effective Dart style guide"
              >
                Format
              </button>

              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="px-2.5 md:px-3 py-1.5 text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors text-xs font-bold flex items-center gap-1.5 border border-slate-700 shadow-sm disabled:opacity-50"
                title="Run dart analyze static diagnostics"
              >
                <FileCheck className="w-3.5 h-3.5 text-sky-400" />
                <span>{isAnalyzing ? 'Analyzing...' : 'Analyze'}</span>
              </button>

              <button
                onClick={handleReset}
                className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg transition-colors border border-transparent hover:border-slate-700"
                title="Reset code to original starter state"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={handleRunCode}
                disabled={isRunning}
                className="px-3.5 md:px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-white font-extrabold rounded-lg transition-all flex items-center gap-1.5 text-xs md:text-sm border-2 border-sky-500/50 shadow-sm disabled:opacity-50"
                title="Run Dart code (Ctrl+Enter / Cmd+Enter)"
              >
                <Play className="w-3.5 h-3.5 fill-current text-sky-400" />
                <span>{isRunning ? 'Running...' : 'Run Code'}</span>
                <kbd className="hidden xl:inline text-[10px] px-1 bg-slate-900 border border-slate-700 rounded text-slate-400 font-mono">
                  ⌘↵
                </kbd>
              </button>

              <button
                onClick={handleSubmit}
                disabled={isRunning}
                className="px-4 md:px-5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-black rounded-lg transition-all flex items-center gap-1.5 text-xs md:text-sm shadow-md hover:shadow-sky-500/25 active:scale-[0.98] disabled:opacity-50"
              >
                <span>
                  {question.options && question.options.length > 0
                    ? isSubmitted
                      ? 'Re-Check Answer'
                      : 'Check Answer'
                    : isSubmitted
                    ? 'Re-Run Tests'
                    : 'Run Tests & Submit'}
                </span>
              </button>
            </div>
          </div>

          {/* Dart Code Editor */}
          <div className="flex-1 min-h-0 p-2.5 overflow-hidden">
            <DartCodeEditor
              value={code}
              onChange={handleCodeChange}
              onRun={handleRunCode}
              onFormat={handleFormat}
              diagnostics={diagnostics}
              isAnalyzing={isAnalyzing}
              jumpToLine={jumpToLine}
            />
          </div>

          {/* Bottom Execution Console & Diagnostics */}
          <div className="h-56 md:h-64 border-t-2 border-slate-800 bg-[#090d16] flex flex-col shrink-0 z-20">
            {/* Console Tab Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#0d1322] border-b-2 border-slate-800 text-xs font-bold">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {/* Problems Tab (Primary In-Line Diagnostics Tray) */}
                <button
                  onClick={() => setActiveConsoleTab('problems')}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                    activeConsoleTab === 'problems'
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50 font-black'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {diagnostics.length > 0 ? (
                    diagnostics.some((d) => d.severity === 'error') ? (
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                    )
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  )}
                  <span>Problems ({diagnostics.length})</span>
                </button>

                {/* Test Results Tab */}
                <button
                  onClick={() => setActiveConsoleTab('tests')}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                    activeConsoleTab === 'tests'
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50 font-black'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Test Results ({testResults.filter((t) => t.passed).length}/{testResults.length})
                </button>

                {/* Output Console Tab */}
                <button
                  onClick={() => setActiveConsoleTab('console')}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                    activeConsoleTab === 'console'
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50 font-black'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Output Console
                </button>

                {/* Solution Tab */}
                <button
                  onClick={() => setActiveConsoleTab('explanation')}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                    activeConsoleTab === 'explanation'
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50 font-black'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Dart Solution & Rules
                </button>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {runResult && (
                  <div className="text-slate-400 font-mono text-xs font-bold hidden sm:block">
                    Execution: {runResult.durationMs}ms · Exit: {runResult.exitCode}
                  </div>
                )}
                {(runResult || diagnostics.length > 0) && (
                  <button
                    onClick={() => {
                      setRunResult(null);
                      setAnalysisOutput(null);
                    }}
                    className="px-2 py-0.5 text-[11px] text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors"
                  >
                    Clear Console
                  </button>
                )}
              </div>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto p-3 font-mono text-xs text-slate-300">
              {/* Problems Tab Content */}
              {activeConsoleTab === 'problems' && (
                <div className="space-y-2">
                  {diagnostics.length === 0 ? (
                    <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 font-sans flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                      <div>
                        <div className="font-bold text-sm">No Problems Detected</div>
                        <div className="text-xs text-slate-300 mt-0.5">
                          Code conforms to the Dart 3 sound type system and static analyzer rules.
                        </div>
                      </div>
                    </div>
                  ) : (
                    diagnostics.map((diag, index) => {
                      const isError = diag.severity === 'error';
                      const isWarning = diag.severity === 'warning';
                      return (
                        <div
                          key={index}
                          onClick={() => setJumpToLine({ line: diag.startLine, column: diag.startColumn })}
                          className={`p-3 rounded-lg border text-xs cursor-pointer transition-all hover:scale-[1.005] group ${
                            isError
                              ? 'bg-rose-950/20 border-rose-500/40 hover:border-rose-400 text-rose-200'
                              : isWarning
                              ? 'bg-amber-950/20 border-amber-500/40 hover:border-amber-400 text-amber-200'
                              : 'bg-sky-950/20 border-sky-500/40 hover:border-sky-400 text-sky-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-2.5">
                              {isError ? (
                                <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                              ) : isWarning ? (
                                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                              )}
                              <div>
                                <div className="font-sans font-semibold text-slate-100 leading-snug">
                                  {diag.message}
                                </div>
                                {diag.correction && (
                                  <div className="mt-1 text-emerald-300 font-sans font-bold flex items-center gap-1">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>Fix: {diag.correction}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="px-1.5 py-0.5 rounded bg-black/50 border border-slate-700 font-mono text-[11px] font-bold text-slate-300 group-hover:border-sky-400 group-hover:text-white transition-colors">
                                Ln {diag.startLine}:{diag.startColumn}
                              </span>
                              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-400 uppercase">
                                {diag.code}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Test Results Tab Content */}
              {activeConsoleTab === 'tests' && (
                <div className="space-y-2">
                  {testResults.length === 0 ? (
                    <div className="text-slate-500 font-sans text-xs py-4 text-center">
                      Click "Run Tests & Submit" to execute automated unit test assertions against native Dart 3 SDK.
                    </div>
                  ) : (
                    testResults.map((t) => (
                      <div
                        key={t.id}
                        className={`p-2.5 rounded border text-xs flex items-start justify-between gap-3 ${
                          t.passed
                            ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                            : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {t.passed ? (
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          )}
                          <span className="font-sans font-medium text-slate-200">{t.name}</span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">{t.message}</span>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Console Tab Content */}
              {activeConsoleTab === 'console' && (
                <div>
                  {runResult ? (
                    <div className="space-y-1">
                      {runResult.stdout && (
                        <pre className="text-slate-200 whitespace-pre-wrap">{runResult.stdout}</pre>
                      )}
                      {runResult.stderr && (
                        <pre className="text-rose-400 whitespace-pre-wrap">{runResult.stderr}</pre>
                      )}
                      {!runResult.stdout && !runResult.stderr && (
                        <div className="text-slate-500">Program executed with 0 output lines.</div>
                      )}
                    </div>
                  ) : (
                    <div className="text-slate-500 font-sans text-xs py-4 text-center">
                      Click "Run Code" (⌘↵ / Ctrl+Enter) to execute your program in Dart 3 sandbox.
                    </div>
                  )}
                </div>
              )}

              {/* Solution Tab Content */}
              {activeConsoleTab === 'explanation' && (
                <div className="space-y-3 font-sans text-xs">
                  {question.referenceSolution && (
                    <div className="space-y-1">
                      <div className="text-sky-400 font-semibold">Reference Solution:</div>
                      <pre className="p-3 bg-slate-900 rounded font-mono text-xs text-slate-200 border border-slate-800 overflow-x-auto">
                        {question.referenceSolution}
                      </pre>
                    </div>
                  )}
                  {question.explanation && (
                    <div className="space-y-1">
                      <div className="text-amber-400 font-semibold">Why this works in Dart:</div>
                      <p className="text-slate-300 leading-relaxed">{question.explanation.coreReasoning}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
