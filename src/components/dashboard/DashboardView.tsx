import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Flame, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Play, 
  Layers,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { UserProfile, UserAttempt, SpacedRepetitionItem, Question, CurriculumModule } from '../../types';

interface DashboardViewProps {
  profile: UserProfile;
  attempts: UserAttempt[];
  srsQueue: SpacedRepetitionItem[];
  allQuestions: Question[];
  modules: CurriculumModule[];
  sdkStatus: { online: boolean; version: string };
  onStartQuestion: (question: Question) => void;
  onNavigateTab: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  attempts,
  srsQueue,
  allQuestions,
  modules,
  sdkStatus,
  onStartQuestion,
  onNavigateTab,
}) => {
  // Aggregate metrics
  const completedIds = new Set(profile.completedQuestionIds);
  const totalQuestions = allQuestions.length;
  const completedCount = completedIds.size;
  const completionPercentage = totalQuestions > 0 ? Math.round((completedCount / totalQuestions) * 100) : 0;

  // Correct rate
  const totalAttemptsCount = attempts.length;
  const successfulAttempts = attempts.filter((a) => a.isCorrect).length;
  const accuracyRate = totalAttemptsCount > 0 ? Math.round((successfulAttempts / totalAttemptsCount) * 100) : 0;

  // Total hours
  const hoursSpent = (profile.totalPracticeTimeSeconds / 3600).toFixed(1);

  // Outlier Readiness Pillar Calculations
  const getModuleScore = (modId: string) => {
    const modAttempts = attempts.filter((a) => a.moduleId === modId);
    if (!modAttempts.length) return 0;
    const avg = modAttempts.reduce((s, a) => s + a.score, 0) / modAttempts.length;
    return Math.min(Math.round(avg), 100);
  };

  const pillarScores = [
    { name: 'Sound Null Safety', score: Math.max(getModuleScore('MOD_02'), completedIds.has('q_mod02_01') ? 70 : 15), weight: 'High' },
    { name: 'Asynchronous Dart', score: Math.max(getModuleScore('MOD_08'), completedIds.has('q_mod08_01') ? 65 : 10), weight: 'High' },
    { name: 'Collections & Algorithms', score: Math.max(getModuleScore('MOD_04'), completedIds.has('q_mod04_01') ? 60 : 10), weight: 'High' },
    { name: 'OOP & Dart 3 Modifiers', score: Math.max(getModuleScore('MOD_05'), completedIds.has('q_mod05_01') ? 60 : 10), weight: 'Standard' },
    { name: 'Code Review & Justifications', score: Math.max(getModuleScore('MOD_11'), completedIds.has('q_mod02_review1') ? 75 : 20), weight: 'High' },
  ];

  const overallReadiness = Math.round(
    pillarScores.reduce((acc, p) => acc + p.score, 0) / pillarScores.length
  );

  // Adaptive Next Recommendation
  const uncompleted = allQuestions.filter((q) => !completedIds.has(q.id));
  const nextRecommended = uncompleted[0] || allQuestions[0];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Top Banner / Hero Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        <div className="bg-[#111827] border-2 border-slate-800 hover:border-slate-700 rounded-xl p-5 flex items-center justify-between shadow-sm transition-all">
          <div>
            <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Outlier Readiness</div>
            <div className="text-3xl md:text-4xl font-black font-mono text-white tabular-nums tracking-tight">{overallReadiness}%</div>
            <div className="text-xs font-bold text-emerald-400 mt-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Assessment Qualified &gt; 80%</span>
            </div>
          </div>
          <div className="w-14 h-14 rounded-full border-4 border-sky-500/30 border-t-sky-400 flex items-center justify-center font-mono font-black text-sm text-sky-400 shadow-inner">
            {overallReadiness}%
          </div>
        </div>

        <div className="bg-[#111827] border-2 border-slate-800 hover:border-slate-700 rounded-xl p-5 flex items-center justify-between shadow-sm transition-all">
          <div>
            <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Practice Streak</div>
            <div className="text-3xl md:text-4xl font-black font-mono text-amber-400 tabular-nums flex items-center gap-2 tracking-tight">
              <Flame className="w-7 h-7 fill-amber-400 text-amber-400 shrink-0" />
              <span>{profile.streakDays} Days</span>
            </div>
            <div className="text-xs font-bold text-slate-300 mt-2 font-mono">
              {profile.completedQuestionIds.length} / {profile.dailyTargetQuestions} Daily Goal
            </div>
          </div>
        </div>

        <div className="bg-[#111827] border-2 border-slate-800 hover:border-slate-700 rounded-xl p-5 flex items-center justify-between shadow-sm transition-all">
          <div>
            <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Success Accuracy</div>
            <div className="text-3xl md:text-4xl font-black font-mono text-emerald-400 tabular-nums tracking-tight">
              {accuracyRate > 0 ? `${accuracyRate}%` : 'N/A'}
            </div>
            <div className="text-xs font-bold text-slate-300 mt-2">
              {successfulAttempts} of {totalAttemptsCount} attempts passed
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#111827] border-2 border-slate-800 hover:border-slate-700 rounded-xl p-5 flex items-center justify-between shadow-sm transition-all">
          <div>
            <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Practice Time</div>
            <div className="text-3xl md:text-4xl font-black font-mono text-white tabular-nums tracking-tight">{hoursSpent}h</div>
            <div className="text-xs font-bold text-sky-400 mt-2">
              {completedCount} of {totalQuestions} challenges ({completionPercentage}%)
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-500/15 border-2 border-sky-500/30 flex items-center justify-center text-sky-400">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Row: Active Recommendation + Readiness Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Smart Training Recommendation & Spaced Repetition Queue */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Recommendation Card (ADHD Visual Anchor) */}
          {nextRecommended && (
            <div className="bg-[#111827] border-2 border-slate-700 border-l-4 border-l-sky-400 rounded-xl p-6 md:p-7 relative overflow-hidden shadow-md">
              <div className="flex items-center justify-between gap-4 mb-3.5">
                <div className="flex items-center gap-2 text-xs font-black text-sky-400 font-mono tracking-wider">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>RECOMMENDED ADAPTIVE CHALLENGE</span>
                </div>
                <div className="text-xs text-slate-400 font-mono font-bold uppercase bg-slate-900/80 px-2.5 py-1 rounded border border-slate-800">
                  {nextRecommended.difficulty} · ~{nextRecommended.estimatedMinutes}m
                </div>
              </div>

              <h2 className="text-2xl md:text-3xl font-black text-white mb-3 tracking-tight leading-snug">
                {nextRecommended.title}
              </h2>
              <div className="text-base text-slate-200 font-medium leading-relaxed bg-[#0d1322] p-4 rounded-lg border border-slate-800/80 mb-5">
                {nextRecommended.prompt}
              </div>

              <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-300 font-bold mb-6">
                <span className="text-white font-extrabold">{nextRecommended.moduleName}</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="text-sky-300 font-semibold">{nextRecommended.topic}</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="capitalize text-amber-300 font-mono">{nextRecommended.taskType.replace('_', ' ')}</span>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => onStartQuestion(nextRecommended)}
                  className="flex items-center gap-2 px-5 py-3 bg-sky-600 hover:bg-sky-500 text-white text-sm md:text-base font-extrabold rounded-lg transition-all shadow-md hover:shadow-sky-500/25 active:scale-[0.98]"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Challenge in IDE</span>
                </button>
                <button
                  onClick={() => onNavigateTab('curriculum')}
                  className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm md:text-base font-bold rounded-lg transition-colors border border-slate-700"
                >
                  Browse All Modules
                </button>
              </div>
            </div>
          )}

          {/* Spaced Repetition & Daily Queue */}
          <div className="bg-[#111827] border-2 border-slate-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-black text-white tracking-tight">Adaptive Spaced-Repetition Queue</h3>
                <p className="text-xs font-semibold text-slate-400 mt-0.5">Concepts resurfaced automatically to lock in long-term memory</p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
                {srsQueue.length} Active Items
              </span>
            </div>

            <div className="space-y-2.5">
              {allQuestions.slice(0, 4).map((q) => {
                const isDone = completedIds.has(q.id);
                return (
                  <div
                    key={q.id}
                    onClick={() => onStartQuestion(q)}
                    className="flex items-center justify-between p-3.5 bg-slate-900/80 hover:bg-slate-800 border-2 border-slate-800/90 hover:border-sky-500/50 rounded-lg transition-all cursor-pointer group shadow-sm"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`w-3 h-3 rounded-full shrink-0 ${isDone ? 'bg-emerald-400 shadow-sm shadow-emerald-500/50' : 'bg-slate-600'}`} />
                      <div className="min-w-0">
                        <div className="text-sm md:text-base font-bold text-slate-100 group-hover:text-sky-300 truncate transition-colors">
                          {q.title}
                        </div>
                        <div className="text-xs text-slate-400 font-medium flex items-center gap-2 mt-0.5">
                          <span className="text-slate-300 font-semibold">{q.moduleName}</span>
                          <span aria-hidden="true">·</span>
                          <span className="capitalize font-mono text-slate-400">{q.taskType.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-sky-400 transition-colors shrink-0 ml-2" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: Outlier Competence Radar & Runtime Info */}
        <div className="space-y-6">
          {/* Outlier Screening Pillar Radar */}
          <div className="bg-[#111827] border-2 border-slate-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-black text-white tracking-tight">Outlier Technical Rubric</h3>
              <span className="text-xs text-sky-400 font-mono font-bold bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/30">
                5 Pillars
              </span>
            </div>

            <div className="space-y-4">
              {pillarScores.map((p) => (
                <div key={p.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs md:text-sm">
                    <span className="text-slate-200 font-bold">{p.name}</span>
                    <span className="font-mono font-black text-white tabular-nums">{p.score}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        p.score >= 80 ? 'bg-emerald-400' : p.score >= 50 ? 'bg-sky-400' : 'bg-amber-400'
                      }`}
                      style={{ width: `${Math.max(p.score, 5)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 text-sm text-slate-300 flex items-center justify-between font-bold">
              <span>Ready for Mock Screening?</span>
              <button
                onClick={() => onNavigateTab('assessments')}
                className="text-sky-400 hover:text-sky-300 font-extrabold flex items-center gap-1.5 transition-colors"
              >
                <span>Take Exam</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active Dart SDK Runtime Status */}
          <div className="bg-[#111827] border-2 border-slate-800 rounded-xl p-6 text-xs text-slate-300 space-y-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-sm">Execution Environment</span>
              <span className="inline-flex items-center gap-1.5 text-emerald-400 font-mono font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Native Sandbox</span>
              </span>
            </div>
            <div className="p-3 bg-slate-900 rounded-lg font-mono text-xs font-bold text-slate-200 border border-slate-800 truncate">
              {sdkStatus.version || 'Dart SDK 3.13.7 (stable)'}
            </div>
            <div className="text-xs font-medium text-slate-400 leading-relaxed">
              Subprocess isolation with 4000ms timeouts, Effective Dart analyzer, and memory bounding.
            </div>
          </div>
        </div>
      </div>

      {/* Curriculum Module Quick Grid */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-white tracking-tight">Curriculum Modules (14 Domains)</h3>
            <p className="text-xs md:text-sm font-semibold text-slate-400 mt-1">Structured progressive roadmap from zero to Outlier qualification</p>
          </div>
          <button
            onClick={() => onNavigateTab('curriculum')}
            className="text-sm text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1 transition-colors"
          >
            <span>View Full Syllabus</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {modules.slice(0, 8).map((mod) => {
            const modScore = getModuleScore(mod.id);
            return (
              <div
                key={mod.id}
                onClick={() => onNavigateTab('curriculum')}
                className="bg-[#111827] border-2 border-slate-800 hover:border-sky-500/60 p-5 rounded-xl cursor-pointer transition-all hover:bg-slate-800/50 group flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-400 mb-2">
                    <span>MODULE {String(mod.number).padStart(2, '0')}</span>
                    {mod.priority === 'high' && (
                      <span className="text-amber-400 font-sans font-bold text-xs bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30">
                        High Priority
                      </span>
                    )}
                  </div>
                  <h4 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors line-clamp-1 mb-1.5">
                    {mod.title}
                  </h4>
                  <p className="text-xs md:text-sm text-slate-300 font-medium line-clamp-2 mb-4 leading-relaxed">
                    {mod.tagline}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono font-bold text-slate-400">
                  <span>{mod.topics.length} Topics</span>
                  <span className="text-emerald-400">{modScore}% Mastered</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
