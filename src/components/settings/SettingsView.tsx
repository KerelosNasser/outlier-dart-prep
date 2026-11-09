import React, { useState } from 'react';
import { Settings, Download, Upload, Trash2, Check, RefreshCw, Terminal, AlertTriangle } from 'lucide-react';
import { UserProfile } from '../../types';
import { exportAllProgress, importProgress, resetAllProgress, saveProfile } from '../../lib/storage';
import { CustomChallengeCreator } from './CustomChallengeCreator';

interface SettingsViewProps {
  profile: UserProfile;
  onProfileUpdated: (p: UserProfile) => void;
  sdkStatus: { online: boolean; version: string };
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  onProfileUpdated,
  sdkStatus,
}) => {
  const [dailyTarget, setDailyTarget] = useState<number>(profile.dailyTargetQuestions);
  const [preferredDiff, setPreferredDiff] = useState(profile.preferredDifficulty);
  const [execMode, setExecMode] = useState(profile.executionMode);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleSavePreferences = async () => {
    const updated: UserProfile = {
      ...profile,
      dailyTargetQuestions: dailyTarget,
      preferredDifficulty: preferredDiff,
      executionMode: execMode,
    };
    await saveProfile(updated);
    onProfileUpdated(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleExport = async () => {
    const jsonStr = await exportAllProgress();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `outlier-dart-progress-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const content = evt.target?.result as string;
      const success = await importProgress(content);
      if (success) {
        setImportStatus('Progress imported successfully! Refreshing view...');
        setTimeout(() => window.location.reload(), 1200);
      } else {
        setImportStatus('Failed to import: file is malformed or invalid JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to reset all practice progress, exam scores, and drafts? This cannot be undone.'
    );
    if (confirmed) {
      await resetAllProgress();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white tracking-tight">Platform Configuration & Persistence</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Tune your training cadence, execution environment, and manage local-first backups.
        </p>
      </div>

      {/* Preferences Card */}
      <div className="bg-[#111827] border border-slate-800 rounded-lg p-6 space-y-6">
        <h2 className="text-sm font-bold text-white tracking-tight">Training Preferences</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Daily Goal */}
          <div className="space-y-2">
            <label className="text-slate-300 font-medium">Daily Challenge Target:</label>
            <div className="flex items-center gap-2">
              {[3, 5, 8, 12].map((num) => (
                <button
                  key={num}
                  onClick={() => setDailyTarget(num)}
                  className={`px-3 py-1.5 rounded font-mono font-medium border transition-colors ${
                    dailyTarget === num
                      ? 'bg-sky-600 border-sky-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {num} / day
                </button>
              ))}
            </div>
          </div>

          {/* Preferred Difficulty */}
          <div className="space-y-2">
            <label className="text-slate-300 font-medium">Preferred Starting Difficulty:</label>
            <div className="flex items-center gap-2">
              {(['beginner', 'intermediate', 'advanced'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setPreferredDiff(d)}
                  className={`px-3 py-1.5 rounded font-sans font-medium capitalize border transition-colors ${
                    preferredDiff === d
                      ? 'bg-sky-600 border-sky-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Execution Mode */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-slate-300 font-medium">Dart Execution Engine:</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'native_server', title: 'Native Server SDK (Active)', desc: 'Official Dart 3.13.7 runtime subprocess with 4s timeout' },
                { id: 'in_browser', title: 'Client Evaluator', desc: 'Syntactic validation for offline / disconnected environments' },
                { id: 'local_companion', title: 'Local Companion', desc: 'Bridge to your local desktop dart test suite' },
              ].map((mode) => (
                <div
                  key={mode.id}
                  onClick={() => setExecMode(mode.id as any)}
                  className={`p-3.5 border rounded cursor-pointer transition-all ${
                    execMode === mode.id
                      ? 'bg-sky-950/30 border-sky-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-semibold text-slate-200">{mode.title}</div>
                  <div className="text-[11px] text-slate-500 mt-1 leading-relaxed">{mode.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          {saveSuccess ? (
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>Preferences saved!</span>
            </span>
          ) : (
            <div />
          )}

          <button
            onClick={handleSavePreferences}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded transition-colors"
          >
            Save Preferences
          </button>
        </div>
      </div>

      {/* Local-First Data Persistence & Backup */}
      <div className="bg-[#111827] border border-slate-800 rounded-lg p-6 space-y-4">
        <h2 className="text-sm font-bold text-white tracking-tight">Local-First Persistence & Backups</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Your practice history, attempt drafts, spaced repetition schedules, and mock assessment reports are stored locally in your browser's IndexedDB. Export your progress as JSON to preserve it across devices or refresh cycles.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded transition-colors border border-slate-700"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span>Export Progress to JSON</span>
          </button>

          <label className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded transition-colors border border-slate-700 cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-emerald-400" />
            <span>Import Progress from JSON</span>
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>

          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-medium rounded transition-colors border border-rose-800/60 ml-auto"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Reset All Progress</span>
          </button>
        </div>

        {importStatus && (
          <div className="p-3 bg-slate-900 border border-slate-800 rounded text-xs text-slate-300 mt-2">
            {importStatus}
          </div>
        )}
      </div>

      {/* Custom Challenge Creator */}
      <CustomChallengeCreator />

      {/* Local Companion Setup Guide */}
      <div className="bg-[#111827] border border-slate-800 rounded-lg p-6 space-y-3 text-xs">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Terminal className="w-4 h-4 text-sky-400" />
          <span>Local Dart SDK Companion Instructions</span>
        </h3>
        <p className="text-slate-400 leading-relaxed">
          If you want to run exercises locally on your machine with your local Dart SDK:
        </p>
        <pre className="p-3 bg-slate-900 rounded font-mono text-[11px] text-slate-300 border border-slate-800 overflow-x-auto leading-relaxed">
{`# 1. Verify Dart is installed on your machine
dart --version

# 2. Test any snippet directly
dart run path_to_file.dart

# 3. Run official analyzer lints
dart analyze

# 4. Format according to Effective Dart
dart format .`}
        </pre>
      </div>
    </div>
  );
};
