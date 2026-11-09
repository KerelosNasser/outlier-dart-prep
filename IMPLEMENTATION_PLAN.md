# IMPLEMENTATION PLAN — OUTLIER DART MASTERY LAB

Status Legend:
- [ ] Not started
- [~] In progress
- [x] Completed
- [!] Blocked

---

## PHASE 0 — Research, Environment & Architecture Setup
- [x] Research current official Dart documentation (Dart 3.x specifications, Effective Dart).
- [x] Investigate Outlier coding assessment formats and evaluation criteria.
- [x] Verify Dart execution options and install native Dart SDK 3.13.7.
- [x] Establish persistent memory files (`PROJECT_STATE.md`, `IMPLEMENTATION_PLAN.md`, `RESEARCH_SOURCES.md`, `CONTENT_INVENTORY.md`, `CHANGELOG.md`).
- [x] Configure Tailwind CSS v4, dark mode variant, Google Fonts (Plus Jakarta Sans & JetBrains Mono).
- [x] Install runtime dependencies (`@monaco-editor/react`, `idb`, `canvas-confetti`).

---

## PHASE 1 — Core Full-Stack Infrastructure & Shell
- [x] Create server-side execution sandbox in `server.ts` using native Dart SDK subprocesses.
- [x] Add secure sandbox controls: execution timeouts (4s), directory isolation, environment sanitization, compile vs runtime error categorization.
- [x] Define TypeScript schemas for modules, topics, questions, attempts, user progress, and assessment submissions.
- [x] Implement local-first persistence layer using IndexedDB (`lib/storage.ts`) with schema migrations and backup/restore.
- [x] Build application navigation shell: Sidebar + Top Bar Contract + View router (Dashboard, Curriculum, Practice Lab, Outlier Simulator, Mock Exams, Analytics, Reference, Settings).

---

## PHASE 2 — Question Bank & Interactive Learning Engine
- [x] Build Module 01-14 structured curriculum metadata and learning objectives.
- [x] Build question bank covering all 8 task types:
  - [x] Type A: Knowledge Assessment (Single/Multiple Choice with deep explanations).
  - [x] Type B: Code Tracing (Output prediction, execution order, type promotion).
  - [x] Type C: Coding Challenges (Function/class implementations with automated test cases).
  - [x] Type D: Debugging (Broken code with error diagnosis, fix verification, and explanation).
  - [x] Type E: Code Review (Evaluating correctness, null-safety, style, and performance).
  - [x] Type F: Compare AI Answers (Side-by-side Model A vs Model B evaluation, flaw detection, and justification).
  - [x] Type G: Prompt & Rubric Creation (Authoring challenging prompts, test specs, and scoring criteria).
  - [x] Type H: Project Simulation (Multi-step real-world Dart engineering challenges).
- [x] Implement 4-tier progressive hint system (Concept -> Feature -> Location -> Code skeleton).
- [x] Implement adaptive mastery calculator (Recognition vs Application vs Analysis) and spaced-repetition scheduler (SM-2 based).

---

## PHASE 3 — Interactive Practice IDE & Outlier Work Simulator
- [x] Monaco code editor integration with Dart syntax highlighting, line numbers, and dark theme.
- [x] Live runner bridge connecting frontend editor to `/api/dart/run` and `/api/dart/analyze`.
- [x] Automated test runner running test suites against student Dart implementations.
- [x] Test case output console with detailed diffs, execution timing, memory notes, and compiler diagnostics.
- [x] Dedicated Outlier Work Simulator UI:
  - Model A vs Model B comparison matrix.
  - Multi-criterion evaluation rubric builder (Correctness, Null Safety, Performance, Idiomatic Dart).
  - Justification text editor with automated quality checklist.
- [x] Project Simulation workspace for multi-step engineering tasks.

---

## PHASE 4 — Mock Assessment Center & Analytics
- [x] Configurable Mock Exam engine:
  - 10 Assessment categories (Fundamentals, Null Safety, OOP, Async, Concurrency, Algorithms, Mixed Technical, Full Mastery Simulation).
  - Timers, question randomization, no-hint enforcement, and submission locking.
- [x] Comprehensive Assessment Report card:
  - Percentile, overall score, domain mastery breakdown, time management, mistake categorization, and personalized recommendations.
- [x] Learning Analytics Dashboard:
  - Topic mastery heatmap, accuracy trends, XP progression, retention calendar, and weakness radar.
- [x] Settings & Data Management:
  - Execution mode switcher (Native Server, Local Companion, Offline Evaluator).
  - Daily goal configuration, difficulty tuning, export/import JSON progress backup.

---

## PHASE 5 — Verification & Quality Assurance
- [x] Unit tests for pure evaluation, scoring, and spaced-repetition logic (`tsx --test`).
- [x] Applet compilation check (`compile_applet` + `lint_applet`).
- [x] Dev server restart & live browser verification via `computer-use` skill (Playwright).
- [x] Visual critique and defect resolution.
