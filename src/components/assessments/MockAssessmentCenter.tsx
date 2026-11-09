import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Award, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  ArrowLeft, 
  Play, 
  ShieldAlert,
  RotateCcw,
  BarChart2
} from 'lucide-react';
import { MockExamBlueprint, MockExamResult, Question } from '../../types';
import { MOCK_EXAM_BLUEPRINTS } from '../../data/mockExams';
import { saveExamResult, getExamResults } from '../../lib/storage';

interface MockAssessmentCenterProps {
  allQuestions: Question[];
  onReviewQuestion: (q: Question) => void;
}

export const MockAssessmentCenter: React.FC<MockAssessmentCenterProps> = ({
  allQuestions,
  onReviewQuestion,
}) => {
  const [selectedBlueprint, setSelectedBlueprint] = useState<MockExamBlueprint | null>(null);
  const [activeExam, setActiveExam] = useState<{
    blueprint: MockExamBlueprint;
    questions: Question[];
    answers: Record<string, string>; // questionId -> selectedOption or code
    timeLeftSeconds: number;
    currentIndex: number;
  } | null>(null);

  const [examResult, setExamResult] = useState<MockExamResult | null>(null);
  const [pastResults, setPastResults] = useState<MockExamResult[]>([]);

  useEffect(() => {
    getExamResults().then(setPastResults);
  }, []);

  // Timer countdown
  useEffect(() => {
    if (!activeExam) return;
    const interval = setInterval(() => {
      setActiveExam((prev) => {
        if (!prev) return null;
        if (prev.timeLeftSeconds <= 1) {
          clearInterval(interval);
          handleFinishExam();
          return null;
        }
        return { ...prev, timeLeftSeconds: prev.timeLeftSeconds - 1 };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeExam]);

  const handleStartExam = (blueprint: MockExamBlueprint) => {
    // Collect questions matching blueprint
    const examQuestions: Question[] = [];
    for (const qId of blueprint.questionIds) {
      const q = allQuestions.find((item) => item.id === qId);
      if (q) examQuestions.push(q);
    }

    // Fill remaining if needed
    if (examQuestions.length < blueprint.totalQuestions) {
      const fillers = allQuestions.filter((q) => 
        blueprint.targetModuleIds.includes(q.moduleId) && 
        !examQuestions.some((e) => e.id === q.id)
      );
      examQuestions.push(...fillers.slice(0, blueprint.totalQuestions - examQuestions.length));
    }

    setActiveExam({
      blueprint,
      questions: examQuestions,
      answers: {},
      timeLeftSeconds: blueprint.durationMinutes * 60,
      currentIndex: 0,
    });
    setExamResult(null);
  };

  const handleSelectAnswer = (qId: string, answer: string) => {
    if (!activeExam) return;
    setActiveExam({
      ...activeExam,
      answers: { ...activeExam.answers, [qId]: answer },
    });
  };

  const handleFinishExam = async () => {
    if (!activeExam) return;

    let correctCount = 0;
    const questionResults: any[] = [];
    const moduleScores: Record<string, { total: number; correct: number; name: string }> = {};

    for (const q of activeExam.questions) {
      const userAns = activeExam.answers[q.id];
      let isCorrect = false;

      if (q.options && q.options.length > 0) {
        const correctOpt = q.options.find((o) => o.isCorrect);
        isCorrect = correctOpt?.id === userAns;
      } else {
        // Freeform / code questions marked correct if answered
        isCorrect = !!userAns && userAns.length > 20;
      }

      if (isCorrect) correctCount++;

      if (!moduleScores[q.moduleId]) {
        moduleScores[q.moduleId] = { total: 0, correct: 0, name: q.moduleName };
      }
      moduleScores[q.moduleId].total++;
      if (isCorrect) moduleScores[q.moduleId].correct++;

      questionResults.push({
        questionId: q.id,
        title: q.title,
        isCorrect,
        userAnswer: userAns,
        timeSpentSeconds: 60,
      });
    }

    const total = activeExam.questions.length;
    const scorePercentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    const passed = scorePercentage >= activeExam.blueprint.passingScore;

    const moduleBreakdown = Object.keys(moduleScores).map((modId) => ({
      moduleId: modId,
      moduleName: moduleScores[modId].name,
      score: Math.round((moduleScores[modId].correct / moduleScores[modId].total) * 100),
    }));

    const weaknesses: string[] = [];
    const strengths: string[] = [];
    for (const mb of moduleBreakdown) {
      if (mb.score < 70) {
        weaknesses.push(`${mb.moduleName} (${mb.score}%)`);
      } else {
        strengths.push(`${mb.moduleName} (${mb.score}%)`);
      }
    }

    const result: MockExamResult = {
      id: `result_${Date.now()}`,
      examId: activeExam.blueprint.id,
      title: activeExam.blueprint.title,
      timestamp: Date.now(),
      durationSeconds: activeExam.blueprint.durationMinutes * 60 - activeExam.timeLeftSeconds,
      totalQuestions: total,
      correctCount,
      scorePercentage,
      passed,
      moduleBreakdown,
      questionResults,
      weaknessesIdentified: weaknesses.length ? weaknesses : ['None identified! Solid foundation across tested domains.'],
      strengthsIdentified: strengths,
      recommendations: passed
        ? ['Your score demonstrates strong qualification readiness. Proceed to advanced project simulations.']
        : ['Focus study time on the identified weaker modules and practice code-tracing on tricky null-safety and async edge cases.'],
    };

    await saveExamResult(result);
    setExamResult(result);
    setPastResults((prev) => [result, ...prev]);
    setActiveExam(null);

    if (passed) {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.7 } });
    }
  };

  // 1. ACTIVE TIMED EXAM MODE
  if (activeExam) {
    const q = activeExam.questions[activeExam.currentIndex];
    const minutes = Math.floor(activeExam.timeLeftSeconds / 60);
    const seconds = activeExam.timeLeftSeconds % 60;
    const currentAnswer = activeExam.answers[q?.id];

    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-16">
        {/* Active Exam Header Strip */}
        <div className="flex items-center justify-between p-5 bg-[#111827] border-2 border-slate-800 rounded-xl shadow-lg">
          <div>
            <div className="text-xs font-black font-mono uppercase tracking-wider text-sky-400">{activeExam.blueprint.title}</div>
            <div className="text-base md:text-lg font-black text-white mt-1">
              Question {activeExam.currentIndex + 1} <span className="text-slate-400 font-normal">of</span> {activeExam.questions.length}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-950/30 border-2 border-amber-500/50 rounded-lg font-mono text-sm md:text-base font-black text-amber-400 tabular-nums shadow-sm">
              <Clock className="w-4 h-4 stroke-[2.5]" />
              <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
            </div>

            <button
              onClick={handleFinishExam}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs md:text-sm font-black rounded-lg transition-colors shadow-sm"
            >
              Finish Exam
            </button>
          </div>
        </div>

        {/* Question Card */}
        {q && (
          <div className="bg-[#111827] border-2 border-slate-800 border-l-4 border-l-amber-400 rounded-xl p-6 md:p-8 space-y-6 shadow-xl">
            <div className="flex items-center justify-between text-xs md:text-sm text-slate-300 font-mono font-bold border-b border-slate-800 pb-3">
              <span className="text-amber-400 uppercase tracking-wide">Domain: {q.moduleName}</span>
              <span className="uppercase text-slate-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">{q.taskType.replace('_', ' ')}</span>
            </div>

            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight leading-snug">{q.title}</h2>
            
            <div className="text-base md:text-[17px] text-slate-100 font-medium whitespace-pre-line leading-relaxed bg-slate-900/90 p-5 rounded-xl border-2 border-slate-800/90 shadow-inner">
              {q.prompt}
            </div>

            {q.starterCode && (
              <pre className="p-4 bg-[#0a0f1d] border-2 border-slate-800 rounded-xl text-sm md:text-[15px] font-mono font-semibold text-slate-200 overflow-x-auto leading-relaxed">
                {q.starterCode}
              </pre>
            )}

            {/* MCQ Options */}
            {q.options && (
              <div className="space-y-3 pt-2">
                {q.options.map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => handleSelectAnswer(q.id, opt.id)}
                    className={`p-4 md:p-5 border-2 rounded-xl cursor-pointer transition-all text-sm md:text-base ${
                      currentAnswer === opt.id
                        ? 'border-sky-400 bg-sky-950/50 text-white font-bold ring-2 ring-sky-400/30'
                        : 'border-slate-800 hover:border-slate-700 bg-slate-900/70 text-slate-200 font-semibold hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div className={`w-5 h-5 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center ${
                        currentAnswer === opt.id ? 'border-sky-400 bg-sky-500' : 'border-slate-500'
                      }`}>
                        {currentAnswer === opt.id && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <span className="whitespace-pre-line leading-relaxed">{opt.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Textarea for code / written response */}
            {!q.options && (
              <div className="space-y-2.5">
                <label className="text-sm font-bold text-slate-200">Your Solution / Written Justification:</label>
                <textarea
                  rows={8}
                  value={currentAnswer || ''}
                  onChange={(e) => handleSelectAnswer(q.id, e.target.value)}
                  placeholder="Type your Dart code or technical answer..."
                  className="w-full p-4 bg-slate-900 border-2 border-slate-800 rounded-xl text-sm md:text-base text-slate-100 font-mono font-semibold focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                />
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-5 border-t-2 border-slate-800">
              <button
                disabled={activeExam.currentIndex === 0}
                onClick={() => setActiveExam({ ...activeExam, currentIndex: activeExam.currentIndex - 1 })}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold rounded-lg disabled:opacity-30 transition-colors"
              >
                Previous Question
              </button>

              <div className="flex items-center gap-2">
                {activeExam.questions.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveExam({ ...activeExam, currentIndex: i })}
                    className={`w-8 h-8 rounded-lg text-xs md:text-sm font-mono font-black transition-all ${
                      activeExam.currentIndex === i
                        ? 'bg-sky-500 text-white ring-2 ring-sky-400/50 scale-105'
                        : activeExam.answers[activeExam.questions[i].id]
                        ? 'bg-slate-700 text-slate-100 border border-slate-600'
                        : 'bg-slate-900 text-slate-500 border border-slate-800'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              {activeExam.currentIndex < activeExam.questions.length - 1 ? (
                <button
                  onClick={() => setActiveExam({ ...activeExam, currentIndex: activeExam.currentIndex + 1 })}
                  className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-sm font-black rounded-lg transition-colors shadow"
                >
                  Next Question
                </button>
              ) : (
                <button
                  onClick={handleFinishExam}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-black rounded-lg transition-colors shadow-lg"
                >
                  Submit All Answers
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // 2. EXAM RESULT REPORT CARD
  if (examResult) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-16">
        <div className="p-6 md:p-8 bg-[#111827] border-2 border-slate-800 rounded-xl space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <div className="text-xs font-mono font-black text-sky-400 uppercase tracking-wider">OFFICIAL BENCHMARK REPORT</div>
              <h1 className="text-2xl md:text-3xl font-black text-white mt-1">{examResult.title}</h1>
            </div>
            <div className={`px-4 py-2 rounded-xl font-black text-sm md:text-base border-2 shadow-md ${
              examResult.passed ? 'bg-emerald-950/50 border-emerald-500/60 text-emerald-300' : 'bg-rose-950/50 border-rose-500/60 text-rose-300'
            }`}>
              {examResult.passed ? 'QUALIFIED ✓ BENCHMARK MET' : 'BENCHMARK NOT MET'}
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-900 rounded-xl border-2 border-slate-800">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">Score Achieved</div>
              <div className="text-3xl md:text-4xl font-black font-mono text-white tabular-nums mt-1">
                {examResult.scorePercentage}%
              </div>
              <div className="text-xs text-slate-300 font-medium mt-1">
                {examResult.correctCount} of {examResult.totalQuestions} questions correct
              </div>
            </div>

            <div className="p-4 bg-slate-900 rounded-xl border-2 border-slate-800">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">Time Consumed</div>
              <div className="text-3xl md:text-4xl font-black font-mono text-white tabular-nums mt-1">
                {Math.floor(examResult.durationSeconds / 60)}m {examResult.durationSeconds % 60}s
              </div>
              <div className="text-xs text-slate-300 font-medium mt-1">Within simulation time budget</div>
            </div>

            <div className="p-4 bg-slate-900 rounded-xl border-2 border-slate-800">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">Readiness Status</div>
              <div className={`text-3xl md:text-4xl font-black font-mono mt-1 ${examResult.passed ? 'text-emerald-400' : 'text-amber-400'}`}>
                {examResult.passed ? 'Ready' : 'In Training'}
              </div>
              <div className="text-xs text-slate-300 font-medium mt-1">Target passing mark: &ge; 75%</div>
            </div>
          </div>

          {/* Domain Breakdown */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs md:text-sm font-black text-slate-200 uppercase tracking-wider">Domain Performance Breakdown</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {examResult.moduleBreakdown.map((mb) => (
                <div key={mb.moduleId} className="p-4 bg-slate-900 border-2 border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-sm font-bold">
                    <span className="text-slate-100">{mb.moduleName}</span>
                    <span className="font-mono text-white font-black">{mb.score}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${mb.score >= 75 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                      style={{ width: `${mb.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="p-5 bg-slate-900/90 border-2 border-slate-800 border-l-4 border-l-sky-400 rounded-xl space-y-2.5">
            <div className="font-black text-sky-400 text-sm uppercase tracking-wide">Targeted Next Steps:</div>
            <ul className="text-slate-100 text-sm md:text-[15px] font-medium space-y-2 list-disc pl-5 leading-relaxed">
              {examResult.recommendations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              onClick={() => setExamResult(null)}
              className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-sm font-black rounded-lg transition-colors shadow"
            >
              Back to Assessment Center
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. EXAM CATALOG / LIST VIEW
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      <div className="pb-4 border-b-2 border-slate-800">
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Mock Assessment Center</h1>
        <p className="text-sm md:text-base text-slate-300 font-medium mt-1">
          Timed, no-hint qualification simulations designed to test your actual performance under Outlier screening constraints.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_EXAM_BLUEPRINTS.map((exam) => (
          <div
            key={exam.id}
            className="bg-[#111827] border-2 border-slate-800 hover:border-sky-500/80 rounded-xl p-6 flex flex-col justify-between transition-all hover:bg-slate-900/60 space-y-5 shadow-lg group"
          >
            <div>
              <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-400 mb-2.5">
                <span className="text-sky-400 uppercase tracking-wide font-black">{exam.category}</span>
                <span>{exam.durationMinutes} mins · {exam.totalQuestions} Qs</span>
              </div>
              <h2 className="text-lg md:text-xl font-black text-white mb-2 tracking-tight group-hover:text-sky-300 transition-colors">{exam.title}</h2>
              <p className="text-sm text-slate-200 font-medium leading-relaxed">{exam.description}</p>
            </div>

            <div className="pt-4 border-t-2 border-slate-800 flex items-center justify-between">
              <span className="text-xs md:text-sm font-mono font-black text-amber-400">Pass mark: {exam.passingScore}%</span>
              <button
                onClick={() => handleStartExam(exam)}
                className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs md:text-sm font-black rounded-lg transition-colors shadow"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Start Timed Exam</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Historical Attempts Table */}
      {pastResults.length > 0 && (
        <div className="bg-[#111827] border-2 border-slate-800 rounded-xl p-6 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base md:text-lg font-black text-white">Your Past Assessment Submissions</h3>
            <span className="text-xs md:text-sm font-mono font-black text-sky-400">{pastResults.length} Recorded</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-slate-400 border-b-2 border-slate-800 font-mono font-bold text-xs uppercase">
                <tr>
                  <th className="py-3">Assessment</th>
                  <th className="py-3">Date</th>
                  <th className="py-3">Score</th>
                  <th className="py-3">Duration</th>
                  <th className="py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono text-slate-200 font-semibold">
                {pastResults.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/50">
                    <td className="py-3 font-sans font-bold text-white text-sm md:text-base">{r.title}</td>
                    <td className="py-3 text-slate-400 text-xs md:text-sm">{new Date(r.timestamp).toLocaleDateString()}</td>
                    <td className="py-3 font-black text-sm md:text-base tabular-nums">{r.scorePercentage}%</td>
                    <td className="py-3 text-slate-300 text-xs md:text-sm">{Math.round(r.durationSeconds / 60)}m</td>
                    <td className="py-3">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-sans font-black ${
                        r.passed ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {r.passed ? 'Passed ✓' : 'Failed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
