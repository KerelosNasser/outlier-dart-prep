import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { UserAttempt, SpacedRepetitionItem, UserProfile, MockExamResult } from '../types';

interface OutlierLabDB extends DBSchema {
  attempts: {
    key: string;
    value: UserAttempt;
    indexes: { 'by-question': string; 'by-module': string; 'by-date': number };
  };
  spacedRepetition: {
    key: string;
    value: SpacedRepetitionItem;
    indexes: { 'by-next-review': number };
  };
  profile: {
    key: string;
    value: UserProfile;
  };
  examResults: {
    key: string;
    value: MockExamResult;
    indexes: { 'by-date': number };
  };
  codeDrafts: {
    key: string;
    value: { questionId: string; code: string; lastUpdated: number };
  };
}

const DB_NAME = 'outlier_dart_mastery_lab';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<OutlierLabDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<OutlierLabDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('attempts')) {
          const attemptStore = db.createObjectStore('attempts', { keyPath: 'id' });
          attemptStore.createIndex('by-question', 'questionId');
          attemptStore.createIndex('by-module', 'moduleId');
          attemptStore.createIndex('by-date', 'timestamp');
        }

        if (!db.objectStoreNames.contains('spacedRepetition')) {
          const srsStore = db.createObjectStore('spacedRepetition', { keyPath: 'questionId' });
          srsStore.createIndex('by-next-review', 'nextReviewDate');
        }

        if (!db.objectStoreNames.contains('profile')) {
          db.createObjectStore('profile', { keyPath: 'id' as any });
        }

        if (!db.objectStoreNames.contains('examResults')) {
          const examStore = db.createObjectStore('examResults', { keyPath: 'id' });
          examStore.createIndex('by-date', 'timestamp');
        }

        if (!db.objectStoreNames.contains('codeDrafts')) {
          db.createObjectStore('codeDrafts', { keyPath: 'questionId' });
        }
      },
    });
  }
  return dbPromise;
}

const DEFAULT_PROFILE: UserProfile = {
  xp: 0,
  streakDays: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  totalPracticeTimeSeconds: 0,
  completedQuestionIds: [],
  dailyTargetQuestions: 5,
  preferredDifficulty: 'intermediate',
  executionMode: 'native_server',
};

// Profile operations
export async function getProfile(): Promise<UserProfile> {
  try {
    const db = await getDB();
    const stored = (await db.get('profile', 'current' as any)) as any;
    if (stored) {
      // Check streak continuity
      const today = new Date().toISOString().split('T')[0];
      const lastActive = stored.lastActiveDate;
      const daysDiff = Math.floor(
        (new Date(today).getTime() - new Date(lastActive).getTime()) / (1000 * 60 * 60 * 24)
      );

      let streak = stored.streakDays;
      if (daysDiff === 1) {
        streak += 1;
      } else if (daysDiff > 1) {
        streak = 1;
      }

      const updated = { ...stored, streakDays: streak, lastActiveDate: today };
      await db.put('profile', { ...updated, id: 'current' } as any);
      return updated;
    }
  } catch (err) {
    console.warn('IDB getProfile error, falling back to localStorage', err);
  }

  // Fallback to localStorage
  const local = localStorage.getItem('outlier_profile');
  if (local) {
    try {
      return JSON.parse(local);
    } catch {}
  }

  return DEFAULT_PROFILE;
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  try {
    const db = await getDB();
    await db.put('profile', { ...profile, id: 'current' } as any);
  } catch (err) {
    console.warn('IDB saveProfile error', err);
  }
  localStorage.setItem('outlier_profile', JSON.stringify(profile));
}

// Attempt logging
export async function recordAttempt(attempt: UserAttempt): Promise<void> {
  try {
    const db = await getDB();
    await db.put('attempts', attempt);

    // Update profile
    const profile = await getProfile();
    const completedSet = new Set(profile.completedQuestionIds);
    if (attempt.isCorrect) {
      completedSet.add(attempt.questionId);
    }

    const earnedXp = attempt.isCorrect ? Math.max(10, attempt.score) : 2;

    await saveProfile({
      ...profile,
      xp: profile.xp + earnedXp,
      totalPracticeTimeSeconds: profile.totalPracticeTimeSeconds + attempt.timeSpentSeconds,
      completedQuestionIds: Array.from(completedSet),
    });
  } catch (err) {
    console.error('Failed to record attempt in IDB', err);
  }
}

export async function getAttemptsByQuestion(questionId: string): Promise<UserAttempt[]> {
  try {
    const db = await getDB();
    const index = db.transaction('attempts').store.index('by-question');
    return await index.getAll(questionId);
  } catch {
    return [];
  }
}

export async function getAllAttempts(): Promise<UserAttempt[]> {
  try {
    const db = await getDB();
    return await db.getAll('attempts');
  } catch {
    return [];
  }
}

// Code drafts
export async function saveCodeDraft(questionId: string, code: string): Promise<void> {
  try {
    const db = await getDB();
    await db.put('codeDrafts', { questionId, code, lastUpdated: Date.now() });
  } catch (err) {
    localStorage.setItem(`draft_${questionId}`, code);
  }
}

export async function getCodeDraft(questionId: string): Promise<string | null> {
  try {
    const db = await getDB();
    const item = await db.get('codeDrafts', questionId);
    if (item) return item.code;
  } catch {}
  return localStorage.getItem(`draft_${questionId}`);
}

// Spaced Repetition items
export async function getSpacedRepetitionQueue(): Promise<SpacedRepetitionItem[]> {
  try {
    const db = await getDB();
    return await db.getAll('spacedRepetition');
  } catch {
    return [];
  }
}

export async function saveSpacedRepetitionItem(item: SpacedRepetitionItem): Promise<void> {
  try {
    const db = await getDB();
    await db.put('spacedRepetition', item);
  } catch (err) {
    console.error('Failed to save spaced repetition item', err);
  }
}

// Exam results
export async function saveExamResult(result: MockExamResult): Promise<void> {
  try {
    const db = await getDB();
    await db.put('examResults', result);
  } catch (err) {
    console.error('Failed to save exam result', err);
  }
}

export async function getExamResults(): Promise<MockExamResult[]> {
  try {
    const db = await getDB();
    return await db.getAll('examResults');
  } catch {
    return [];
  }
}

// Export / Import / Reset
export async function exportAllProgress(): Promise<string> {
  const db = await getDB();
  const profile = await getProfile();
  const attempts = await db.getAll('attempts');
  const srs = await db.getAll('spacedRepetition');
  const exams = await db.getAll('examResults');

  const bundle = {
    version: 1,
    exportedAt: new Date().toISOString(),
    profile,
    attempts,
    spacedRepetition: srs,
    examResults: exams,
  };

  return JSON.stringify(bundle, null, 2);
}

export async function importProgress(jsonString: string): Promise<boolean> {
  try {
    const data = JSON.parse(jsonString);
    if (!data.version || !data.profile) return false;

    const db = await getDB();
    await saveProfile(data.profile);

    if (Array.isArray(data.attempts)) {
      const tx = db.transaction('attempts', 'readwrite');
      for (const a of data.attempts) {
        await tx.store.put(a);
      }
      await tx.done;
    }

    if (Array.isArray(data.spacedRepetition)) {
      const tx = db.transaction('spacedRepetition', 'readwrite');
      for (const s of data.spacedRepetition) {
        await tx.store.put(s);
      }
      await tx.done;
    }

    if (Array.isArray(data.examResults)) {
      const tx = db.transaction('examResults', 'readwrite');
      for (const e of data.examResults) {
        await tx.store.put(e);
      }
      await tx.done;
    }

    return true;
  } catch (err) {
    console.error('Failed to import progress', err);
    return false;
  }
}

export async function resetAllProgress(): Promise<void> {
  const db = await getDB();
  await db.clear('attempts');
  await db.clear('spacedRepetition');
  await db.clear('examResults');
  await db.clear('codeDrafts');
  await saveProfile(DEFAULT_PROFILE);
  localStorage.clear();
}
