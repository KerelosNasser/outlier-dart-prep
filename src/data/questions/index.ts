import { Question, TaskType, DifficultyLevel } from '../../types';
import { MODULE_01_QUESTIONS, MODULE_02_QUESTIONS } from './module01_02';
import { MODULE_03_06_QUESTIONS } from './module03_06';
import { MODULE_07_10_QUESTIONS } from './module07_10';
import { MODULE_11_14_QUESTIONS } from './module11_14';
import { ADVANCED_QUESTIONS_BANK } from './advanced_bank';

export const ALL_QUESTIONS: Question[] = [
  ...MODULE_01_QUESTIONS,
  ...MODULE_02_QUESTIONS,
  ...MODULE_03_06_QUESTIONS,
  ...MODULE_07_10_QUESTIONS,
  ...MODULE_11_14_QUESTIONS,
  ...ADVANCED_QUESTIONS_BANK,
];

export function getAllQuestions(): Question[] {
  return ALL_QUESTIONS;
}

export function getQuestionById(id: string): Question | undefined {
  return ALL_QUESTIONS.find((q) => q.id === id);
}

export function getQuestionsByModule(moduleId: string): Question[] {
  return ALL_QUESTIONS.filter((q) => q.moduleId === moduleId);
}

export function getQuestionsByTaskType(taskType: TaskType): Question[] {
  return ALL_QUESTIONS.filter((q) => q.taskType === taskType);
}

export function getQuestionsByDifficulty(diff: DifficultyLevel): Question[] {
  return ALL_QUESTIONS.filter((q) => q.difficulty === diff);
}
