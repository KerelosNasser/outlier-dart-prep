import React from 'react';
import { Terminal, BookOpen, Code2, Sparkles, Award, BarChart3, BookmarkCheck, Settings, Zap, Eye, Type } from 'lucide-react';
import { UserProfile } from '../../types';

export type NavTab = 
  | 'dashboard'
  | 'curriculum'
  | 'practice'
  | 'outlier'
  | 'assessments'
  | 'analytics'
  | 'reference'
  | 'settings';

interface TopBarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  profile: UserProfile;
  sdkStatus: { online: boolean; version: string };
  onQuickPractice: () => void;
  adhdMode?: boolean;
  onToggleAdhdMode?: () => void;
  fontSizeScale?: 'default' | 'lg' | 'xl';
  onChangeFontSizeScale?: (scale: 'default' | 'lg' | 'xl') => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onSelectTab,
  profile,
  sdkStatus,
  onQuickPractice,
  adhdMode = true,
  onToggleAdhdMode,
  fontSizeScale = 'lg',
  onChangeFontSizeScale,
}) => {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between gap-2 md:gap-4 px-4 md:px-6 py-3 bg-[#0d1322] border-b-2 border-slate-800 text-slate-100 shadow-sm">
      {/* Zone 1: Single brand wordmark */}
      <div className="flex items-center gap-2.5 shrink-0">
        <a 
          href="#dashboard" 
          onClick={(e) => { e.preventDefault(); onSelectTab('dashboard'); }}
          className="flex items-center gap-2 text-base md:text-lg font-black tracking-tight text-white hover:text-sky-400 transition-colors whitespace-nowrap"
        >
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 border-2 border-sky-500/50 flex items-center justify-center text-sky-400 shadow-sm">
            <Terminal className="w-4.5 h-4.5" />
          </div>
          <span>Dart Mastery Lab</span>
        </a>
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="flex items-center gap-1 md:gap-1.5 overflow-x-auto py-0.5 px-1 min-w-0 flex-1 no-scrollbar text-xs md:text-sm font-bold justify-start lg:justify-center">
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'dashboard'
              ? 'bg-sky-500/20 text-sky-300 border-2 border-sky-500/60 font-black shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800 border-2 border-transparent'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => onSelectTab('curriculum')}
          className={`flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'curriculum'
              ? 'bg-sky-500/20 text-sky-300 border-2 border-sky-500/60 font-black shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800 border-2 border-transparent'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Curriculum</span>
        </button>

        <button
          onClick={() => onSelectTab('practice')}
          className={`flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'practice'
              ? 'bg-sky-500/20 text-sky-300 border-2 border-sky-500/60 font-black shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800 border-2 border-transparent'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>Practice IDE</span>
        </button>

        <button
          onClick={() => onSelectTab('outlier')}
          className={`flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'outlier'
              ? 'bg-amber-500/20 text-amber-300 border-2 border-amber-500/60 font-black shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800 border-2 border-transparent'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Outlier Sim</span>
        </button>

        <button
          onClick={() => onSelectTab('assessments')}
          className={`flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'assessments'
              ? 'bg-emerald-500/20 text-emerald-300 border-2 border-emerald-500/60 font-black shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800 border-2 border-transparent'
          }`}
        >
          <Award className="w-4 h-4 text-emerald-400" />
          <span>Mock Exams</span>
        </button>

        <button
          onClick={() => onSelectTab('analytics')}
          className={`flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'analytics'
              ? 'bg-sky-500/20 text-sky-300 border-2 border-sky-500/60 font-black shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800 border-2 border-transparent'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Analytics</span>
        </button>

        <button
          onClick={() => onSelectTab('reference')}
          className={`flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'reference'
              ? 'bg-sky-500/20 text-sky-300 border-2 border-sky-500/60 font-black shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800 border-2 border-transparent'
          }`}
        >
          <BookmarkCheck className="w-4 h-4" />
          <span>Reference</span>
        </button>

        <button
          onClick={() => onSelectTab('settings')}
          aria-label="Settings"
          className={`p-2 rounded-lg transition-all shrink-0 ${
            activeTab === 'settings'
              ? 'bg-slate-800 text-sky-400 border border-slate-700'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" />
        </button>
      </nav>

      {/* Zone 3: 1 Primary Action & Status & ADHD Controls */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        {/* ADHD Focus Toggle */}
        {onToggleAdhdMode && (
          <button
            onClick={onToggleAdhdMode}
            title="Toggle ADHD High-Readability & Focus Mode"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border-2 text-xs font-black transition-all ${
              adhdMode
                ? 'bg-amber-400/20 border-amber-400/60 text-amber-300 shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-amber-400 stroke-[2.5]" />
            <span className="hidden sm:inline font-mono">ADHD</span>
            <span className={`text-[10px] px-1 py-0.2 rounded font-mono ${adhdMode ? 'bg-amber-400/30 text-amber-200 font-black' : 'text-slate-500'}`}>
              {adhdMode ? 'ON' : 'OFF'}
            </span>
          </button>
        )}

        {/* Font Scaling Buttons */}
        {onChangeFontSizeScale && (
          <div className="flex items-center bg-slate-900 border-2 border-slate-800 rounded-lg p-0.5 text-xs font-black">
            <button
              onClick={() => onChangeFontSizeScale('default')}
              className={`px-2 py-1 rounded transition-colors ${fontSizeScale === 'default' ? 'bg-sky-600 text-white font-black' : 'text-slate-400 hover:text-white'}`}
              title="Standard Font Size"
            >
              A
            </button>
            <button
              onClick={() => onChangeFontSizeScale('lg')}
              className={`px-2 py-1 rounded transition-colors ${fontSizeScale === 'lg' ? 'bg-sky-600 text-white font-black' : 'text-slate-400 hover:text-white'}`}
              title="Large Font Size (Default)"
            >
              A+
            </button>
            <button
              onClick={() => onChangeFontSizeScale('xl')}
              className={`px-2 py-1 rounded transition-colors ${fontSizeScale === 'xl' ? 'bg-sky-600 text-white font-black' : 'text-slate-400 hover:text-white'}`}
              title="Extra Large Font Size"
            >
              A++
            </button>
          </div>
        )}

        {/* Stats Pill */}
        <div className="hidden xl:flex items-center gap-2 text-xs font-mono font-bold text-slate-300 bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800">
          <span className="text-amber-400 font-black">{profile.xp} XP</span>
          <span className="text-slate-600">·</span>
          <span className="text-emerald-400 font-black">{profile.streakDays}d Streak</span>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={onQuickPractice}
          className="flex items-center gap-1.5 px-3 md:px-4 py-2 text-xs md:text-sm font-black text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-all whitespace-nowrap shrink-0 shadow-md hover:shadow-sky-500/20 active:scale-[0.98]"
        >
          <Zap className="w-4 h-4 fill-current" />
          <span className="hidden sm:inline">Daily Training</span>
          <span className="sm:hidden">Train</span>
        </button>
      </div>
    </header>
  );
};

