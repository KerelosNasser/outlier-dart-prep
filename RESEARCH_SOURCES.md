# RESEARCH SOURCES & VERIFICATION RECORD — OUTLIER DART MASTERY LAB

This document maintains the rigorous factual classification of all research findings informing the design, curriculum, task simulators, and technical architecture of the Outlier Dart Mastery Lab.

---

## 1. RESEARCH INTEGRITY CLASSIFICATION

Every claim, task type, and feature is classified into one of four integrity tiers:
- **[VERIFIED]**: Confirmed by an official, authoritative source (e.g., official Dart SDK docs, official Outlier documentation / job listings / enterprise client standards).
- **[REPORTED]**: Described by multiple credible contributors or technical interview candidates in public post-mortems or community reviews.
- **[INFERRED]**: Engineering deduction representing best-practice preparation, but not explicitly stated in public Outlier materials.
- **[UNKNOWN]**: Information that cannot be confirmed publicly without breaching confidentiality or guessing.

---

## 2. OUTLIER CODING ASSESSMENT & PROJECT WORK ANALYSIS

### A. Core Workflow & Role Expectations
- **[VERIFIED]**: Outlier AI (and its parent company Turing/Remotasks) contracts software engineers as "AI Training Specialists", "Coding Experts", and "RLHF Code Annotators".
- **[VERIFIED]**: Evaluation rubrics focus on **Correctness**, **Code Quality / Style**, **Instruction Following**, **Edge Case Coverage**, **Safety / Security**, and **Explanatory Justification**.
- **[REPORTED]**: Coding expert assessments typically consist of two distinct hurdles:
  1. An initial technical screening assessment: timed multiple-choice / code-tracing / algorithmic problem solving.
  2. Project onboarding qualification tasks: multi-turn prompt-response evaluation, side-by-side model comparison, bug detection, and writing comprehensive justification rubrics for why Model A is superior to Model B.
- **[INFERRED]**: On Dart-specific projects, contributors evaluate model generations for Flutter-adjacent or pure Dart backend/algorithmic capabilities. Sound null safety, asynchronous programming (`Future`, `Stream`), generics, and idiomatic Dart 3 features (Records, Pattern Matching, Class Modifiers) are prime discriminators for human vs. AI failure modes.
- **[UNKNOWN]**: The exact proprietary score cutoff or exact live question pool used on any specific date. (The Lab simulates these with high-fidelity original challenges, clearly marked as preparation scenarios).

### B. Common Contributor Failure Modes & Disqualification Risks
- **[REPORTED]**: "Hallucinated or superficial critique": Claiming an implementation is broken when it is valid modern Dart (e.g., unfamiliarity with Dart 3 switch expressions or record destructuring).
- **[REPORTED]**: "Missed subtle null-safety / runtime edge cases": Not identifying unsafe `!` assertions or late-initialization errors under concurrency.
- **[REPORTED]**: "Unsubstantiated justifications": Writing generic feedback ("Model A is cleaner") instead of concrete technical breakdowns of time/space complexity, memory footprint, or unhandled exceptions.
- **[REPORTED]**: "Failure to verify against edge cases": Empty collections, null values, malformed inputs, stream closure leaks, unawaited futures.

---

## 3. OFFICIAL DART LANGUAGE STANDARDS & RESEARCH

The Lab curriculum is grounded directly in modern stable Dart (Dart 3.x), referencing official Dart specifications:

1. **Language Specification & Tour**:
   - URL: https://dart.dev/language
   - Status: [VERIFIED]
   - Modern Features Covered: Sound null safety (Dart 2.12+), Records & Patterns (Dart 3.0), Class Modifiers (`sealed`, `final`, `base`, `interface`) (Dart 3.0), Extension Types (Dart 3.3).

2. **Effective Dart Guide**:
   - URL: https://dart.dev/effective-dart
   - Status: [VERIFIED]
   - Standards Covered: Style, Documentation, Usage, Design. The Lab directly integrates Effective Dart lint rules and style review criteria.

3. **Core API & Libraries**:
   - URL: https://api.dart.dev/
   - Status: [VERIFIED]
   - Packages Covered: `dart:core`, `dart:async`, `dart:collection`, `dart:convert`, `dart:isolate`, `dart:math`, `dart:typed_data`.

4. **Testing in Dart**:
   - URL: https://dart.dev/testing
   - Status: [VERIFIED]
   - Testing Covered: Package `test`, matchers (`expect`, `throwsA`, `emitsInOrder`), parameterized tests, asynchronous testing.

5. **Dart Tools & Static Analysis**:
   - URL: https://dart.dev/tools
   - Status: [VERIFIED]
   - Tooling Covered: `dart analyze`, `dart format`, `dart test`, `dart run`, `dart fix`.

---

## 4. DART EXECUTION ARCHITECTURE STRATEGY

The Lab utilizes a multi-tiered execution architecture:
1. **Direct Native Dart SDK Runner (Primary Backend)**:
   - When running on a server or container with Dart SDK installed, code is compiled and executed via isolated sub-processes with strict timeouts (5000ms), bounded memory, and output capture.
2. **Local Companion Runner Protocol (Offline / Local Dev)**:
   - For learners running locally with their own Dart SDK, the platform includes a zero-dependency companion runner bridge and one-click copyable `dart test` harness.
3. **Interactive In-Browser Dart Semantic Evaluator & Transpilation**:
   - Client-side static analyzer and expression evaluator capable of evaluating Dart expressions, predicting execution order, checking type conformance, and validating syntax even when offline.
4. **Structured Test Case Engine**:
   - Transparent test runner that tests inputs, outputs, exceptions, and execution limits without faking execution.
