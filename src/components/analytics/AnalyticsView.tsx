import React from 'react';
import { BarChart3, TrendingUp, CheckCircle, ShieldAlert, Clock, Layers } from 'lucide-react';
import { UserProfile, UserAttempt, CurriculumModule } from '../../types';

interface AnalyticsViewProps {
  profile: UserProfile;
  attempts: UserAttempt[];
  modules: CurriculumModule[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  profile,
  attempts,
  modules,
}) => {
  // Aggregate stats
  const total = attempts.length;
  const passed = attempts.filter((a) => a.isCorrect).length;
  const overallAcc = total > 0 ? Math.round((passed / total) * 100) : 0;

  // Stats by task type
  const taskTypeMap: Record<string, { total: number; passed: number; avgScore: number }> = {};
  for (const a of attempts) {
    if (!taskTypeMap[a.taskType]) {
      taskTypeMap[a.taskType] = { total: 0, passed: 0, avgScore: 0 };
    }
    taskTypeMap[a.taskType].total++;
    if (a.isCorrect) taskTypeMap[a.taskType].passed++;
    taskTypeMap[a.taskType].avgScore += a.score;
  }

  // Module scores
  const moduleMastery = modules.map((m) => {
    const modAttempts = attempts.filter((a) => a.moduleId === m.id);
    const count = modAttempts.length;
    const score = count > 0 ? Math.round(modAttempts.reduce((s, a) => s + a.score, 0) / count) : 0;
    return {
      id: m.id,
      number: m.number,
      title: m.title,
      score,
      count,
    };
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      <div className="pb-4 border-b-2 border-slate-800">
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Performance & Mastery Analytics</h1>
        <p className="text-sm md:text-base text-slate-300 font-medium mt-1">
          Real-time measurement of your conceptual recognition, code implementation, and analytical evaluation capabilities.
        </p>
      </div>

      {/* Top 3 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-[#111827] border-2 border-slate-800 rounded-xl p-6 shadow-lg">
          <div className="text-xs text-slate-400 font-black uppercase tracking-wider mb-1">Overall Accuracy</div>
          <div className="text-3xl md:text-4xl font-black font-mono text-emerald-400 tabular-nums">
            {overallAcc}%
          </div>
          <div className="text-xs md:text-sm text-slate-300 font-medium mt-1.5">
            {passed} of {total} attempts answered correctly
          </div>
        </div>

        <div className="bg-[#111827] border-2 border-slate-800 rounded-xl p-6 shadow-lg">
          <div className="text-xs text-slate-400 font-black uppercase tracking-wider mb-1">Active Study Time</div>
          <div className="text-3xl md:text-4xl font-black font-mono text-white tabular-nums">
            {(profile.totalPracticeTimeSeconds / 3600).toFixed(1)} hrs
          </div>
          <div className="text-xs md:text-sm text-slate-300 font-medium mt-1.5">
            Avg {attempts.length > 0 ? Math.round(profile.totalPracticeTimeSeconds / attempts.length / 60) : 0} mins per challenge
          </div>
        </div>

        <div className="bg-[#111827] border-2 border-slate-800 rounded-xl p-6 shadow-lg">
          <div className="text-xs text-slate-400 font-black uppercase tracking-wider mb-1">Total XP Earned</div>
          <div className="text-3xl md:text-4xl font-black font-mono text-amber-400 tabular-nums">
            {profile.xp} XP
          </div>
          <div className="text-xs md:text-sm text-slate-300 font-medium mt-1.5">
            Level {Math.floor(profile.xp / 100) + 1} Dart Practitioner
          </div>
        </div>
      </div>

      {/* 14-Module Mastery Heatmap Grid */}
      <div className="bg-[#111827] border-2 border-slate-800 rounded-xl p-6 md:p-8 space-y-5 shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-base md:text-lg font-black text-white">14-Module Mastery Heatmap</h2>
          <span className="text-xs md:text-sm font-mono font-black text-amber-400">Benchmark: &ge; 75% Qualified</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {moduleMastery.map((m) => (
            <div key={m.id} className="p-4 bg-slate-900 border-2 border-slate-800 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-sky-400 font-black text-xs">MOD {String(m.number).padStart(2, '0')}</span>
                <span className="font-mono font-black text-white text-sm">{m.score}%</span>
              </div>
              <div className="text-sm font-bold text-slate-100 truncate">{m.title}</div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    m.score >= 75 ? 'bg-emerald-500' : m.score > 0 ? 'bg-sky-500' : 'bg-slate-700'
                  }`}
                  style={{ width: `${Math.max(m.score, 4)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Task Type Performance Breakdown */}
      <div className="bg-[#111827] border-2 border-slate-800 rounded-xl p-6 md:p-8 space-y-5 shadow-lg">
        <h2 className="text-base md:text-lg font-black text-white border-b border-slate-800 pb-3">Performance by Task Format</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-slate-400 border-b-2 border-slate-800 font-mono font-black text-xs uppercase">
              <tr>
                <th className="py-3">Task Format</th>
                <th className="py-3">Attempts</th>
                <th className="py-3">Success Rate</th>
                <th className="py-3">Outlier Role Relevance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200 font-semibold">
              {[
                { type: 'knowledge', label: 'Knowledge & Theory (MCQ)', relevance: 'Initial technical screening' },
                { type: 'code_tracing', label: 'Code Tracing & Flow Prediction', relevance: 'Screening & debugging logic' },
                { type: 'coding_challenge', label: 'Coding Challenges & Tests', relevance: 'Algorithmic implementation tasks' },
                { type: 'debugging', label: 'Debugging & Fix Justification', relevance: 'Model generation bug fixing' },
                { type: 'code_review', label: 'Code Review & Effective Dart', relevance: 'Code quality audits' },
                { type: 'ai_comparison', label: 'Model A vs Model B Comparison', relevance: 'Core RLHF preference tasks' },
                { type: 'prompt_rubric', label: 'Prompt & Rubric Authoring', relevance: 'RLHF dataset engineering' },
                { type: 'project_simulation', label: 'Multi-Step Project Simulations', relevance: 'Advanced contributor projects' },
              ].map((row) => {
                const stats = taskTypeMap[row.type] || { total: 0, passed: 0 };
                const pct = stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0;
                return (
                  <tr key={row.type} className="hover:bg-slate-800/50">
                    <td className="py-3.5 font-bold text-white text-sm md:text-base">{row.label}</td>
                    <td className="py-3.5 font-mono text-slate-300 font-bold">{stats.total}</td>
                    <td className="py-3.5 font-mono font-black text-emerald-400 text-sm md:text-base">{pct}%</td>
                    <td className="py-3.5 text-slate-300 font-medium">{row.relevance}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
