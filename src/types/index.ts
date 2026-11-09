export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'mastery';

export type TaskType = 
  | 'knowledge'         // Task Type A: Conceptual MCQ, single/multi choice
  | 'code_tracing'      // Task Type B: Predict output / execution order / type promotion
  | 'coding_challenge'  // Task Type C: Implement function/class against test cases
  | 'debugging'         // Task Type D: Diagnose & fix intentionally broken program + explain
  | 'code_review'       // Task Type E: Audit implementation for null safety, performance, Effective Dart
  | 'ai_comparison'     // Task Type F: Compare Model A vs Model B Dart outputs + justification
  | 'prompt_rubric'     // Task Type G: Author challenging Dart prompt, test specs, and evaluation rubric
  | 'project_simulation'; // Task Type H: Multi-step real-world Dart engineering assignment

export interface TestCase {
  id: string;
  name: string;
  inputDescription?: string;
  expectedOutput: string;
  testCode: string; // Dart test code or assert statement
  isHidden?: boolean;
}

export interface Hint {
  level: 1 | 2 | 3 | 4;
  title: string;
  content: string;
}

export interface Question {
  id: string;
  moduleId: string;
  moduleName: string;
  topic: string;
  subtopic: string;
  difficulty: DifficultyLevel;
  taskType: TaskType;
  title: string;
  prompt: string;
  learningObjectives: string[];
  estimatedMinutes: number;
  
  // Code & Templates
  starterCode?: string;
  referenceSolution?: string;
  brokenCode?: string; // For debugging tasks
  modelA?: { code: string; author: string; flaws?: string[] }; // For AI comparison tasks
  modelB?: { code: string; author: string; flaws?: string[] };
  
  // MCQ / Tracing
  options?: { id: string; text: string; isCorrect: boolean }[];
  expectedOutput?: string;
  
  // Test cases for runnable code
  testCases?: TestCase[];
  
  // Pedagogy & Guidance
  hints: Hint[];
  explanation: {
    coreReasoning: string;
    whyOthersFail?: string;
    dartRule: string;
    correctedExample?: string;
    deepDive?: string;
  };
  commonMisconceptions?: string[];
  rubricCriteria?: { name: string; maxPoints: number; description: string }[];
  
  // Source designation
  sourceDesignation: 'verified_official' | 'reported_outlier_pattern' | 'original_mastery_challenge';
}

export interface CurriculumModule {
  id: string;
  number: number;
  title: string;
  tagline: string;
  description: string;
  priority: 'high' | 'medium' | 'standard';
  topics: {
    id: string;
    name: string;
    concepts: string[];
    questionIds: string[];
  }[];
}

export interface UserAttempt {
  id: string;
  questionId: string;
  timestamp: number;
  timeSpentSeconds: number;
  isCorrect: boolean;
  score: number; // 0 - 100
  submittedCode?: string;
  selectedOptionId?: string;
  justificationText?: string;
  hintsRevealed: number;
  feedback?: string;
  taskType: TaskType;
  moduleId: string;
}

export interface SpacedRepetitionItem {
  questionId: string;
  repetition: number; // consecutive correct answers
  intervalDays: number;
  easeFactor: number; // default 2.5
  nextReviewDate: number; // timestamp
  lastReviewedDate: number;
  lastScore: number;
}

export interface TopicMastery {
  moduleId: string;
  topicId: string;
  recognitionScore: number; // 0-100 (MCQ/theory)
  applicationScore: number; // 0-100 (coding/debugging)
  analysisScore: number;    // 0-100 (review/comparison/rubric)
  overallMastery: number;   // weighted aggregate
  attemptsCount: number;
  lastPracticed: number;
}

export interface UserProfile {
  xp: number;
  streakDays: number;
  lastActiveDate: string; // YYYY-MM-DD
  totalPracticeTimeSeconds: number;
  completedQuestionIds: string[];
  dailyTargetQuestions: number;
  preferredDifficulty: DifficultyLevel;
  executionMode: 'native_server' | 'in_browser' | 'local_companion';
}

export interface MockExamBlueprint {
  id: string;
  title: string;
  category: string;
  description: string;
  durationMinutes: number;
  totalQuestions: number;
  allowedTaskTypes: TaskType[];
  targetModuleIds: string[];
  questionIds: string[];
  passingScore: number;
}

export interface MockExamResult {
  id: string;
  examId: string;
  title: string;
  timestamp: number;
  durationSeconds: number;
  totalQuestions: number;
  correctCount: number;
  scorePercentage: number;
  passed: boolean;
  moduleBreakdown: { moduleId: string; moduleName: string; score: number }[];
  questionResults: {
    questionId: string;
    title: string;
    isCorrect: boolean;
    userAnswer?: string;
    timeSpentSeconds: number;
  }[];
  weaknessesIdentified: string[];
  strengthsIdentified: string[];
  recommendations: string[];
}
