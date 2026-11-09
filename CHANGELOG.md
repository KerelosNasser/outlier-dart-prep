# CHANGELOG — OUTLIER DART MASTERY LAB

All notable changes across sessions and cycles will be recorded in this file.

---

## [Phase 0 & 1 Initial Release] — 2026-11-09

### Added
- **Native Dart SDK 3.13.7**: Downloaded, installed, and verified Linux x64 official Dart SDK system-wide (`/usr/local/bin/dart`).
- **Research Framework**: Authored `RESEARCH_SOURCES.md` classifying Outlier qualifications and modern Dart 3.x specifications into VERIFIED, REPORTED, INFERRED, and UNKNOWN tiers.
- **Persistent State Documentation**: Created `PROJECT_STATE.md`, `IMPLEMENTATION_PLAN.md`, `CONTENT_INVENTORY.md`, and `CHANGELOG.md`.
- **Full-Stack Execution Backend**:
  - Express server (`server.ts`) with native Dart execution engine (`/api/dart/run`, `/api/dart/analyze`, `/api/dart/format`).
  - Process isolation, 4-second timeout protection, stripped environment credentials, temporary directory cleanup, and compile vs runtime error categorization.
- **Frontend Architecture**:
  - React 19 + TypeScript + Vite + Tailwind CSS v4.
  - Plus Jakarta Sans + JetBrains Mono typography pairing.
  - Monaco Editor integration for authentic IDE code editing.
  - IndexedDB storage engine (`lib/storage.ts`) with schema migrations and JSON export/import.
  - 14-Module Curriculum catalog and 8 Outlier-specific training task types.
  - Outlier Work Simulator for Model A vs Model B evaluations, bug diagnostics, and prompt/rubric authoring.
  - Timed Mock Assessment Center with 10 exam tracks and instant diagnostic scorecards.

---

## [Phase 2 & 3 Enhancements] — 2026-11-09

### Added
- **Expanded High-Yield Question Bank**:
  - Module 05: Dart 3 Class Modifiers Matrix (`base`, `interface`, `final`, `sealed`) subtyping and interface restrictions (`q_mod05_modifiers_matrix`).
  - Module 09: Reactive Stream Batching and buffering using `async*` generators with end-of-stream flushing (`q_mod09_batch_stream`).
  - Module 10: Two-way Isolate message-passing handshake protocol via `ReceivePort`/`SendPort` (`q_mod10_isolate_handshake`).
  - Module 14: 0/1 Knapsack Dynamic Programming with 1D reverse-traversal memory optimization $O(W)$ (`q_mod14_knapsack`).
  - Module 14: Floyd's Tortoise and Hare Cycle Detection on singly linked list with $O(N)$ time and $O(1)$ space (`q_mod14_cycle_detection`).
- **Outlier Simulator Live Rigor Evaluator**:
  - Automated multi-dimensional scoring of technical justifications across 6 key axes: word depth, specific line citations, sound null-safety, Big-O complexity, Effective Dart standards, and boundary edge cases.
  - Live Rigor Score bar (0–100%) and Tier rating (S-Tier, A-Tier, B-Tier, Needs Work).
  - Quick-insert snippet helper chips (`+ Line #`, `+ O(N) Time`, `+ Null Safety`, `+ Effective Dart`).
  - Benchmark comparison modal displaying automated evaluator review, gold-standard rationale, and official rubric breakdown.
- **Mock Exam Blueprint Wiring**:
  - Full randomized pools wired for `exam_algorithms`, `exam_outlier_simulation`, and `exam_capstone` with 12 distinct domains.

