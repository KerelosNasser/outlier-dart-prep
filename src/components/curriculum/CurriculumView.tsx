import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Play, 
  Filter, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Layers,
  Sparkles
} from 'lucide-react';
import { CurriculumModule, Question, UserProfile } from '../../types';

interface CurriculumViewProps {
  modules: CurriculumModule[];
  allQuestions: Question[];
  profile: UserProfile;
  onSelectQuestion: (question: Question) => void;
}

export const CurriculumView: React.FC<CurriculumViewProps> = ({
  modules,
  allQuestions,
  profile,
  onSelectQuestion,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'standard'>('all');
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    MOD_01: true,
    MOD_02: true,
    MOD_08: true,
  });

  const completedSet = new Set(profile.completedQuestionIds);

  const toggleExpand = (modId: string) => {
    setExpandedModules((prev) => ({ ...prev, [modId]: !prev[modId] }));
  };

  const filteredModules = modules.filter((mod) => {
    if (priorityFilter !== 'all' && mod.priority !== priorityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = mod.title.toLowerCase().includes(q);
      const matchDesc = mod.description.toLowerCase().includes(q);
      const matchTopics = mod.topics.some((t) => 
        t.name.toLowerCase().includes(q) || t.concepts.some((c) => c.toLowerCase().includes(q))
      );
      return matchTitle || matchDesc || matchTopics;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b-2 border-slate-800">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Full Dart Engineering Curriculum</h1>
          <p className="text-sm md:text-base text-slate-300 font-medium mt-1">
            14 comprehensive modules aligned directly with Outlier technical screening requirements
          </p>
        </div>

        {/* Filter bar per frontend-design skill (functional buttons, not pills) */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 stroke-[2.5]" />
            <input
              type="text"
              placeholder="Search concepts, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3.5 py-2 text-sm font-semibold bg-slate-900 border-2 border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 w-52 md:w-64 shadow-sm"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-900 border-2 border-slate-800 rounded-xl">
            {(['all', 'high', 'standard'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-3 py-1.5 text-xs md:text-sm font-black rounded-lg transition-colors whitespace-nowrap capitalize ${
                  priorityFilter === p
                    ? 'bg-sky-600 text-white shadow'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {p === 'all' ? 'All Modules' : `${p} Priority`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Module List */}
      <div className="space-y-4">
        {filteredModules.map((mod) => {
          const isExpanded = !!expandedModules[mod.id];
          const modQuestions = allQuestions.filter((q) => q.moduleId === mod.id);
          const completedInMod = modQuestions.filter((q) => completedSet.has(q.id)).length;
          const progressPct = modQuestions.length > 0 ? Math.round((completedInMod / modQuestions.length) * 100) : 0;

          return (
            <div
              key={mod.id}
              className="bg-[#111827] border-2 border-slate-800 rounded-xl overflow-hidden transition-all shadow-md"
            >
              {/* Module Accordion Header */}
              <div
                onClick={() => toggleExpand(mod.id)}
                className="p-5 md:p-6 flex items-start justify-between gap-4 cursor-pointer hover:bg-slate-800/40 select-none"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-3 text-xs md:text-sm">
                    <span className="font-mono text-sky-400 font-black">
                      MODULE {String(mod.number).padStart(2, '0')}
                    </span>
                    <span aria-hidden="true" className="text-slate-600 font-black">·</span>
                    {mod.priority === 'high' ? (
                      <span className="text-amber-400 font-bold uppercase tracking-wide">High Priority Screening</span>
                    ) : (
                      <span className="text-slate-300 font-semibold">Core Language Pillar</span>
                    )}
                  </div>
                  <h2 className="text-lg md:text-xl font-black text-white tracking-tight">
                    {mod.title}
                  </h2>
                  <p className="text-sm text-slate-200 font-medium line-clamp-2 max-w-3xl leading-relaxed">
                    {mod.description}
                  </p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-mono font-black text-white tabular-nums">
                      {completedInMod} / {modQuestions.length}
                    </div>
                    <div className="text-xs font-bold text-slate-400">Challenges Done</div>
                  </div>
                  <div className="p-1.5 rounded-lg text-slate-300 hover:text-white bg-slate-900 border border-slate-800">
                    {isExpanded ? <ChevronUp className="w-5 h-5 stroke-[2.5]" /> : <ChevronDown className="w-5 h-5 stroke-[2.5]" />}
                  </div>
                </div>
              </div>

              {/* Progress bar line */}
              <div className="h-1.5 w-full bg-slate-800">
                <div 
                  className="h-full bg-sky-500 transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>

              {/* Expanded Topics & Questions */}
              {isExpanded && (
                <div className="p-5 md:p-6 pt-4 border-t-2 border-slate-800 bg-[#0c1220]/70 space-y-6">
                  {/* Topic breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mod.topics.map((topic) => (
                      <div key={topic.id} className="p-4 bg-slate-900 border-2 border-slate-800 rounded-xl">
                        <h3 className="text-sm font-black text-white mb-2.5">{topic.name}</h3>
                        <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-300">
                          {topic.concepts.map((concept, idx) => (
                            <span key={idx} className="bg-slate-800 border border-slate-700/80 px-2.5 py-1 rounded-md text-slate-200">
                              {concept}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Interactive Questions in Module */}
                  <div className="space-y-3">
                    <div className="text-xs md:text-sm font-black font-mono text-sky-400 uppercase tracking-wider">
                      Interactive Practice Challenges ({modQuestions.length})
                    </div>

                    {modQuestions.map((q) => {
                      const isDone = completedSet.has(q.id);
                      return (
                        <div
                          key={q.id}
                          onClick={() => onSelectQuestion(q)}
                          className="flex items-center justify-between p-4 bg-slate-900 border-2 border-slate-800 hover:border-sky-500/80 rounded-xl transition-all cursor-pointer group hover:bg-slate-800/80 shadow-sm"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            {isDone ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 stroke-[2.5]" />
                            ) : (
                              <Circle className="w-5 h-5 text-slate-600 shrink-0 stroke-[2.5]" />
                            )}
                            <div className="min-w-0">
                              <div className="text-sm md:text-base font-bold text-white group-hover:text-sky-300 truncate transition-colors">
                                {q.title}
                              </div>
                              <div className="text-xs font-semibold text-slate-400 flex items-center gap-2 mt-1">
                                <span className="text-slate-300 font-bold">{q.topic}</span>
                                <span aria-hidden="true" className="text-slate-600 font-black">·</span>
                                <span className="capitalize text-amber-400/90">{q.difficulty}</span>
                                <span aria-hidden="true" className="text-slate-600 font-black">·</span>
                                <span className="capitalize">{q.taskType.replace('_', ' ')}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0 ml-3">
                            <span className="text-xs font-mono font-bold text-slate-400 hidden sm:inline">
                              ~{q.estimatedMinutes}m
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectQuestion(q);
                              }}
                              className="px-3.5 py-1.5 text-xs md:text-sm font-black bg-sky-600 group-hover:bg-sky-500 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>Practice</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
