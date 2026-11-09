import { Question } from '../../types';

export const MODULE_03_06_QUESTIONS: Question[] = [
  // Module 03: Functions
  {
    id: 'q_mod03_01',
    moduleId: 'MOD_03',
    moduleName: 'Functions & Functional Dart',
    topic: 'Function Signatures',
    subtopic: 'Named vs Optional Positional Parameters',
    difficulty: 'beginner',
    taskType: 'knowledge',
    title: 'Positional vs Named Optional Parameters',
    prompt: 'In Dart, what syntax rule governs combining positional optional parameters `[T? arg]` and named optional parameters `{T? arg}` in the same function signature?',
    options: [
      {
        id: 'opt_1',
        text: 'A function can freely mix both, provided positional parameters are declared after named parameters.',
        isCorrect: false,
      },
      {
        id: 'opt_2',
        text: 'A function cannot have both optional positional parameters and named parameters at the same time; you must choose one or the other.',
        isCorrect: true,
      },
      {
        id: 'opt_3',
        text: 'Both are allowed as long as every parameter has an explicit default value.',
        isCorrect: false,
      },
      {
        id: 'opt_4',
        text: 'Named parameters can only be used in constructors, never in standalone functions.',
        isCorrect: false,
      },
    ],
    learningObjectives: ['Understand Dart function signature parameter grammar'],
    estimatedMinutes: 2,
    hints: [{ level: 1, title: 'Dart Grammar Rule', content: 'Check the Dart formal grammar for parameter lists.' }],
    explanation: {
      coreReasoning: 'Dart language specification explicitly forbids declaring both optional positional parameters [p] and named parameters {p} in the same parameter list. You can have required positional parameters followed by EITHER optional positional OR named parameters.',
      dartRule: 'In Dart parameter lists, [brackets] and {braces} are mutually exclusive.',
    },
    sourceDesignation: 'verified_official',
  },
  {
    id: 'q_mod03_code1',
    moduleId: 'MOD_03',
    moduleName: 'Functions & Functional Dart',
    topic: 'Higher-Order Functions',
    subtopic: 'Fold vs Reduce with Empty List Safety',
    difficulty: 'intermediate',
    taskType: 'coding_challenge',
    title: 'Implement Safe Sum with fold() to Prevent StateError',
    prompt: 'Implement a function `int safeSum(List<int> numbers)` that computes the sum of all elements in the list. The implementation must return 0 if the list is empty and MUST NOT throw a StateError.',
    starterCode: `int safeSum(List<int> numbers) {
  // Use fold or reduce safely
  return 0;
}

void main() {
  print(safeSum([1, 2, 3, 4, 5])); // Expected: 15
  print(safeSum([]));              // Expected: 0
}`,
    referenceSolution: `int safeSum(List<int> numbers) {
  // fold provides an explicit initial value (0), making it safe on empty collections
  return numbers.fold(0, (sum, element) => sum + element);
}`,
    testCases: [
      {
        id: 'tc_m3_1',
        name: 'Normal list sum',
        expectedOutput: '15',
        testCode: 'void main() { assert(safeSum([1, 2, 3, 4, 5]) == 15); print("PASS_1"); }',
      },
      {
        id: 'tc_m3_2',
        name: 'Empty list returns 0 without crashing',
        expectedOutput: '0',
        testCode: 'void main() { assert(safeSum([]) == 0); print("PASS_2"); }',
      },
      {
        id: 'tc_m3_3',
        name: 'Single element list',
        expectedOutput: '42',
        testCode: 'void main() { assert(safeSum([42]) == 42); print("PASS_3"); }',
      },
    ],
    learningObjectives: ['Understand why Iterable.reduce() throws on empty collections while Iterable.fold() is safe'],
    estimatedMinutes: 4,
    hints: [
      { level: 1, title: 'Reduce vs Fold', content: '`reduce` uses the first element as the initial accumulator. If the list is empty, it throws a StateError. `fold` takes an explicit initial value.' },
    ],
    explanation: {
      coreReasoning: 'Iterable.reduce((a, b) => a + b) throws `Bad state: No element` when called on an empty collection because there is no initial element. `fold(0, (a, b) => a + b)` is sound because it takes an explicit seed value.',
      dartRule: 'PREFER using fold over reduce when the collection might be empty.',
    },
    sourceDesignation: 'verified_official',
  },

  // Module 04: Collections
  {
    id: 'q_mod04_01',
    moduleId: 'MOD_04',
    moduleName: 'Collections & Data Structures',
    topic: 'Collection Operators',
    subtopic: 'Collection-if and Spread Operators',
    difficulty: 'intermediate',
    taskType: 'code_tracing',
    title: 'Tracing Collection-If and Null-Aware Spread',
    prompt: 'What is the output of the following Dart collection snippet?',
    starterCode: `void main() {
  final bool includeAdmin = false;
  final List<String>? extraRoles = null;
  
  final roles = [
    'user',
    if (includeAdmin) 'admin' else 'viewer',
    ...?extraRoles,
    for (var i = 1; i <= 2; i++) 'tier_\$i',
  ];
  
  print(roles.join(', '));
}`,
    options: [
      { id: 'opt_1', text: 'user, viewer, tier_1, tier_2', isCorrect: true },
      { id: 'opt_2', text: 'user, admin, viewer, tier_1, tier_2', isCorrect: false },
      { id: 'opt_3', text: 'Throws NoSuchMethodError because extraRoles is null', isCorrect: false },
      { id: 'opt_4', text: 'user, viewer, null, tier_1, tier_2', isCorrect: false },
    ],
    learningObjectives: ['Trace null-aware spread ...? and collection-if/for'],
    estimatedMinutes: 3,
    hints: [{ level: 1, title: 'Null-aware spread', content: '`...?` does nothing if the target collection is null.' }],
    explanation: {
      coreReasoning: '1. "user" is added.\n2. includeAdmin is false, so "viewer" is selected.\n3. extraRoles is null, but `...?extraRoles` safely evaluates to nothing.\n4. for-loop adds "tier_1" and "tier_2".\nResult: "user, viewer, tier_1, tier_2".',
      dartRule: 'The null-aware spread operator `...?` gracefully ignores null references.',
    },
    sourceDesignation: 'verified_official',
  },
  {
    id: 'q_mod04_code1',
    moduleId: 'MOD_04',
    moduleName: 'Collections & Data Structures',
    topic: 'Algorithms & Complexity',
    subtopic: 'Binary Search Implementation',
    difficulty: 'intermediate',
    taskType: 'coding_challenge',
    title: 'Implement Binary Search in Dart with O(log N) Time',
    prompt: 'Implement a function `int binarySearch(List<int> sortedList, int target)` that returns the 0-based index of `target` in `sortedList`, or `-1` if target does not exist. Your algorithm must achieve O(log N) time and O(1) auxiliary space.',
    starterCode: `int binarySearch(List<int> sortedList, int target) {
  // Implement binary search
  return -1;
}

void main() {
  final list = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];
  print(binarySearch(list, 23)); // Expected: 5
  print(binarySearch(list, 100)); // Expected: -1
}`,
    referenceSolution: `int binarySearch(List<int> sortedList, int target) {
  int low = 0;
  int high = sortedList.length - 1;

  while (low <= high) {
    // Avoid integer overflow
    final mid = low + ((high - low) >> 1);
    final val = sortedList[mid];

    if (val == target) {
      return mid;
    } else if (val < target) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return -1;
}`,
    testCases: [
      {
        id: 'tc_bs_1',
        name: 'Target found in middle',
        expectedOutput: '5',
        testCode: 'void main() { assert(binarySearch([2, 5, 8, 12, 16, 23, 38, 56, 72, 91], 23) == 5); print("PASS_1"); }',
      },
      {
        id: 'tc_bs_2',
        name: 'Target not found',
        expectedOutput: '-1',
        testCode: 'void main() { assert(binarySearch([1, 3, 5, 7], 4) == -1); print("PASS_2"); }',
      },
      {
        id: 'tc_bs_3',
        name: 'First element',
        expectedOutput: '0',
        testCode: 'void main() { assert(binarySearch([10, 20, 30], 10) == 0); print("PASS_3"); }',
      },
      {
        id: 'tc_bs_4',
        name: 'Last element',
        expectedOutput: '2',
        testCode: 'void main() { assert(binarySearch([10, 20, 30], 30) == 2); print("PASS_4"); }',
      },
    ],
    learningObjectives: ['Implement binary search with optimal two-pointer window narrowing'],
    estimatedMinutes: 5,
    hints: [{ level: 1, title: 'Pointers', content: 'Use low = 0 and high = list.length - 1. In each step, calculate mid and compare.' }],
    explanation: {
      coreReasoning: 'Binary search halves the search space each step: O(log N) time and O(1) space. Using `low + ((high - low) >> 1)` prevents integer overflow.',
      dartRule: 'Binary search requires the input list to be strictly sorted.',
    },
    sourceDesignation: 'original_mastery_challenge',
  },

  // Module 05: OOP
  {
    id: 'q_mod05_01',
    moduleId: 'MOD_05',
    moduleName: 'Object-Oriented Programming',
    topic: 'Constructors',
    subtopic: 'Factory vs Generative Constructors',
    difficulty: 'intermediate',
    taskType: 'knowledge',
    title: 'Capabilities of Factory Constructors',
    prompt: 'What can a "factory" constructor do in Dart that a standard generative constructor CANNOT?',
    options: [
      {
        id: 'opt_1',
        text: 'A factory constructor can execute an initializer list before the superclass constructor.',
        isCorrect: false,
      },
      {
        id: 'opt_2',
        text: 'A factory constructor does not necessarily create a new instance; it can return an existing cached instance or an instance of a subtype.',
        isCorrect: true,
      },
      {
        id: 'opt_3',
        text: 'A factory constructor automatically makes all fields in the class immutable.',
        isCorrect: false,
      },
      {
        id: 'opt_4',
        text: 'A factory constructor can access instance members using the "this" keyword prior to initialization.',
        isCorrect: false,
      },
    ],
    learningObjectives: ['Understand the factory pattern built into Dart constructors'],
    estimatedMinutes: 2,
    hints: [{ level: 1, title: 'Return value', content: 'Generative constructors always return a fresh instance of the exact class. Does a factory have to?' }],
    explanation: {
      coreReasoning: 'A factory constructor in Dart has the power to return an existing instance (e.g., singleton/cache) or return an instance of a subtype. Generative constructors always instantiate a brand new object of the enclosing class.',
      dartRule: 'Use "factory" when you need to return cached instances, return subtypes, or prepare arguments before instantiating.',
    },
    sourceDesignation: 'verified_official',
  },
  {
    id: 'q_mod05_02',
    moduleId: 'MOD_05',
    moduleName: 'Object-Oriented Programming',
    topic: 'Class Modifiers',
    subtopic: 'Sealed Class Exhaustiveness in Dart 3',
    difficulty: 'advanced',
    taskType: 'knowledge',
    title: 'Dart 3 Sealed Classes and Exhaustive Switching',
    prompt: 'When a class hierarchy is marked with the Dart 3 "sealed" modifier, what guarantee does the compiler enforce across switch statements and expressions?',
    options: [
      {
        id: 'opt_1',
        text: 'The classes cannot be instantiated outside the same file, but switch statements still require a default clause.',
        isCorrect: false,
      },
      {
        id: 'opt_2',
        text: 'Because all direct subtypes must be defined in the same library/file, the compiler knows the complete universe of subtypes and enforces compile-time exhaustiveness without needing a fallback default case.',
        isCorrect: true,
      },
      {
        id: 'opt_3',
        text: 'All fields in sealed classes are automatically converted to private getters.',
        isCorrect: false,
      },
      {
        id: 'opt_4',
        text: 'Sealed classes cannot have methods or constructors.',
        isCorrect: false,
      },
    ],
    learningObjectives: ['Understand Dart 3 sealed class modifiers and compiler exhaustiveness checks'],
    estimatedMinutes: 3,
    hints: [{ level: 1, title: 'Library boundary', content: 'Where must subtypes of a sealed class be declared?' }],
    explanation: {
      coreReasoning: 'In Dart 3, `sealed` classes cannot be extended, implemented, or mixed in outside of their defining library. This closed hierarchy allows the Dart static analyzer to perform exhaustiveness checking: a switch expression that covers all subtypes is guaranteed exhaustive, alerting you at compile-time if a new subtype is added.',
      dartRule: 'Dart 3 class modifier: sealed enables pattern matching and exhaustiveness checking without a default case.',
    },
    sourceDesignation: 'verified_official',
  },

  // Module 06: Generics & Records
  {
    id: 'q_mod06_01',
    moduleId: 'MOD_06',
    moduleName: 'Generics, Records & Pattern Matching',
    topic: 'Dart 3 Records',
    subtopic: 'Record Syntax and Destructuring',
    difficulty: 'intermediate',
    taskType: 'code_tracing',
    title: 'Dart 3 Record Destructuring & Positional Fields',
    prompt: 'What does the following Dart 3 code output?',
    starterCode: `void main() {
  // Record with positional and named fields
  final record = ('Dart', version: 3, isSound: true);
  
  // Access positional field $1 and named fields
  final name = record.\$1;
  final ver = record.version;
  
  // Pattern matching destructuring
  final (title, version: v, isSound: s) = record;
  
  print('\$name v\$ver: title=\$title, sound=\$s');
}`,
    options: [
      { id: 'opt_1', text: 'Dart v3: title=Dart, sound=true', isCorrect: true },
      { id: 'opt_2', text: 'null v3: title=Dart, sound=true', isCorrect: false },
      { id: 'opt_3', text: 'Throws NoSuchMethodError on $1', isCorrect: false },
      { id: 'opt_4', text: 'Dart v3: title=$1, sound=true', isCorrect: false },
    ],
    learningObjectives: ['Understand Dart 3 record syntax, $1 positional access, and pattern destructuring'],
    estimatedMinutes: 3,
    hints: [{ level: 1, title: 'Positional index', content: 'In Dart 3 records, positional fields start at $1, not $0.' }],
    explanation: {
      coreReasoning: 'Dart 3 records use `$1`, `$2`, etc., for positional fields (1-indexed). Destructuring patterns allow extracting both positional fields (`title`) and named fields (`version: v, isSound: s`) concisely.',
      dartRule: 'Record positional getters start at $1. Record equality is structural (two records with identical values and types are ==).',
    },
    sourceDesignation: 'verified_official',
  },
  {
    id: 'q_mod06_code1',
    moduleId: 'MOD_06',
    moduleName: 'Generics, Records & Pattern Matching',
    topic: 'Pattern Matching',
    subtopic: 'Switch Expressions with Object Patterns',
    difficulty: 'advanced',
    taskType: 'coding_challenge',
    title: 'Implement JSON Status Parser with Dart 3 Pattern Matching',
    prompt: 'Implement a function `String describeResponse(Map<String, dynamic> response)` that uses a Dart 3 switch expression to pattern match on the structure of `response`:\n- If it has keys `status: "success"` and a list `data`, return "Success with {data.length} items"\n- If it has key `status: "error"` and a string `message`, return "Error: {message}"\n- Otherwise, return "Unknown response format"',
    starterCode: `String describeResponse(Map<String, dynamic> response) {
  // Use a Dart 3 switch expression with pattern matching
  return '';
}

void main() {
  print(describeResponse({'status': 'success', 'data': [1, 2, 3]})); // Success with 3 items
  print(describeResponse({'status': 'error', 'message': 'Timeout'})); // Error: Timeout
  print(describeResponse({'invalid': true})); // Unknown response format
}`,
    referenceSolution: `String describeResponse(Map<String, dynamic> response) {
  return switch (response) {
    {'status': 'success', 'data': List items} => 'Success with \${items.length} items',
    {'status': 'error', 'message': String msg} => 'Error: \$msg',
    _ => 'Unknown response format',
  };
}`,
    testCases: [
      {
        id: 'tc_resp_1',
        name: 'Success with 3 items',
        expectedOutput: 'Success with 3 items',
        testCode: 'void main() { assert(describeResponse({"status": "success", "data": [1, 2, 3]}) == "Success with 3 items"); print("PASS_1"); }',
      },
      {
        id: 'tc_resp_2',
        name: 'Error message',
        expectedOutput: 'Error: Unauthorized',
        testCode: 'void main() { assert(describeResponse({"status": "error", "message": "Unauthorized"}) == "Error: Unauthorized"); print("PASS_2"); }',
      },
      {
        id: 'tc_resp_3',
        name: 'Unknown response',
        expectedOutput: 'Unknown response format',
        testCode: 'void main() { assert(describeResponse({"code": 500}) == "Unknown response format"); print("PASS_3"); }',
      },
    ],
    learningObjectives: ['Pattern match on Map structures and sub-types using Dart 3 switch expressions'],
    estimatedMinutes: 5,
    hints: [{ level: 1, title: 'Map patterns', content: '`{"status": "success", "data": List items} => ...`' }],
    explanation: {
      coreReasoning: 'Dart 3 map patterns allow checking for key presence, matching specific constant values ("success"), and binding matched values (`List items`) simultaneously in a single concise line.',
      dartRule: 'Map patterns match if the map contains the specified keys and their values match the corresponding subpatterns.',
    },
    sourceDesignation: 'verified_official',
  },
];
