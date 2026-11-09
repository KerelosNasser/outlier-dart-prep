# PROJECT STATE — OUTLIER DART MASTERY LAB

**Status**: Active — Phase 0 Complete / Phase 1 in Progress
**Last Updated**: 2026-11-09T12:55:00-08:00
**Dart Runtime**: Native Dart SDK 3.13.7 (stable) verified & installed globally (`/usr/local/bin/dart`).

---

## 1. PROJECT OBJECTIVE
Deliver a comprehensive, production-grade interactive Dart engineering laboratory and Outlier AI technical assessment simulator.
The platform prepares engineers to pass Outlier AI's Dart qualification screenings and excel on real RLHF code evaluation, model comparison, bug detection, and algorithmic task assignments.

---

## 2. CURRENT ARCHITECTURE
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS v4.
- **Styling & Theme**: Dark-mode technical IDE aesthetic (`#0b0f19` canvas, `#111827` structural panels, `#38bdf8` / `#10b981` accents) following the `frontend-design` constitution (zero-pill metadata, single-elevation depth, tabular numerals).
- **Typography**: Plus Jakarta Sans (UI headers & body) + JetBrains Mono (code, data, metrics).
- **Code Editor**: Monaco Editor with full Dart syntax highlighting, line numbers, error markers, and customizable themes.
- **Execution Engine**:
  - Full-Stack Express API server (`server.ts`) with `/api/dart/run`, `/api/dart/analyze`, and `/api/dart/format` endpoints.
  - Native Dart SDK 3.13.7 subprocess runner with isolated temporary workspaces, 4-second timeout protection, stripped environment secrets, and strict resource bounds.
  - In-browser semantic fallback and local companion runner instructions.
- **State & Persistence**:
  - Local-first persistence via IndexedDB (`idb`) storing attempt history, code snapshots, spaced repetition queues, topic mastery matrices, and mock exam results.
  - JSON Export & Import with schema validation.

---

## 3. IMPLEMENTED FEATURES & COMPONENTS
- [x] Official Dart SDK 3.13.7 (stable) installed, linked, and verified globally.
- [x] Research classification and documentation framework (`RESEARCH_SOURCES.md`).
- [x] Metadata, title, and typography integration (`index.html`, `metadata.json`, `index.css`).
- [x] Core dependencies installed and verified (`idb`, `canvas-confetti`).
- [x] Full-Stack server setup (`server.ts`) with sandbox native Dart executor, analyzer, and formatter.
- [x] Core Navigation & Shell (Dashboard, Curriculum, Practice IDE, Outlier Work Simulator, Mock Assessment Center, Analytics, Reference, Settings).
- [x] 14-Module Curriculum structure with topic mastery tracking.
- [x] 8 Outlier-Style Task Types (Knowledge, Code Tracing, Coding Challenges, Debugging, Code Review, AI Answer Comparison, Prompt & Rubric Creation, Project Simulation).
- [x] SM-2 Spaced Repetition scheduler and multi-dimensional topic mastery engine with unit tests passing (100% pass in 244ms).
- [x] Native DartCodeEditor with line numbers, 2-space tab indentation, auto-indent, and Cmd/Ctrl+Enter execution.
- [x] Outlier Work Simulator with Model A vs Model B side-by-side comparison, rubric scoring, and live quality prober.
- [x] Outlier Justification Rigor Evaluator with automated line citation detection, Big-O analysis, and Tier S/A/B grading.
- [x] Mock Assessment Center with 10 exam blueprints, live countdown timer, auto-grading, and diagnostic scorecards.
- [x] Expanded question bank with advanced Dart 3 class modifiers, reactive stream batching, isolate handshake protocols, dynamic programming (0/1 Knapsack), and Floyd's cycle detection (39 total rich challenges).
- [x] Local-first IndexedDB persistence with JSON export, import, and reset safety confirmation.
- [x] End-to-end browser verification via Playwright CLI.

---

## 4. CURRENT WORKING STATUS & VERIFICATION
- Dart binary test: `dart --version` -> `Dart SDK version: 3.13.7 (stable) (Thu Oct 22 14:28:57 2026 -0700) on "linux_x64"`.
- Unit tests: `npx --yes tsx --test src/lib/adaptive.test.ts` -> 5 of 5 tests passed (100% pass in 307ms).
- Compilation (`compile_applet`): Clean build (Vite + React 19).
- TypeScript diagnostics (`lint_applet`): Clean, zero lint or type errors.
- Real Browser Verification (`playwright-cli`): Dashboard, Outlier Simulator with S-Tier Justification scoring, and Mock Assessment Center tested and verified end-to-end.

---

## 5. NEXT ACTIONS
1. Add interactive AST visualization for Dart 3 record destructuring and pattern exhaustiveness.
2. Add custom user-authored challenge creator in Settings.
3. Add exportable Outlier Qualification Readiness certificate based on mock exam passing scores.

