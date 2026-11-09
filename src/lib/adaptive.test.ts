import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateSM2, deriveQualityRating, calculateTopicMastery, buildAdaptiveQueue } from './adaptive';
import { Question } from '../types';

test('SM-2 scheduler increases interval on consecutive correct answers', () => {
  // First correct answer (quality 4)
  const item1 = calculateSM2(undefined, 4, 100);
  assert.equal(item1.repetition, 1);
  assert.equal(item1.intervalDays, 1);

  // Second correct answer
  const item2 = calculateSM2(item1, 5, 100);
  assert.equal(item2.repetition, 2);
  assert.equal(item2.intervalDays, 3);

  // Third correct answer
  const item3 = calculateSM2(item2, 5, 100);
  assert.equal(item3.repetition, 3);
  assert.equal(item3.intervalDays, 7);

  // Fourth correct answer (uses easeFactor >= 2.5)
  const item4 = calculateSM2(item3, 5, 100);
  assert.equal(item4.repetition, 4);
  assert.ok(item4.intervalDays >= 17);
});

test('SM-2 resets interval to 1 on failure', () => {
  const establishedItem = {
    questionId: 'q-test-1',
    repetition: 4,
    intervalDays: 18,
    easeFactor: 2.6,
    nextReviewDate: Date.now(),
    lastReviewedDate: Date.now() - 18 * 86400000,
    lastScore: 100,
  };

  const failedItem = calculateSM2(establishedItem, 1, 0);
  assert.equal(failedItem.repetition, 0);
  assert.equal(failedItem.intervalDays, 1);
});

test('deriveQualityRating accurately scores hint usage and timing', () => {
  // Perfect fast solve with 0 hints -> quality 5
  assert.equal(deriveQualityRating(true, 100, 0, 45, 2), 5);

  // Correct solve with 1 hint -> quality 4
  assert.equal(deriveQualityRating(true, 85, 1, 60, 2), 4);

  // Correct solve with 3 hints -> quality 3
  assert.equal(deriveQualityRating(true, 70, 3, 120, 2), 3);

  // Failed solve -> quality 1 or 2
  assert.equal(deriveQualityRating(false, 0, 0, 90, 2), 1);
});

test('calculateTopicMastery weights recognition, application, and analysis correctly', () => {
  const attempts = [
    {
      id: 'a1',
      questionId: 'q1',
      timestamp: Date.now(),
      timeSpentSeconds: 60,
      isCorrect: true,
      score: 100,
      hintsRevealed: 0,
      taskType: 'knowledge' as const,
      moduleId: 'MOD_02',
    },
    {
      id: 'a2',
      questionId: 'q2',
      timestamp: Date.now(),
      timeSpentSeconds: 120,
      isCorrect: true,
      score: 80,
      hintsRevealed: 1,
      taskType: 'coding_challenge' as const,
      moduleId: 'MOD_02',
    },
    {
      id: 'a3',
      questionId: 'q3',
      timestamp: Date.now(),
      timeSpentSeconds: 150,
      isCorrect: true,
      score: 90,
      hintsRevealed: 0,
      taskType: 'debugging' as const,
      moduleId: 'MOD_02',
    },
  ];

  const mastery = calculateTopicMastery('MOD_02', 'null_safety', attempts);
  assert.equal(mastery.recognitionScore, 100);
  assert.equal(mastery.applicationScore, 80);
  assert.equal(mastery.analysisScore, 90);
  // Expected: 100 * 0.25 (25) + 80 * 0.4 (32) + 90 * 0.35 (31.5) = 88.5 -> 89
  assert.equal(mastery.overallMastery, 89);
  assert.equal(mastery.attemptsCount, 3);
});

test('buildAdaptiveQueue prioritizes overdue reviews', () => {
  const mockQuestions: Question[] = [
    {
      id: 'q-overdue',
      moduleId: 'MOD_01',
      moduleName: 'Dart Foundations',
      topic: 'Variables',
      subtopic: 'const vs final',
      difficulty: 'beginner',
      taskType: 'knowledge',
      title: 'Overdue Question',
      prompt: 'Prompt',
      learningObjectives: [],
      estimatedMinutes: 2,
      hints: [],
      explanation: { coreReasoning: '', dartRule: '' },
      sourceDesignation: 'verified_official',
    },
    {
      id: 'q-fresh',
      moduleId: 'MOD_01',
      moduleName: 'Dart Foundations',
      topic: 'Control Flow',
      subtopic: 'switch',
      difficulty: 'beginner',
      taskType: 'knowledge',
      title: 'Fresh Question',
      prompt: 'Prompt',
      learningObjectives: [],
      estimatedMinutes: 2,
      hints: [],
      explanation: { coreReasoning: '', dartRule: '' },
      sourceDesignation: 'verified_official',
    },
  ];

  const srsItems = [
    {
      questionId: 'q-overdue',
      repetition: 2,
      intervalDays: 3,
      easeFactor: 2.5,
      nextReviewDate: Date.now() - 10000, // already overdue
      lastReviewedDate: Date.now() - 86400000 * 3,
      lastScore: 100,
    },
  ];

  const queue = buildAdaptiveQueue(mockQuestions, srsItems, []);
  assert.equal(queue[0].id, 'q-overdue');
});
