import { Question } from '../../types';

export const MODULE_01_QUESTIONS: Question[] = [
  {
    id: 'q_mod01_01',
    moduleId: 'MOD_01',
    moduleName: 'Dart Foundations',
    topic: 'Variables & Declarations',
    subtopic: 'var vs final vs const',
    difficulty: 'beginner',
    taskType: 'knowledge',
    title: 'Compile-Time Constant vs Immutable Final Reference',
    prompt: 'Which statement accurately describes the distinction between "final" and "const" in modern Dart?',
    options: [
      {
        id: 'opt_1',
        text: '"final" and "const" are interchangeable aliases for declaring immutable references.',
        isCorrect: false,
      },
      {
        id: 'opt_2',
        text: 'A "final" variable can only be assigned once and is initialized at runtime; a "const" variable represents a compile-time constant whose memory is canonicalized.',
        isCorrect: true,
      },
      {
        id: 'opt_3',
        text: '"const" variables can reference runtime values as long as their fields are non-null.',
        isCorrect: false,
      },
      {
        id: 'opt_4',
        text: '"final" allocates memory on the stack whereas "const" always creates a heap reference.',
        isCorrect: false,
      },
    ],
    learningObjectives: [
      'Understand compile-time canonicalization in Dart const expressions',
      'Distinguish single-assignment runtime evaluation from compile-time freeze',
    ],
    estimatedMinutes: 2,
    hints: [
      {
        level: 1,
        title: 'Timing of Evaluation',
        content: 'Consider when the value must be known: during compilation or during application execution.',
      },
      {
        level: 2,
        title: 'Canonicalization',
        content: 'Dart reuses memory for identical const objects. Can DateTime.now() be declared with const?',
      },
    ],
    explanation: {
      coreReasoning: 'A final variable can be set only once, but its value is computed at runtime (e.g., final time = DateTime.now()). A const variable is a compile-time constant: its value must be fully determinable before program execution. Furthermore, identical const instances are canonicalized into a single shared memory location.',
      whyOthersFail: 'Option 1 is false because const is strictly stronger than final. Option 3 is false because const expressions cannot evaluate arbitrary runtime values. Option 4 is an inaccurate low-level hardware claim that does not represent Dart VM object semantics.',
      dartRule: 'Every const variable is implicitly final, but not every final variable is const.',
      correctedExample: 'final runtimeNow = DateTime.now(); // OK\nconst compileTimePi = 3.14159;    // OK\n// const invalid = DateTime.now(); // Compile Error!',
    },
    commonMisconceptions: [
      'Thinking that modifying elements of a final List is prohibited (final only prevents reassigning the variable reference; the underlying list remains mutable unless unmodifiable or const).',
    ],
    sourceDesignation: 'verified_official',
  },
  {
    id: 'q_mod01_trace1',
    moduleId: 'MOD_01',
    moduleName: 'Dart Foundations',
    topic: 'Variables & Declarations',
    subtopic: 'late variable initialization',
    difficulty: 'intermediate',
    taskType: 'code_tracing',
    title: 'Late Variable Initialization Tracing',
    prompt: 'Analyze the following Dart program. In what exact order will the print statements execute, and what will the console output be?',
    starterCode: `void main() {
  print('Step 1: Start');
  late String expensiveData = calculateData();
  print('Step 2: Before access');
  print('Step 3: Value = \$expensiveData');
  print('Step 4: Done');
}

String calculateData() {
  print('--> calculateData executed');
  return 'DART_3_ACTIVE';
}`,
    options: [
      {
        id: 'opt_1',
        text: "Step 1: Start\n--> calculateData executed\nStep 2: Before access\nStep 3: Value = DART_3_ACTIVE\nStep 4: Done",
        isCorrect: false,
      },
      {
        id: 'opt_2',
        text: "Step 1: Start\nStep 2: Before access\n--> calculateData executed\nStep 3: Value = DART_3_ACTIVE\nStep 4: Done",
        isCorrect: true,
      },
      {
        id: 'opt_3',
        text: "--> calculateData executed\nStep 1: Start\nStep 2: Before access\nStep 3: Value = DART_3_ACTIVE\nStep 4: Done",
        isCorrect: false,
      },
      {
        id: 'opt_4',
        text: "Throws LateInitializationError at runtime.",
        isCorrect: false,
      },
    ],
    learningObjectives: [
      'Understand lazy evaluation semantics of late initializers in Dart',
      'Trace execution order across deferred function invocations',
    ],
    estimatedMinutes: 3,
    hints: [
      {
        level: 1,
        title: 'Lazy Evaluation',
        content: 'When an initialized variable is marked "late", its initializer expression does not run at the point of declaration.',
      },
      {
        level: 2,
        title: 'Point of First Read',
        content: 'Watch where $expensiveData is first read in the code.',
      },
    ],
    explanation: {
      coreReasoning: 'In Dart, when a variable with an initializer expression is marked "late", the initializer expression is lazily evaluated the first time the variable is read. Therefore, calculateData() is NOT called on line 3; it is only called on line 5 when evaluating $expensiveData inside the print call.',
      dartRule: 'late with an initializer defers calculation until the first read, avoiding costly work if the variable is never accessed.',
      deepDive: 'If calculateData was never accessed, calculateData() would never run at all during program execution.',
    },
    sourceDesignation: 'verified_official',
  },
  {
    id: 'q_mod01_code1',
    moduleId: 'MOD_01',
    moduleName: 'Dart Foundations',
    topic: 'Control Flow & Logic',
    subtopic: 'Loops & Accumulation',
    difficulty: 'beginner',
    taskType: 'coding_challenge',
    title: 'Implement FizzBuzz with Dart 3 Pattern Matching',
    prompt: 'Implement a function `String fizzBuzz(int n)` that returns:\n- "FizzBuzz" if n is divisible by both 3 and 5\n- "Fizz" if n is divisible by 3\n- "Buzz" if n is divisible by 5\n- The string representation of n otherwise.\n\nEnsure strict typing and clean control flow.',
    starterCode: `String fizzBuzz(int n) {
  // Your code here
  return '';
}

void main() {
  print(fizzBuzz(15)); // Expected: FizzBuzz
  print(fizzBuzz(9));  // Expected: Fizz
  print(fizzBuzz(10)); // Expected: Buzz
  print(fizzBuzz(7));  // Expected: 7
}`,
    referenceSolution: `String fizzBuzz(int n) {
  return switch ((n % 3 == 0, n % 5 == 0)) {
    (true, true) => 'FizzBuzz',
    (true, false) => 'Fizz',
    (false, true) => 'Buzz',
    _ => '\$n',
  };
}`,
    testCases: [
      {
        id: 'tc1',
        name: 'Divisible by 15 returns FizzBuzz',
        expectedOutput: 'FizzBuzz',
        testCode: 'void main() { assert(fizzBuzz(15) == "FizzBuzz"); print("PASS_1"); }',
      },
      {
        id: 'tc2',
        name: 'Divisible by 3 returns Fizz',
        expectedOutput: 'Fizz',
        testCode: 'void main() { assert(fizzBuzz(9) == "Fizz"); print("PASS_2"); }',
      },
      {
        id: 'tc3',
        name: 'Divisible by 5 returns Buzz',
        expectedOutput: 'Buzz',
        testCode: 'void main() { assert(fizzBuzz(25) == "Buzz"); print("PASS_3"); }',
      },
      {
        id: 'tc4',
        name: 'Prime number returns string of number',
        expectedOutput: '7',
        testCode: 'void main() { assert(fizzBuzz(7) == "7"); print("PASS_4"); }',
      },
    ],
    learningObjectives: [
      'Write clean conditional branch logic in Dart',
      'Optionally leverage Dart 3 record pattern matching in switch expressions',
    ],
    estimatedMinutes: 4,
    hints: [
      {
        level: 1,
        title: 'Check common denominator first',
        content: 'Check for divisibility by 15 (or both 3 and 5) before checking 3 or 5 independently, unless using pattern matching.',
      },
      {
        level: 2,
        title: 'Modern Switch Expression',
        content: 'You can pattern match on a record: switch ((n % 3 == 0, n % 5 == 0)) { (true, true) => "FizzBuzz", ... }',
      },
    ],
    explanation: {
      coreReasoning: 'Standard conditional logic or Dart 3 pattern matching can express this cleanly. Checking both conditions first prevents premature early returns on partial matches.',
      dartRule: 'Dart 3 allows switch expressions matching on records: (n % 3 == 0, n % 5 == 0) with exhaustive cases.',
    },
    sourceDesignation: 'original_mastery_challenge',
  },
  {
    id: 'q_mod01_debug1',
    moduleId: 'MOD_01',
    moduleName: 'Dart Foundations',
    topic: 'Control Flow',
    subtopic: 'Closure Capture in Loops',
    difficulty: 'intermediate',
    taskType: 'debugging',
    title: 'Debug Loop Variable Capture in Closures',
    prompt: 'The following function attempts to generate a list of 5 multiplier callbacks, where each callback should multiply its argument by its index (0, 1, 2, 3, 4). However, the developer wrote code that fails or produces unexpected behavior. Identify and fix the bug.',
    brokenCode: `List<int Function(int)> makeMultipliers() {
  final callbacks = <int Function(int)>[];
  var i = 0;
  for (; i < 5; i++) {
    // Problem: What happens if i is captured across iterations?
    callbacks.add((int x) => x * i);
  }
  return callbacks;
}

void main() {
  final multipliers = makeMultipliers();
  // We expect multipliers[2](10) to equal 20 (10 * 2)
  print('Result for index 2: \${multipliers[2](10)}');
}`,
    referenceSolution: `List<int Function(int)> makeMultipliers() {
  final callbacks = <int Function(int)>[];
  for (var i = 0; i < 5; i++) {
    // In Dart, a var declared in a for-loop header creates a fresh binding per iteration!
    callbacks.add((int x) => x * i);
  }
  return callbacks;
}

void main() {
  final multipliers = makeMultipliers();
  print('Result for index 2: \${multipliers[2](10)}');
}`,
    testCases: [
      {
        id: 'tc_debug1',
        name: 'Index 2 multiplies by 2',
        expectedOutput: '20',
        testCode: 'void main() { final m = makeMultipliers(); assert(m[2](10) == 20); print("PASS"); }',
      },
      {
        id: 'tc_debug2',
        name: 'Index 4 multiplies by 4',
        expectedOutput: '40',
        testCode: 'void main() { final m = makeMultipliers(); assert(m[4](10) == 40); print("PASS"); }',
      },
    ],
    learningObjectives: [
      'Understand lexical scope and variable binding lifecycle in Dart loops',
      'Distinguish outer-scoped variables from per-iteration loop header bindings',
    ],
    estimatedMinutes: 5,
    hints: [
      {
        level: 1,
        title: 'Where is "i" declared?',
        content: 'Notice where "var i = 0" is declared: outside the for-loop header. All closures capture the exact same variable reference.',
      },
      {
        level: 2,
        title: 'Fix with Loop-Header Binding',
        content: 'Moving "var i = 0" directly into the for-loop header "for (var i = 0; i < 5; i++)" guarantees a distinct binding per iteration in Dart.',
      },
    ],
    explanation: {
      coreReasoning: 'When `var i = 0` is declared outside the loop, a single mutable memory cell for `i` is captured by all five closures. By the time any callback executes, `i` has reached 5, so all callbacks multiply by 5. In Dart, declaring `for (var i = 0; ...)` inside the loop header creates a brand new variable binding for each loop iteration, ensuring each closure captures its respective index.',
      dartRule: 'In Dart (since Dart 1.x), for-loop declarations create a fresh lexical binding per iteration, safely supporting closure captures.',
    },
    sourceDesignation: 'reported_outlier_pattern',
  },
];

export const MODULE_02_QUESTIONS: Question[] = [
  {
    id: 'q_mod02_01',
    moduleId: 'MOD_02',
    moduleName: 'Type System & Null Safety',
    topic: 'Sound Null Safety',
    subtopic: 'Flow Analysis & Type Promotion',
    difficulty: 'intermediate',
    taskType: 'knowledge',
    title: 'Why Can Local Variables Promote While Public Fields Cannot?',
    prompt: 'In Dart sound null safety, why can a local nullable variable `String? name` be promoted to non-nullable `String` after an `if (name != null)` check, while a public instance field `this.name` cannot be promoted without a local shadow variable?',
    options: [
      {
        id: 'opt_1',
        text: 'The Dart compiler has a legacy bug with class fields that was retained for backwards compatibility.',
        isCorrect: false,
      },
      {
        id: 'opt_2',
        text: 'Because an instance getter could be overridden in a subclass, or mutated concurrently between the null-check and access, so the compiler cannot guarantee soundness across invocations.',
        isCorrect: true,
      },
      {
        id: 'opt_3',
        text: 'Because class fields in Dart are always allocated on native memory outside the Dart VM heap.',
        isCorrect: false,
      },
      {
        id: 'opt_4',
        text: 'Local variables are stored as 64-bit pointers while class fields are 32-bit values.',
        isCorrect: false,
      },
    ],
    learningObjectives: [
      'Understand sound flow analysis in Dart null safety',
      'Recognize why instance fields resist promotion due to potential getter side effects or mutation',
    ],
    estimatedMinutes: 3,
    hints: [
      {
        level: 1,
        title: 'Overriding and Side Effects',
        content: 'What happens if a field is actually a getter that returns a random or alternating value?',
      },
    ],
    explanation: {
      coreReasoning: 'In Dart, an instance field can be overridden by a getter in a subclass that returns different values on consecutive invocations (or could be mutated by another method). Because flow analysis happens at compile-time, the compiler cannot guarantee that the second read of an instance property will return the same non-null reference that was verified in the check. Local variables cannot be mutated from outside the local scope, allowing 100% sound promotion.',
      whyOthersFail: 'Option 1 is incorrect; this is a deliberate design requirement of sound null safety. Options 3 and 4 are nonsensical memory claims.',
      dartRule: 'To promote an instance field, assign it to a local final variable first: `final name = this.name; if (name != null) { /* name is non-nullable String here */ }` or use private final fields (supported in Dart 3.2+).',
    },
    commonMisconceptions: [
      'Believing that placing "!" after field access is the only idiomatic solution (shadowing into a local `final x = this.x;` is vastly superior and avoids unsafe runtime assertions).',
    ],
    sourceDesignation: 'verified_official',
  },
  {
    id: 'q_mod02_trace1',
    moduleId: 'MOD_02',
    moduleName: 'Type System & Null Safety',
    topic: 'Null-Aware Operators',
    subtopic: 'Null-coalescing assignment ??=',
    difficulty: 'intermediate',
    taskType: 'code_tracing',
    title: 'Tracing Null-Aware Assignment and Safe Calls',
    prompt: 'Predict the console output of the following Dart program precisely:',
    starterCode: `void main() {
  int? a;
  int? b = 10;
  
  a ??= 5;
  b ??= 20;
  
  int c = (a ?? 0) + (b ?? 0);
  
  String? text;
  int length = text?.length ?? -1;
  
  print('\$a, \$b, \$c, \$length');
}`,
    options: [
      {
        id: 'opt_1',
        text: '5, 20, 25, 0',
        isCorrect: false,
      },
      {
        id: 'opt_2',
        text: '5, 10, 15, -1',
        isCorrect: true,
      },
      {
        id: 'opt_3',
        text: 'null, 10, 10, null',
        isCorrect: false,
      },
      {
        id: 'opt_4',
        text: '5, 10, 15, 0',
        isCorrect: false,
      },
    ],
    learningObjectives: [
      'Trace null-coalescing assignment (??=) behavior',
      'Trace safe property navigation (?.) combined with fallback (??)',
    ],
    estimatedMinutes: 3,
    hints: [
      {
        level: 1,
        title: '??= assignment rule',
        content: '`target ??= value` only assigns if `target` is currently null.',
      },
      {
        level: 2,
        title: 'safe call with null text',
        content: 'When `text` is null, `text?.length` evaluates to null, triggering the `?? -1` fallback.',
      },
    ],
    explanation: {
      coreReasoning: '1. `a` starts null, so `a ??= 5` assigns 5 to `a`.\n2. `b` starts with 10 (not null), so `b ??= 20` does nothing; `b` remains 10.\n3. `c` evaluates `5 + 10 = 15`.\n4. `text` is null, so `text?.length` produces null; `null ?? -1` evaluates to -1.\nOutput: "5, 10, 15, -1".',
      dartRule: '??= only assigns if the left-hand operand is null. It evaluates the right-hand operand lazily.',
    },
    sourceDesignation: 'verified_official',
  },
  {
    id: 'q_mod02_review1',
    moduleId: 'MOD_02',
    moduleName: 'Type System & Null Safety',
    topic: 'Sound Null Safety',
    subtopic: 'Reviewing Model Null-Safety Implementations',
    difficulty: 'advanced',
    taskType: 'code_review',
    title: 'Code Review: Unsafe Null Assertions in JSON Deserializer',
    prompt: 'Review the following Dart class written by an AI coding assistant. Evaluate it for sound null safety, runtime safety, and Effective Dart principles. Identify the critical flaw and write a professional review critique.',
    starterCode: `class UserProfile {
  final String id;
  final String name;
  final String email;
  final int age;

  UserProfile({
    required this.id,
    required this.name,
    required this.email,
    required this.age,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    // Model generated this deserializer:
    return UserProfile(
      id: json['id'] as String,
      name: json['name']! as String,
      email: json['email'] as String,
      age: int.parse(json['age']!.toString()),
    );
  }
}`,
    referenceSolution: `CRITICAL ISSUES IDENTIFIED:
1. Unsound Null Assertions (!): The use of \`json['name']!\` and \`json['age']!\` will throw a runtime TypeError / NullCheckError whenever external JSON omits these keys or passes null.
2. Unsafe Direct Casts: \`json['id'] as String\` will crash with a TypeError if the API returns an integer or null instead of a String.
3. Brittle Parsing: \`int.parse(json['age']!.toString())\` fails if age is missing, null, or a formatted float.

RECOMMENDED CORRECTION:
Validate keys gracefully or provide typed fallbacks:
\`\`\`dart
factory UserProfile.fromJson(Map<String, dynamic> json) {
  final rawId = json['id'];
  final rawName = json['name'];
  final rawEmail = json['email'];
  final rawAge = json['age'];

  if (rawId is! String || rawName is! String || rawEmail is! String) {
    throw FormatException('Malformed UserProfile JSON payload: missing required string fields');
  }

  final parsedAge = switch (rawAge) {
    int val => val,
    String val => int.tryParse(val) ?? 0,
    _ => 0,
  };

  return UserProfile(
    id: rawId,
    name: rawName,
    email: rawEmail,
    age: parsedAge,
  );
}
\`\`\``,
    learningObjectives: [
      'Detect dangerous "!" null assertions on untrusted external JSON data',
      'Articulate concrete failure scenarios (NullCheckError) in code review rubrics',
    ],
    estimatedMinutes: 5,
    hints: [
      {
        level: 1,
        title: 'Untrusted Data Boundary',
        content: 'JSON coming from an external network or file cannot be guaranteed to contain non-null values.',
      },
      {
        level: 2,
        title: 'Exclamation Mark Operator',
        content: 'Look closely at lines 15 and 17 where the "!" operator is used.',
      },
    ],
    explanation: {
      coreReasoning: 'In Outlier code evaluation tasks, using null assertion operator (!) on untrusted network data is considered a severe anti-pattern. Untrusted JSON must be defensively checked via `is String` or null-safe fallbacks rather than asserting with `!`.',
      dartRule: 'Effective Dart & Sound Null Safety: Avoid null assertion (!) on data from external sources.',
    },
    rubricCriteria: [
      { name: 'Identified Null Assertion Risk', maxPoints: 40, description: 'Clearly called out json["name"]! and json["age"]! as runtime crash risks.' },
      { name: 'Identified Untrusted Cast Vulnerability', maxPoints: 30, description: 'Explained why direct "as String" casts are unsafe for external inputs.' },
      { name: 'Constructive Remediation', maxPoints: 30, description: 'Provided robust type-checked solution using "is String" or switch pattern.' },
    ],
    sourceDesignation: 'reported_outlier_pattern',
  },
  {
    id: 'q_mod02_compare1',
    moduleId: 'MOD_02',
    moduleName: 'Type System & Null Safety',
    topic: 'Type Systems',
    subtopic: 'Model A vs Model B Null Safety',
    difficulty: 'advanced',
    taskType: 'ai_comparison',
    title: 'Model Comparison: Safe Cache Lookup Implementation',
    prompt: 'You are an Outlier AI Evaluator reviewing two candidate model implementations for a thread-safe cache retriever: `String getOrCompute(String key, String Function() compute)`. Determine which model is superior, explain why, identify any errors or subtle flaws, and score both.',
    modelA: {
      author: 'Model A',
      code: `class StringCache {
  final Map<String, String> _cache = {};

  String getOrCompute(String key, String Function() compute) {
    if (_cache.containsKey(key)) {
      return _cache[key]!; // Uses null assertion
    }
    final value = compute();
    _cache[key] = value;
    return value;
  }
}`,
      flaws: ['Uses redundant lookup: containsKey followed by _cache[key] (2 hash lookups)', 'Uses unsafe ! operator which could theoretically fail if null values were allowed', 'Not idiomatic Dart collection code'],
    },
    modelB: {
      author: 'Model B',
      code: `class StringCache {
  final Map<String, String> _cache = {};

  String getOrCompute(String key, String Function() compute) {
    return _cache.putIfAbsent(key, compute);
  }
}`,
      flaws: ['None; putIfAbsent is the canonical, single-lookup idiomatic Dart API'],
    },
    referenceSolution: `VERDICT: Model B is distinctly superior.

JUSTIFICATION:
1. Idiomatic Dart API: Model B utilizes \`Map.putIfAbsent\`, which is the built-in, standard Dart method specifically designed for this pattern.
2. Performance & Hash Lookups:
   - Model A performs up to three hash table operations in the cache miss path: \`containsKey\`, \`[key] = value\`, and in a hit path it performs \`containsKey\` followed by \`[key]\` (double lookup).
   - Model B performs a single hash lookup and only invokes the \`compute\` callback if the key is absent.
3. Null Safety & Cleanliness:
   - Model A resorts to the null assertion operator \`!\` on \`_cache[key]!\` to satisfy the non-nullable return type, which is unnecessary and poor style.
   - Model B is 100% soundly typed with zero casts or assertions.`,
    learningObjectives: [
      'Compare performance of multiple hash lookups vs putIfAbsent',
      'Write structured Outlier-grade justification contrasting idiomatic APIs against verbose manual patterns',
    ],
    estimatedMinutes: 5,
    hints: [
      {
        level: 1,
        title: 'Check Map API in Dart Core',
        content: 'Does Map provide a single atomic method for getting an entry or computing it if absent?',
      },
    ],
    explanation: {
      coreReasoning: 'Model B is far superior. `putIfAbsent` computes the value only if absent and performs the operation efficiently in a single lookup. Model A does redundant lookups and requires an unidiomatic `!` operator.',
      dartRule: 'Effective Dart: PREFER using Map.putIfAbsent() when caching or populating values.',
    },
    sourceDesignation: 'reported_outlier_pattern',
  },
];
