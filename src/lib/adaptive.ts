import { SpacedRepetitionItem, TopicMastery, UserAttempt, Question } from '../types';

/**
 * SuperMemo SM-2 Algorithm Implementation for Dart Concept Retention
 * Quality scale:
 * 5: Perfect recall / implementation with zero hints and quick solve
 * 4: Correct solve after minor hesitation or 1 hint
 * 3: Correct solve with multiple hints or after debugging
 * 2: Incorrect response, but recognized the problem upon seeing answer
 * 1: Incorrect response, completely missed the rule
 * 0: Complete blackout / blank attempt
 */
export function calculateSM2(
  item: SpacedRepetitionItem | undefined,
  quality: number,
  score: number
): SpacedRepetitionItem {
  let repetition = item ? item.repetition : 0;
  let intervalDays = item ? item.intervalDays : 1;
  let easeFactor = item ? item.easeFactor : 2.5;

  if (quality >= 3) {
    if (repetition === 0) {
      intervalDays = 1;
    } else if (repetition === 1) {
      intervalDays = 3;
    } else if (repetition === 2) {
      intervalDays = 7;
    } else {
      intervalDays = Math.round(intervalDays * easeFactor);
    }
    repetition += 1;
  } else {
    repetition = 0;
    intervalDays = 1;
  }

  // Update ease factor: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  const now = Date.now();
  const nextReviewDate = now + intervalDays * 24 * 60 * 60 * 1000;

  return {
    questionId: item?.questionId || '',
    repetition,
    intervalDays,
    easeFactor: Number(easeFactor.toFixed(3)),
    nextReviewDate,
    lastReviewedDate: now,
    lastScore: score,
  };
}

/**
 * Calculate quality rating from attempt metrics
 */
export function deriveQualityRating(
  isCorrect: boolean,
  score: number,
  hintsUsed: number,
  timeSpentSeconds: number,
  expectedMinutes: number
): number {
  if (!isCorrect) {
    return score > 30 ? 2 : 1;
  }

  // Correct attempts
  if (hintsUsed === 0 && timeSpentSeconds <= expectedMinutes * 60 * 1.2) {
    return 5;
  }
  if (hintsUsed <= 1) {
    return 4;
  }
  return 3;
}

/**
 * Multi-dimensional topic mastery model
 * Mastery = 25% Recognition (Theory/MCQ) + 40% Application (Coding/Tests) + 35% Analysis (Debug/Review/Comparison)
 */
export function calculateTopicMastery(
  moduleId: string,
  topicId: string,
  attempts: UserAttempt[]
): TopicMastery {
  const topicAttempts = attempts.filter((a) => a.moduleId === moduleId);

  let recognitionScores: number[] = [];
  let applicationScores: number[] = [];
  let analysisScores: number[] = [];

  for (const a of topicAttempts) {
    if (a.taskType === 'knowledge' || a.taskType === 'code_tracing') {
      recognitionScores.push(a.score);
    } else if (a.taskType === 'coding_challenge' || a.taskType === 'project_simulation') {
      applicationScores.push(a.score);
    } else {
      analysisScores.push(a.score);
    }
  }

  const avg = (arr: number[]) => (arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0);

  const recognitionScore = Math.round(avg(recognitionScores));
  const applicationScore = Math.round(avg(applicationScores));
  const analysisScore = Math.round(avg(analysisScores));

  // If no attempts yet in a category, default to 0
  const overallMastery = Math.round(
    recognitionScore * 0.25 + applicationScore * 0.4 + analysisScore * 0.35
  );

  return {
    moduleId,
    topicId,
    recognitionScore,
    applicationScore,
    analysisScore,
    overallMastery,
    attemptsCount: topicAttempts.length,
    lastPracticed: topicAttempts.length ? Math.max(...topicAttempts.map((a) => a.timestamp)) : 0,
  };
}

/**
 * Prioritize questions for the adaptive training queue:
 * 1. Overdue spaced-repetition questions
 * 2. Questions with previous failed attempts
 * 3. Unattempted questions in the active curriculum
 */
export function buildAdaptiveQueue(
  allQuestions: Question[],
  srsItems: SpacedRepetitionItem[],
  attempts: UserAttempt[],
  limit = 8
): Question[] {
  const now = Date.now();
  const queue: Question[] = [];
  const addedIds = new Set<string>();

  // 1. Check overdue SRS items
  const overdueSRS = srsItems
    .filter((item) => item.nextReviewDate <= now)
    .sort((a, b) => a.nextReviewDate - b.nextReviewDate);

  for (const srs of overdueSRS) {
    const q = allQuestions.find((item) => item.id === srs.questionId);
    if (q && !addedIds.has(q.id)) {
      queue.push(q);
      addedIds.add(q.id);
      if (queue.length >= limit) return queue;
    }
  }

  // 2. Questions with recent failures or low score (< 70)
  const failedQuestionIds = new Set<string>();
  for (const a of attempts) {
    if (!a.isCorrect || a.score < 70) {
      failedQuestionIds.add(a.questionId);
    }
  }

  for (const qId of failedQuestionIds) {
    if (!addedIds.has(qId)) {
      const q = allQuestions.find((item) => item.id === qId);
      if (q) {
        queue.push(q);
        addedIds.add(q.id);
        if (queue.length >= limit) return queue;
      }
    }
  }

  // 3. Uncompleted high-priority questions
  const completedIds = new Set(attempts.filter((a) => a.isCorrect).map((a) => a.questionId));
  for (const q of allQuestions) {
    if (!completedIds.has(q.id) && !addedIds.has(q.id)) {
      queue.push(q);
      addedIds.add(q.id);
      if (queue.length >= limit) return queue;
    }
  }

  return queue;
}
