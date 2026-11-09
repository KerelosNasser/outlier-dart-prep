import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Scale, 
  Send, 
  HelpCircle, 
  FileText, 
  ShieldCheck,
  Check,
  ChevronRight,
  TrendingUp,
  Award,
  Zap,
  Info
} from 'lucide-react';
import { Question } from '../../types';
import { recordAttempt } from '../../lib/storage';

interface OutlierSimulatorViewProps {
  questions: Question[];
  onSelectQuestion: (question: Question) => void;
}

export const OutlierSimulatorView: React.FC<OutlierSimulatorViewProps> = ({
  questions,
  onSelectQuestion,
}) => {
  // Filter for Outlier-specific tasks
  const outlierQuestions = questions.filter((q) => 
    q.taskType === 'ai_comparison' || 
    q.taskType === 'code_review' || 
    q.taskType === 'prompt_rubric' ||
    q.taskType === 'debugging'
  );

  const [activeTask, setActiveTask] = useState<Question>(outlierQuestions[0] || questions[0]);
  const [selectedVerdict, setSelectedVerdict] = useState<string>('');
  const [justification, setJustification] = useState<string>('');
  const [ratings, setRatings] = useState<{ correctness: number; nullSafety: number; style: number; performance: number }>({
    correctness: 4,
    nullSafety: 4,
    style: 4,
    performance: 4,
  });
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Switch task
  const handleSelectTask = (task: Question) => {
    setActiveTask(task);
    setSelectedVerdict('');
    setJustification('');
    setIsSubmitted(false);
  };

  // Comprehensive justification heuristics
  const analysis = useMemo(() => {
    const text = justification.trim();
    const wordCount = text ? text.split(/\s+/).length : 0;
    
    const hasLineCitation = /line\s*\d+|at\s+line|\bl\d+\b|line\s*#?\d+/i.test(text);
    const hasComplexity = /complexity|o\([1nlogk\^]+\)|time\s+complexity|space\s+complexity|overhead|memory/i.test(text);
    const hasNullSafety = /null|sound|assertion|late|unhandled|promotion|\!|\?|npe|nullable/i.test(text);
    const hasApiOrIdiom = /effective\s+dart|idiom|standard|putifabsent|builder|unmodifiable|list\.filled|records/i.test(text);
    const hasEdgeCases = /edge\s+case|empty|boundary|overflow|race\s+condition|leak|zero|negative/i.test(text);
    const hasRecommendation = /prefer|recommend|should|instead|refactor|better|optimal/i.test(text);

    // Compute score out of 100
    let score = 0;
    if (wordCount >= 50) score += 20;
    else if (wordCount >= 25) score += 10;
    else if (wordCount > 5) score += 5;

    if (hasLineCitation) score += 20;
    if (hasNullSafety) score += 15;
    if (hasComplexity) score += 15;
    if (hasApiOrIdiom) score += 15;
    if (hasEdgeCases) score += 15;

    let tier: 'S' | 'A' | 'B' | 'Needs Work' = 'Needs Work';
    let tierColor = 'text-slate-400';
    let tierBadge = 'border-slate-700 bg-slate-800 text-slate-300';

    if (score >= 85) {
      tier = 'S';
      tierColor = 'text-amber-400';
      tierBadge = 'border-amber-500/40 bg-amber-500/10 text-amber-300';
    } else if (score >= 70) {
      tier = 'A';
      tierColor = 'text-emerald-400';
      tierBadge = 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300';
    } else if (score >= 50) {
      tier = 'B';
      tierColor = 'text-sky-400';
      tierBadge = 'border-sky-500/40 bg-sky-500/10 text-sky-300';
    }

    return {
      wordCount,
      hasLineCitation,
      hasComplexity,
      hasNullSafety,
      hasApiOrIdiom,
      hasEdgeCases,
      hasRecommendation,
      score,
      tier,
      tierColor,
      tierBadge,
    };
  }, [justification]);

  const handleInsertSnippet = (snippet: string) => {
    setJustification((prev) => (prev ? `${prev} ${snippet}` : snippet));
  };

  const handleSubmitEvaluation = async () => {
    if (!selectedVerdict) return;
    setIsSubmitted(true);
    confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });

    await recordAttempt({
      id: `sim_${Date.now()}`,
      questionId: activeTask.id,
      timestamp: Date.now(),
      timeSpentSeconds: 180,
      isCorrect: true,
      score: Math.max(70, analysis.score),
      justificationText: justification,
      hintsRevealed: 0,
      feedback: `Outlier evaluation recorded. Justification Rigor Score: ${analysis.score}% (${analysis.tier}-Tier).`,
      taskType: activeTask.taskType,
      moduleId: activeTask.moduleId,
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b-2 border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs md:text-sm font-mono font-extrabold text-amber-400 mb-1">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>OUTLIER WORK SIMULATOR · AI RLHF LAB</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Model Evaluation & Justification Workbench
          </h1>
          <p className="text-sm font-semibold text-slate-300 mt-1">
            Practice side-by-side model comparison, bug diagnostics, and rigorous rubric-based justification writing.
          </p>
        </div>

        {/* Task selector */}
        <div className="flex items-center gap-2 overflow-x-auto py-1 text-sm font-bold">
          {outlierQuestions.map((q) => (
            <button
              key={q.id}
              onClick={() => handleSelectTask(q)}
              className={`px-4 py-2 rounded-lg transition-all whitespace-nowrap shrink-0 border-2 ${
                activeTask.id === q.id
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 font-black shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
              }`}
            >
              {q.taskType === 'ai_comparison' ? 'Model Comparison' : q.taskType === 'prompt_rubric' ? 'Prompt & Rubric' : 'Code Review'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Simulation Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: Code implementations (Model A vs Model B) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#111827] border-2 border-slate-800 rounded-xl p-6 space-y-4 shadow-sm">
            <div>
              <div className="text-xs md:text-sm font-mono text-slate-400 font-extrabold uppercase tracking-wider mb-1.5">
                {activeTask.moduleName} · {activeTask.topic}
              </div>
              <h2 className="text-xl md:text-2xl font-black text-white">{activeTask.title}</h2>
              <div className="text-base text-slate-100 font-medium mt-3 leading-relaxed bg-[#0d1322] p-4 rounded-lg border-2 border-slate-800 border-l-4 border-l-amber-400">
                {activeTask.prompt}
              </div>
            </div>

            {/* If Side-by-Side Model Comparison */}
            {activeTask.modelA && activeTask.modelB && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Model A */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs md:text-sm font-mono pb-1 border-b border-slate-800">
                    <span className="text-sky-400 font-black">Candidate: Model A</span>
                    <span className="text-slate-400 font-bold">Dart 3.x</span>
                  </div>
                  <pre className="p-4 bg-[#0d1322] border-2 border-slate-800 rounded-lg text-sm md:text-[15px] font-mono font-semibold text-slate-100 overflow-x-auto h-72 leading-relaxed selection:bg-sky-500/30">
                    {activeTask.modelA.code}
                  </pre>
                </div>

                {/* Model B */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs md:text-sm font-mono pb-1 border-b border-slate-800">
                    <span className="text-emerald-400 font-black">Candidate: Model B</span>
                    <span className="text-slate-400 font-bold">Dart 3.x</span>
                  </div>
                  <pre className="p-4 bg-[#0d1322] border-2 border-slate-800 rounded-lg text-sm md:text-[15px] font-mono font-semibold text-slate-100 overflow-x-auto h-72 leading-relaxed selection:bg-emerald-500/30">
                    {activeTask.modelB.code}
                  </pre>
                </div>
              </div>
            )}

            {/* If Single Implementation for Review or Debugging */}
            {activeTask.starterCode && !activeTask.modelA && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs md:text-sm font-mono pb-1 border-b border-slate-800">
                  <span className="text-amber-400 font-black">Candidate Code Under Review</span>
                  <span className="text-slate-400 font-bold">Dart 3.x</span>
                </div>
                <pre className="p-4 bg-[#0d1322] border-2 border-slate-800 rounded-lg text-sm md:text-[15px] font-mono font-semibold text-slate-100 overflow-x-auto max-h-80 leading-relaxed">
                  {activeTask.starterCode}
                </pre>
              </div>
            )}
          </div>

          {/* Benchmark Comparison & Feedback Card (Visible after submission) */}
          {isSubmitted && (
            <div className="bg-[#111827] border-2 border-emerald-500/50 rounded-xl p-6 space-y-4 shadow-lg">
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
                <div className="flex items-center gap-2 text-emerald-400 text-base font-black">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Outlier Gold-Standard Benchmark Comparison</span>
                </div>
                <div className={`px-3 py-1 text-sm font-mono font-black rounded-lg border-2 ${analysis.tierBadge}`}>
                  Tier {analysis.tier} · {analysis.score}% Rigor
                </div>
              </div>

              {/* Evaluator feedback summary */}
              <div className="bg-slate-900/90 p-4 rounded-lg border-2 border-slate-800 text-sm space-y-2">
                <div className="text-slate-100 font-bold flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Automated Evaluator Review:</span>
                </div>
                <p className="text-slate-200 leading-relaxed font-semibold">
                  {analysis.score >= 85
                    ? 'Exceptional analysis! Your justification provides concrete line citations, addresses sound null-safety, and evaluates algorithmic complexity according to Outlier RLHF standards.'
                    : analysis.score >= 70
                    ? 'Good technical rationale. To elevate your rating to Tier S, ensure you cite the exact line numbers where defects occur and quantify Big-O time and space complexity.'
                    : 'Your justification lacks technical depth. Outlier evaluators expect specific line-by-line defect citations, Big-O analysis, and references to Effective Dart idioms.'}
                </p>
              </div>

              {/* Reference Solution */}
              <div className="space-y-2">
                <div className="text-xs md:text-sm font-mono text-slate-300 font-bold">Official Rubric & Solution:</div>
                <pre className="p-4 bg-slate-900 rounded-lg text-sm font-mono font-semibold text-slate-200 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto border border-slate-800">
                  {activeTask.referenceSolution}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Right 5 cols: Outlier Evaluation Matrix & Justification Box */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#111827] border-2 border-slate-800 rounded-xl p-6 space-y-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white tracking-tight flex items-center gap-2">
                <Scale className="w-5 h-5 text-sky-400" />
                <span>Outlier Scoring Matrix</span>
              </h3>
              <div className={`text-sm font-mono font-black px-2.5 py-0.5 rounded-lg border-2 ${analysis.tierBadge}`}>
                Score: {analysis.score}%
              </div>
            </div>

            {/* Verdict selection */}
            {activeTask.modelA && activeTask.modelB && (
              <div className="space-y-2.5">
                <label className="text-sm font-bold text-slate-200">Model Preference Verdict:</label>
                <div className="grid grid-cols-2 gap-2.5 text-sm">
                  {[
                    { id: 'model_a', label: 'Model A is Better' },
                    { id: 'model_b', label: 'Model B is Better' },
                    { id: 'both_flawed', label: 'Both are Flawed' },
                    { id: 'about_equal', label: 'About Equal' },
                  ].map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVerdict(v.id)}
                      className={`p-3 rounded-lg border-2 text-left transition-all font-bold ${
                        selectedVerdict === v.id
                          ? 'bg-sky-950/60 border-sky-400 text-white shadow-sm'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Criteria scoring sliders */}
            <div className="space-y-3.5 pt-3 border-t-2 border-slate-800">
              <div className="text-sm font-bold text-slate-200">Dimension Ratings (1 - 5):</div>

              {[
                { key: 'correctness', label: 'Correctness & Soundness' },
                { key: 'nullSafety', label: 'Sound Null Safety & Defensive Logic' },
                { key: 'style', label: 'Effective Dart & Idiomatic Style' },
                { key: 'performance', label: 'Algorithmic Complexity & Lookups' },
              ].map((dim) => (
                <div key={dim.key} className="flex items-center justify-between gap-4 text-xs md:text-sm">
                  <span className="text-slate-300 font-bold">{dim.label}</span>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        onClick={() => setRatings((prev) => ({ ...prev, [dim.key]: val }))}
                        className={`w-8 h-8 rounded-lg text-xs md:text-sm font-mono font-black transition-all ${
                          (ratings as any)[dim.key] === val
                            ? 'bg-sky-500 text-white shadow-md'
                            : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Justification Textarea with Live Quality Checklist */}
            <div className="space-y-2.5 pt-3 border-t-2 border-slate-800">
              <div className="flex items-center justify-between text-sm">
                <label className="font-bold text-slate-200">Technical Justification:</label>
                <span className={`font-mono font-bold text-xs ${analysis.wordCount >= 50 ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {analysis.wordCount} words (Target: 50+)
                </span>
              </div>

              {/* Quick snippet inserters */}
              <div className="flex items-center gap-1.5 flex-wrap text-xs font-bold">
                <span className="text-slate-400 font-mono">Insert:</span>
                {[
                  { label: '+ Line #', snippet: 'At line 4, ' },
                  { label: '+ O(N) Time', snippet: 'runs in O(N) time with O(1) space' },
                  { label: '+ Null Safety', snippet: 'violates sound null safety because ' },
                  { label: '+ Effective Dart', snippet: 'violates Effective Dart guideline: ' },
                ].map((s) => (
                  <button
                    key={s.label}
                    onClick={() => handleInsertSnippet(s.snippet)}
                    className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white transition-colors border border-slate-700 font-semibold"
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <textarea
                rows={6}
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Write your professional evaluation... Cite specific lines (e.g. 'At line 6...'), Big-O time/space complexity, null-safety risks, or Effective Dart standards."
                className="w-full p-4 bg-slate-900 border-2 border-slate-700/80 rounded-xl text-base text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-400 leading-relaxed font-sans"
              />

              {/* Rigor Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs md:text-sm text-slate-300 font-bold">
                  <span>Justification Rigor:</span>
                  <span className={`font-mono font-black ${analysis.tierColor}`}>
                    {analysis.score}% ({analysis.tier}-Tier)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      analysis.score >= 85 ? 'bg-amber-400' : analysis.score >= 70 ? 'bg-emerald-400' : 'bg-sky-500'
                    }`}
                    style={{ width: `${analysis.score}%` }}
                  />
                </div>
              </div>

              {/* Quality Prober Checklist */}
              <div className="p-4 bg-slate-900/90 border-2 border-slate-800 rounded-xl space-y-2 text-xs md:text-sm">
                <div className="text-slate-200 font-bold mb-1 flex items-center justify-between">
                  <span>Outlier Quality Criteria Checklist:</span>
                  <span className="font-mono text-xs text-sky-400 font-bold">RLHF Standards</span>
                </div>
                <div className="flex items-center gap-2.5">
                  {analysis.wordCount >= 50 ? <Check className="w-4 h-4 text-emerald-400 shrink-0" /> : <div className="w-4 h-4 rounded-full border-2 border-slate-600 shrink-0" />}
                  <span className={analysis.wordCount >= 50 ? 'text-slate-200 font-bold' : 'text-slate-400 font-medium'}>Comprehensive explanation (&ge; 50 words)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  {analysis.hasLineCitation ? <Check className="w-4 h-4 text-emerald-400 shrink-0" /> : <div className="w-4 h-4 rounded-full border-2 border-slate-600 shrink-0" />}
                  <span className={analysis.hasLineCitation ? 'text-slate-200 font-bold' : 'text-slate-400 font-medium'}>Cites specific line numbers (e.g., "line 4")</span>
                </div>
                <div className="flex items-center gap-2.5">
                  {analysis.hasNullSafety ? <Check className="w-4 h-4 text-emerald-400 shrink-0" /> : <div className="w-4 h-4 rounded-full border-2 border-slate-600 shrink-0" />}
                  <span className={analysis.hasNullSafety ? 'text-slate-200 font-bold' : 'text-slate-400 font-medium'}>Cites null-safety, types, or assertions</span>
                </div>
                <div className="flex items-center gap-2.5">
                  {analysis.hasComplexity ? <Check className="w-4 h-4 text-emerald-400 shrink-0" /> : <div className="w-4 h-4 rounded-full border-2 border-slate-600 shrink-0" />}
                  <span className={analysis.hasComplexity ? 'text-slate-200 font-bold' : 'text-slate-400 font-medium'}>Evaluates time/space complexity or performance</span>
                </div>
                <div className="flex items-center gap-2.5">
                  {analysis.hasApiOrIdiom ? <Check className="w-4 h-4 text-emerald-400 shrink-0" /> : <div className="w-4 h-4 rounded-full border-2 border-slate-600 shrink-0" />}
                  <span className={analysis.hasApiOrIdiom ? 'text-slate-200 font-bold' : 'text-slate-400 font-medium'}>References standard Dart APIs or Effective Dart</span>
                </div>
                <div className="flex items-center gap-2.5">
                  {analysis.hasEdgeCases ? <Check className="w-4 h-4 text-emerald-400 shrink-0" /> : <div className="w-4 h-4 rounded-full border-2 border-slate-600 shrink-0" />}
                  <span className={analysis.hasEdgeCases ? 'text-slate-200 font-bold' : 'text-slate-400 font-medium'}>Considers boundary conditions, leaks, or edge cases</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmitEvaluation}
              disabled={isSubmitted || !selectedVerdict}
              className={`w-full py-3 text-sm md:text-base font-black rounded-lg transition-all flex items-center justify-center gap-2 ${
                selectedVerdict && !isSubmitted
                  ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-md hover:shadow-sky-500/25 active:scale-[0.98]'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitted ? 'Evaluation Recorded' : 'Submit Evaluation & View Benchmark'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

