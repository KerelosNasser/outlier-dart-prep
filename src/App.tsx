import React, { useState, useEffect } from 'react';
import { TopBar, NavTab } from './components/navigation/TopBar';
import { DashboardView } from './components/dashboard/DashboardView';
import { CurriculumView } from './components/curriculum/CurriculumView';
import { PracticeIDEView } from './components/practice/PracticeIDEView';
import { OutlierSimulatorView } from './components/outlier/OutlierSimulatorView';
import { MockAssessmentCenter } from './components/assessments/MockAssessmentCenter';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { ReferenceView } from './components/reference/ReferenceView';
import { SettingsView } from './components/settings/SettingsView';

import { CURRICULUM_MODULES } from './data/curriculum';
import { ALL_QUESTIONS } from './data/questions';
import { UserProfile, UserAttempt, SpacedRepetitionItem, Question } from './types';
import { getProfile, getAllAttempts, getSpacedRepetitionQueue } from './lib/storage';
import { buildAdaptiveQueue } from './lib/adaptive';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [profile, setProfile] = useState<UserProfile>({
    xp: 0,
    streakDays: 1,
    lastActiveDate: new Date().toISOString().split('T')[0],
    totalPracticeTimeSeconds: 0,
    completedQuestionIds: [],
    dailyTargetQuestions: 5,
    preferredDifficulty: 'intermediate',
    executionMode: 'native_server',
  });
  const [attempts, setAttempts] = useState<UserAttempt[]>([]);
  const [srsQueue, setSrsQueue] = useState<SpacedRepetitionItem[]>([]);
  const [sdkStatus, setSdkStatus] = useState<{ online: boolean; version: string }>({
    online: true,
    version: 'Dart SDK 3.13.7 (stable)',
  });
  const [activeQuestion, setActiveQuestion] = useState<Question>(ALL_QUESTIONS[0]);
  const [adhdMode, setAdhdMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('adhd_mode');
    return saved !== null ? saved === 'true' : true; // Default ON per user request
  });
  const [fontSizeScale, setFontSizeScale] = useState<'default' | 'lg' | 'xl'>(() => {
    return (localStorage.getItem('font_size_scale') as any) || 'lg'; // Default large
  });

  const handleToggleAdhdMode = () => {
    setAdhdMode((prev) => {
      const next = !prev;
      localStorage.setItem('adhd_mode', String(next));
      return next;
    });
  };

  const handleChangeFontSizeScale = (scale: 'default' | 'lg' | 'xl') => {
    setFontSizeScale(scale);
    localStorage.setItem('font_size_scale', scale);
  };

  // Load persistence data on mount
  const refreshData = async () => {
    try {
      const [prof, atts, srs] = await Promise.all([
        getProfile(),
        getAllAttempts(),
        getSpacedRepetitionQueue(),
      ]);
      setProfile(prof);
      setAttempts(atts);
      setSrsQueue(srs);
    } catch (err) {
      console.warn('Error loading storage data', err);
    }
  };

  useEffect(() => {
    refreshData();

    // Probe SDK endpoint
    fetch('/api/health')
      .then((r) => r.json())
      .then((data) => {
        setSdkStatus({
          online: !!data.sdkAvailable,
          version: data.version || 'Dart SDK 3.13.7 (stable)',
        });
      })
      .catch(() => {
        setSdkStatus({ online: false, version: 'Offline Evaluator Mode' });
      });
  }, []);

  const handleStartQuestion = (question: Question) => {
    setActiveQuestion(question);
    setActiveTab('practice');
  };

  const handleQuickPractice = () => {
    const queue = buildAdaptiveQueue(ALL_QUESTIONS, srsQueue, attempts);
    const target = queue[0] || ALL_QUESTIONS[0];
    handleStartQuestion(target);
  };

  return (
    <div className={`min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans selection:bg-sky-500/30 selection:text-white ${adhdMode ? 'adhd-mode' : ''} font-scale-${fontSizeScale}`}>
      {/* Top Bar with 3-Zone Contract */}
      <TopBar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          refreshData();
        }}
        profile={profile}
        sdkStatus={sdkStatus}
        onQuickPractice={handleQuickPractice}
        adhdMode={adhdMode}
        onToggleAdhdMode={handleToggleAdhdMode}
        fontSizeScale={fontSizeScale}
        onChangeFontSizeScale={handleChangeFontSizeScale}
      />

      {/* Main Viewport */}
      <main className="flex-1 p-4 md:p-6 overflow-y-auto">
        {activeTab === 'dashboard' && (
          <DashboardView
            profile={profile}
            attempts={attempts}
            srsQueue={srsQueue}
            allQuestions={ALL_QUESTIONS}
            modules={CURRICULUM_MODULES}
            sdkStatus={sdkStatus}
            onStartQuestion={handleStartQuestion}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'curriculum' && (
          <CurriculumView
            modules={CURRICULUM_MODULES}
            allQuestions={ALL_QUESTIONS}
            profile={profile}
            onSelectQuestion={handleStartQuestion}
          />
        )}

        {activeTab === 'practice' && (
          <PracticeIDEView
            question={activeQuestion}
            onNextQuestion={() => {
              const currIdx = ALL_QUESTIONS.findIndex((q) => q.id === activeQuestion.id);
              const next = ALL_QUESTIONS[currIdx + 1] || ALL_QUESTIONS[0];
              setActiveQuestion(next);
            }}
            onBackToCurriculum={() => setActiveTab('curriculum')}
          />
        )}

        {activeTab === 'outlier' && (
          <OutlierSimulatorView
            questions={ALL_QUESTIONS}
            onSelectQuestion={handleStartQuestion}
          />
        )}

        {activeTab === 'assessments' && (
          <MockAssessmentCenter
            allQuestions={ALL_QUESTIONS}
            onReviewQuestion={handleStartQuestion}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            profile={profile}
            attempts={attempts}
            modules={CURRICULUM_MODULES}
          />
        )}

        {activeTab === 'reference' && <ReferenceView />}

        {activeTab === 'settings' && (
          <SettingsView
            profile={profile}
            onProfileUpdated={(p) => setProfile(p)}
            sdkStatus={sdkStatus}
          />
        )}
      </main>
    </div>
  );
};

export default App;
