import { Question } from '../../types';

export const MODULE_11_14_QUESTIONS: Question[] = [
  // Module 11: Effective Dart & Tooling
  {
    id: 'q_mod11_01',
    moduleId: 'MOD_11',
    moduleName: 'Libraries, Tooling & Effective Dart',
    topic: 'Effective Dart Style',
    subtopic: 'Cascades, Types, and Documentation',
    difficulty: 'intermediate',
    taskType: 'code_review',
    title: 'Effective Dart Audit: Cascade Notation and Redundant Types',
    prompt: 'Evaluate the following Dart snippet against official Effective Dart guidelines. Identify all style and idiom violations.',
    starterCode: `// Snippet for review:
List<String> buildConfig() {
  List<String> list = new List<String>(); // Violation?
  list.add("debug");
  list.add("verbose");
  list.add("telemetry");
  return list;
}`,
    referenceSolution: `EFFECTIVE DART VIOLATIONS IDENTIFIED:
1. Deprecated \`new\` keyword: DO NOT use the \`new\` keyword (it has been optional and discouraged since Dart 2.0).
2. Deprecated \`List()\` constructor: The no-argument \`List()\` constructor was removed in Dart 2.12; prefer collection literal \`<String>[]\`.
3. Redundant type annotation: With \`<String>[]\`, writing \`List<String> list\` is redundant; prefer \`final list = <String>[];\` or declare it immutably.
4. Missing Cascade or Collection Literal: Instead of repetitive manual \`list.add(...)\`, use cascade notation \`..\` or declare elements directly inside the collection literal \`<String>['debug', 'verbose', 'telemetry']\`.

IDIOMATIC EFFECTIVE DART REFACTOR:
\`\`\`dart
List<String> buildConfig() => const ['debug', 'verbose', 'telemetry'];
\`\`\``,
    learningObjectives: ['Audit code against Effective Dart Style and Usage guidelines'],
    estimatedMinutes: 4,
    hints: [{ level: 1, title: 'Effective Dart rules', content: 'Check: PREFER collection literals over constructors; AVOID using new.' }],
    explanation: {
      coreReasoning: 'Effective Dart prescribes: DO NOT use `new`. PREFER collection literals `<Type>[]`. DO NOT redundantly annotate types where inferred. PREFER returning immutable `const` collections when values are fixed.',
      dartRule: 'Effective Dart Style & Usage: Clean, concise, modern syntax without redundant keywords.',
    },
    rubricCriteria: [
      { name: 'Identified deprecated new/constructor', maxPoints: 40, description: 'Called out new keyword and deprecated List() constructor' },
      { name: 'Proposed collection literal', maxPoints: 30, description: 'Recommended <String>[] or const list literal' },
      { name: 'Identified cascade / declaration brevity', maxPoints: 30, description: 'Noticed repetitive list.add calls instead of inline elements' },
    ],
    sourceDesignation: 'verified_official',
  },

  // Module 12: Testing
  {
    id: 'q_mod12_rubric1',
    moduleId: 'MOD_12',
    moduleName: 'Testing & Software Quality',
    topic: 'RLHF Authoring',
    subtopic: 'Prompt and Evaluation Rubric Creation',
    difficulty: 'advanced',
    taskType: 'prompt_rubric',
    title: 'Author RLHF Prompt & Rubric for Dart Thread-Safe Counter',
    prompt: 'You are an Outlier AI Prompt & Rubric Specialist. Create a high-quality coding assessment prompt that asks a model to implement a rate-limiter class in Dart, along with expected edge cases, negative test criteria, and an explicit scoring rubric.',
    starterCode: `# 1. PROMPT SPECIFICATION:
Create a prompt requesting a TokenBucketRateLimiter class in Dart.

# 2. REQUIRED BEHAVIORS & EDGE CASES:
List at least 3 edge cases that a model must handle.

# 3. EVALUATION RUBRIC (Max 100 points):
Define criteria for:
- Correctness & Math
- Asynchronous / Timer safety
- Type soundness & Effective Dart`,
    referenceSolution: `### 1. PROMPT SPECIFICATION
"Implement a \`TokenBucketRateLimiter\` class in modern Dart that regulates action frequency using the token bucket algorithm.
Requirements:
- Constructor: \`TokenBucketRateLimiter({required int capacity, required Duration refillPeriod, required int tokensPerPeriod})\`
- Method: \`bool tryAcquire([int tokens = 1])\` which returns true if tokens are available, deducting them immediately, and false otherwise.
- Method: \`Future<void> acquire([int tokens = 1])\` which asynchronously delays until sufficient tokens have refilled.
- Ensure strict null safety and accurate fractional token computation based on elapsed time without running active background timer loops when idle."

### 2. REQUIRED EDGE CASES & INVARIANTS
1. Zero or negative token requests: \`tokens <= 0\` should throw an \`ArgumentError\`.
2. Request larger than bucket capacity: Requesting \`tokens > capacity\` in \`acquire\` can never be satisfied; must throw an \`ArgumentError\` rather than hanging forever.
3. Idle refill cap: When the limiter has been idle for hours, the available tokens must never exceed \`capacity\`.
4. High-frequency burst test: 100 concurrent \`tryAcquire\` calls in the same millisecond must not exceed capacity due to race conditions.

### 3. EXPLICIT EVALUATION RUBRIC (100 Points Total)
- Mathematical Accuracy (35 pts): Correct elapsed time calculation: \`elapsed.inMicroseconds * refillRate\`, clamped to \`capacity\`.
- Asynchronous Integrity (30 pts): \`acquire\` correctly calculates required wait duration and returns a Future without busy-waiting.
- Defensive Preconditions (20 pts): Throws meaningful \`ArgumentError\` for invalid capacity, non-positive periods, or requests exceeding capacity.
- Effective Dart & Idioms (15 pts): Descriptive parameter names, sound null safety, and clean public API documentation comments.`,
    learningObjectives: ['Simulate Outlier RLHF prompt engineering and rigorous technical rubric creation'],
    estimatedMinutes: 6,
    hints: [{ level: 1, title: 'Rubric specificity', content: 'Rubrics must assign explicit point weights and testable boundary conditions.' }],
    explanation: {
      coreReasoning: 'In AI model training, vague prompts lead to inconsistent evaluations. A professional rubric defines exact mathematical requirements, edge cases (overflow, burst, zero-tokens), and weighted scoring.',
      dartRule: 'High-quality Outlier RLHF rubrics require unambiguous acceptance criteria and concrete negative test cases.',
    },
    sourceDesignation: 'reported_outlier_pattern',
  },

  // Module 13: Advanced Dart 3 (Extension Types)
  {
    id: 'q_mod13_01',
    moduleId: 'MOD_13',
    moduleName: 'Advanced Dart Engineering & Dart 3',
    topic: 'Dart 3.3 Extension Types',
    subtopic: 'Zero-Cost Wrappers vs Wrapper Objects',
    difficulty: 'expert',
    taskType: 'knowledge',
    title: 'Dart 3.3 Extension Types vs Traditional Wrapper Classes',
    prompt: 'In Dart 3.3+, what is the principal runtime performance advantage of declaring an "extension type" (e.g. `extension type Id(int value) {}`) instead of a standard `class Id { final int value; const Id(this.value); }`?',
    options: [
      {
        id: 'opt_1',
        text: 'An extension type runs its methods in a background worker isolate automatically.',
        isCorrect: false,
      },
      {
        id: 'opt_2',
        text: 'An extension type is a static, compile-time-only view over an underlying representation. At runtime, there is ZERO wrapper object allocation overhead; the runtime object is just the underlying primitive value.',
        isCorrect: true,
      },
      {
        id: 'opt_3',
        text: 'An extension type enables multiple inheritance in Dart.',
        isCorrect: false,
      },
      {
        id: 'opt_4',
        text: 'Extension types allow modifying private fields of other libraries.',
        isCorrect: false,
      },
    ],
    learningObjectives: ['Understand zero-cost abstraction semantics of Dart 3.3 extension types'],
    estimatedMinutes: 3,
    hints: [{ level: 1, title: 'Runtime cost', content: 'Does the Dart VM allocate a new object on the heap when creating an extension type instance?' }],
    explanation: {
      coreReasoning: 'Dart 3.3 extension types provide a static, strongly typed wrapper interface around an underlying representation type without ANY runtime object allocation overhead. At compile time, type safety is strictly enforced. At runtime, the type is erased to its underlying representation (e.g. raw `int`), eliminating garbage collection pressure and memory indirection.',
      dartRule: 'Extension types are zero-cost compile-time abstractions over representation types.',
    },
    sourceDesignation: 'verified_official',
  },

  // Module 14: Algorithms
  {
    id: 'q_mod14_code1',
    moduleId: 'MOD_14',
    moduleName: 'Algorithms & Problem Solving in Dart',
    topic: 'Two-Pointer Techniques',
    subtopic: 'Two-Sum Sorted in O(N) Time and O(1) Space',
    difficulty: 'intermediate',
    taskType: 'coding_challenge',
    title: 'Implement Two Sum Sorted with Two-Pointer Technique',
    prompt: 'Given a 1-indexed sorted list of integers `numbers` and an integer `target`, return the two indices `[index1, index2]` such that `numbers[index1 - 1] + numbers[index2 - 1] == target`. You must use O(1) extra space and O(N) time using two pointers.',
    starterCode: `List<int> twoSumSorted(List<int> numbers, int target) {
  // Implement two-pointer solution
  return [];
}

void main() {
  print(twoSumSorted([2, 7, 11, 15], 9)); // Expected: [1, 2]
  print(twoSumSorted([2, 3, 4], 6));       // Expected: [1, 3]
}`,
    referenceSolution: `List<int> twoSumSorted(List<int> numbers, int target) {
  int left = 0;
  int right = numbers.length - 1;

  while (left < right) {
    final sum = numbers[left] + numbers[right];
    if (sum == target) {
      return [left + 1, right + 1]; // 1-indexed
    } else if (sum < target) {
      left++;
    } else {
      right--;
    }
  }

  return [];
}`,
    testCases: [
      {
        id: 'tc_ts_1',
        name: 'Target 9 with [2, 7, 11, 15]',
        expectedOutput: '[1, 2]',
        testCode: 'void main() { final r = twoSumSorted([2, 7, 11, 15], 9); assert(r.length == 2 && r[0] == 1 && r[1] == 2); print("PASS_1"); }',
      },
      {
        id: 'tc_ts_2',
        name: 'Target 6 with [2, 3, 4]',
        expectedOutput: '[1, 3]',
        testCode: 'void main() { final r = twoSumSorted([2, 3, 4], 6); assert(r.length == 2 && r[0] == 1 && r[1] == 3); print("PASS_2"); }',
      },
      {
        id: 'tc_ts_3',
        name: 'Negative numbers [-5, -2, 0, 3, 8]',
        expectedOutput: '[2, 5]',
        testCode: 'void main() { final r = twoSumSorted([-5, -2, 0, 3, 8], 6); assert(r.length == 2 && r[0] == 2 && r[1] == 5); print("PASS_3"); }',
      },
    ],
    learningObjectives: ['Apply two-pointer convergent search on sorted lists with O(N) time and O(1) space'],
    estimatedMinutes: 5,
    hints: [{ level: 1, title: 'Converging pointers', content: 'Place one pointer at index 0 and one at length - 1. If sum < target, advance left; if sum > target, decrement right.' }],
    explanation: {
      coreReasoning: 'Because the list is sorted, `numbers[left] + numbers[right]` gives directional feedback: if the sum is too small, only incrementing `left` can increase it; if too large, only decrementing `right` can decrease it.',
      dartRule: 'Two-pointer technique achieves optimal O(N) time and O(1) space on sorted arrays.',
    },
    sourceDesignation: 'verified_official',
  },

  // Project Simulation (Task Type H)
  {
    id: 'q_mod04_project1',
    moduleId: 'MOD_04',
    moduleName: 'Collections & Data Structures',
    topic: 'Project Simulation',
    subtopic: 'Typed JSON Model Transformation Layer',
    difficulty: 'expert',
    taskType: 'project_simulation',
    title: 'Project Simulation: Typed Collection Processing Engine',
    prompt: 'Implement a comprehensive `TransactionProcessor` class that processes financial records represented as untrusted JSON-like maps. It must:\n1. Filter transactions by minimum amount.\n2. Deduplicate transactions by unique `id`.\n3. Compute totals grouped by `category`.\n4. Handle null or missing amounts defensively by defaulting to 0.0.\n5. Guarantee immutability of returned summary maps.',
    starterCode: `class TransactionProcessor {
  final List<Map<String, dynamic>> rawRecords;

  TransactionProcessor(this.rawRecords);

  /// Deduplicates transactions by 'id' and filters out transactions below [minAmount]
  List<Map<String, dynamic>> filterAndDeduplicate(double minAmount) {
    // Implement
    return [];
  }

  /// Groups transactions by 'category' and calculates total amount for each category
  Map<String, double> computeCategoryTotals() {
    // Implement
    return {};
  }
}

void main() {
  final records = [
    {'id': 'tx_1', 'category': 'groceries', 'amount': 45.50},
    {'id': 'tx_2', 'category': 'utilities', 'amount': 120.00},
    {'id': 'tx_1', 'category': 'groceries', 'amount': 45.50}, // Duplicate
    {'id': 'tx_3', 'category': 'groceries', 'amount': 15.20},
  ];

  final proc = TransactionProcessor(records);
  print(proc.computeCategoryTotals()); // Expected: {groceries: 60.7, utilities: 120.0}
}`,
    referenceSolution: `class TransactionProcessor {
  final List<Map<String, dynamic>> rawRecords;

  TransactionProcessor(this.rawRecords);

  List<Map<String, dynamic>> filterAndDeduplicate(double minAmount) {
    final seenIds = <String>{};
    final result = <Map<String, dynamic>>[];

    for (final tx in rawRecords) {
      final id = tx['id']?.toString();
      if (id == null || seenIds.contains(id)) continue;

      final amount = _parseAmount(tx['amount']);
      if (amount >= minAmount) {
        seenIds.add(id);
        result.add(Map.unmodifiable(tx));
      }
    }

    return List.unmodifiable(result);
  }

  Map<String, double> computeCategoryTotals() {
    final totals = <String, double>{};
    final seenIds = <String>{};

    for (final tx in rawRecords) {
      final id = tx['id']?.toString();
      if (id != null) {
        if (seenIds.contains(id)) continue;
        seenIds.add(id);
      }

      final category = tx['category']?.toString() ?? 'uncategorized';
      final amount = _parseAmount(tx['amount']);
      totals[category] = (totals[category] ?? 0.0) + amount;
    }

    return Map.unmodifiable(totals);
  }

  double _parseAmount(dynamic raw) {
    if (raw is num) return raw.toDouble();
    if (raw is String) return double.tryParse(raw) ?? 0.0;
    return 0.0;
  }
}`,
    testCases: [
      {
        id: 'tc_proj_1',
        name: 'Computes category totals correctly with deduplication',
        expectedOutput: '{groceries: 60.7, utilities: 120.0}',
        testCode: `void main() {
  final records = [
    {'id': 'tx_1', 'category': 'groceries', 'amount': 45.50},
    {'id': 'tx_2', 'category': 'utilities', 'amount': 120.00},
    {'id': 'tx_1', 'category': 'groceries', 'amount': 45.50},
    {'id': 'tx_3', 'category': 'groceries', 'amount': 15.20},
  ];
  final proc = TransactionProcessor(records);
  final totals = proc.computeCategoryTotals();
  assert((totals['groceries']! - 60.7).abs() < 0.001);
  assert(totals['utilities'] == 120.00);
  print("PASS_1");
}`,
      },
      {
        id: 'tc_proj_2',
        name: 'filterAndDeduplicate filters below minimum amount',
        expectedOutput: '2',
        testCode: `void main() {
  final records = [
    {'id': '1', 'amount': 10.0},
    {'id': '2', 'amount': 50.0},
    {'id': '3', 'amount': 5.0},
  ];
  final proc = TransactionProcessor(records);
  final res = proc.filterAndDeduplicate(10.0);
  assert(res.length == 2);
  print("PASS_2");
}`,
      },
    ],
    learningObjectives: ['Architect multi-step business logic with defensive parsing, deduplication, and immutable return structures'],
    estimatedMinutes: 8,
    hints: [
      { level: 1, title: 'Use a Set for O(1) deduplication', content: 'Track seen IDs in a `final seenIds = <String>{};`' },
      { level: 2, title: 'Safe amount coercion', content: 'Handle both `int`, `double`, and numeric `String` inputs gracefully.' },
    ],
    explanation: {
      coreReasoning: 'Enterprise-grade Dart engineering demands defensive parsing on untrusted JSON, O(1) deduplication via Sets, and immutability via `Map.unmodifiable()` to prevent accidental state corruption.',
      dartRule: 'DO make returned collections unmodifiable when defensive encapsulation is required.',
    },
    rubricCriteria: [
      { name: 'Deduplication Efficiency', maxPoints: 30, description: 'Used Set for O(1) lookup rather than slow nested List iterations' },
      { name: 'Defensive Type Coercion', maxPoints: 30, description: 'Safely parsed amounts handling num, String, and null' },
      { name: 'Immutability & Encapsulation', maxPoints: 40, description: 'Returned unmodifiable views and preserved mathematical accuracy' },
    ],
    sourceDesignation: 'reported_outlier_pattern',
  },
];
