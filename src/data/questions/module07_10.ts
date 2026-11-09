import { Question } from '../../types';

export const MODULE_07_10_QUESTIONS: Question[] = [
  // Module 07: Error Handling
  {
    id: 'q_mod07_01',
    moduleId: 'MOD_07',
    moduleName: 'Error Handling & Exceptions',
    topic: 'Exception Architecture',
    subtopic: 'Exception vs Error in Dart Core',
    difficulty: 'intermediate',
    taskType: 'knowledge',
    title: 'Architectural Difference Between Exception and Error in Dart',
    prompt: 'What is the fundamental architectural distinction between classes implementing `Exception` versus subclasses of `Error` in Dart standard libraries?',
    options: [
      {
        id: 'opt_1',
        text: '`Exception` is thrown by third-party packages, while `Error` is reserved exclusively for the Dart VM kernel.',
        isCorrect: false,
      },
      {
        id: 'opt_2',
        text: 'An `Exception` represents an expected, recoverable failure condition (e.g., FormatException, SocketException); an `Error` represents a programming bug or violated precondition (e.g., RangeError, ArgumentError, StateError) that should generally NOT be caught and recovered from.',
        isCorrect: true,
      },
      {
        id: 'opt_3',
        text: 'An `Error` stops all isolates in the operating system process, whereas an `Exception` only pauses the current isolate.',
        isCorrect: false,
      },
      {
        id: 'opt_4',
        text: 'Catching an `Exception` requires an `on` clause, whereas an `Error` can only be caught with a bare `catch`.',
        isCorrect: false,
      },
    ],
    learningObjectives: ['Differentiate between recoverable runtime conditions and programmer bug assertions'],
    estimatedMinutes: 3,
    hints: [{ level: 1, title: 'Dart Core Design Guide', content: 'Read the API docs for dart:core Error vs Exception.' }],
    explanation: {
      coreReasoning: 'In Dart: `Exception` intended to be caught. It represents conditions that a reasonable program should anticipate (network timeout, invalid user input). `Error` represents program defects: bugs in code logic (out of bounds array index, null check failure, invalid argument). You should fix errors in code rather than catching them.',
      dartRule: 'Effective Dart: AVOID catching Error or types that implement Error. Catch specific Exception types instead.',
    },
    sourceDesignation: 'verified_official',
  },
  {
    id: 'q_mod07_trace1',
    moduleId: 'MOD_07',
    moduleName: 'Error Handling & Exceptions',
    topic: 'Exception Propagation',
    subtopic: 'rethrow vs throw e Stack Traces',
    difficulty: 'advanced',
    taskType: 'code_tracing',
    title: 'Tracing Stack Trace Preservation: rethrow vs throw e',
    prompt: 'In Dart, what happens to the original stack trace if you use `throw e` inside a catch block versus the `rethrow` keyword?',
    options: [
      {
        id: 'opt_1',
        text: '`throw e` resets the stack trace to the catch block location, destroying origin context; `rethrow` preserves the full original stack trace back to the initial throw site.',
        isCorrect: true,
      },
      {
        id: 'opt_2',
        text: 'There is no difference; `rethrow` is simply syntactic shorthand for `throw e`.',
        isCorrect: false,
      },
      {
        id: 'opt_3',
        text: '`throw e` keeps the stack trace, whereas `rethrow` discards all trace frames to save memory.',
        isCorrect: false,
      },
      {
        id: 'opt_4',
        text: '`rethrow` can only be invoked inside asynchronous functions returning a Future.',
        isCorrect: false,
      },
    ],
    learningObjectives: ['Understand stack trace preservation and debugging traceability with rethrow'],
    estimatedMinutes: 2,
    hints: [{ level: 1, title: 'Stack Trace Origin', content: 'Where does the error report say the crash occurred?' }],
    explanation: {
      coreReasoning: 'When you rethrow an exception in Dart using the `rethrow` statement, the original stack trace is retained completely. If you write `throw e;`, Dart treats it as a brand new throw and resets the stack trace to the current line, obscuring the actual root cause location.',
      dartRule: 'DO use rethrow to rethrow a caught exception instead of throw e.',
    },
    sourceDesignation: 'verified_official',
  },

  // Module 08: Asynchronous Dart
  {
    id: 'q_mod08_01',
    moduleId: 'MOD_08',
    moduleName: 'Asynchronous Dart & Event Loop',
    topic: 'Event Loop & Scheduling',
    subtopic: 'Microtask Queue vs Event Queue Execution Order',
    difficulty: 'advanced',
    taskType: 'code_tracing',
    title: 'Event Loop Master Tracing: Microtasks vs Events',
    prompt: 'Predict the exact sequence of outputs printed by the following Dart program. This is a classic Outlier / technical screening problem for Dart async competence.',
    starterCode: `import 'dart:async';

void main() {
  print('1: Main sync start');

  scheduleMicrotask(() {
    print('2: Microtask 1');
  });

  Future.delayed(Duration.zero, () {
    print('3: Future.delayed zero');
  });

  Future(() {
    print('4: Standard Future (event)');
  }).then((_) {
    print('5: Then on Standard Future');
  });

  scheduleMicrotask(() {
    print('6: Microtask 2');
  });

  print('7: Main sync end');
}`,
    options: [
      {
        id: 'opt_1',
        text: "1: Main sync start\n7: Main sync end\n2: Microtask 1\n6: Microtask 2\n4: Standard Future (event)\n5: Then on Standard Future\n3: Future.delayed zero",
        isCorrect: true,
      },
      {
        id: 'opt_2',
        text: "1: Main sync start\n2: Microtask 1\n6: Microtask 2\n7: Main sync end\n3: Future.delayed zero\n4: Standard Future (event)\n5: Then on Standard Future",
        isCorrect: false,
      },
      {
        id: 'opt_3',
        text: "1: Main sync start\n7: Main sync end\n3: Future.delayed zero\n4: Standard Future (event)\n2: Microtask 1\n6: Microtask 2\n5: Then on Standard Future",
        isCorrect: false,
      },
      {
        id: 'opt_4',
        text: "1: Main sync start\n3: Future.delayed zero\n4: Standard Future (event)\n5: Then on Standard Future\n2: Microtask 1\n6: Microtask 2\n7: Main sync end",
        isCorrect: false,
      },
    ],
    learningObjectives: [
      'Master the Dart event loop two-queue model (Microtask queue vs Event queue)',
      'Accurately predict async interleaving and execution timing',
    ],
    estimatedMinutes: 5,
    hints: [
      { level: 1, title: 'Synchronous execution first', content: 'Synchronous execution from main() always runs to completion before any queue is serviced.' },
      { level: 2, title: 'Microtask queue priority', content: 'The microtask queue is completely drained before ANY event from the event queue is processed.' },
    ],
    explanation: {
      coreReasoning: '1. Synchronous main runs: prints 1, schedules microtask 2, registers Future 3 (timer in event queue), registers Future 4 (event queue), schedules microtask 6, prints 7.\n2. Main finishes. Microtask queue is drained: prints 2, then 6.\n3. Microtasks empty. Event loop picks next event from event queue: Standard Future runs, printing 4, and its synchronous completion triggers .then callback printing 5.\n4. Future.delayed zero timer expires and runs next in event queue, printing 3.\nResult: 1, 7, 2, 6, 4, 5, 3.',
      dartRule: 'Microtasks always execute before events from the Event Queue. Synchronous code always runs to completion first.',
    },
    sourceDesignation: 'verified_official',
  },
  {
    id: 'q_mod08_code1',
    moduleId: 'MOD_08',
    moduleName: 'Asynchronous Dart & Event Loop',
    topic: 'Async Coordination',
    subtopic: 'Concurrent Future Execution with Future.wait',
    difficulty: 'intermediate',
    taskType: 'coding_challenge',
    title: 'Implement Parallel Batch Fetcher with Future.wait',
    prompt: 'Implement a function `Future<List<String>> fetchAllUsers(List<int> userIds, Future<String> Function(int) fetchUser)` that retrieves all user data concurrently using `Future.wait`. Do not fetch them sequentially with a loop await.',
    starterCode: `Future<List<String>> fetchAllUsers(
  List<int> userIds,
  Future<String> Function(int) fetchUser,
) async {
  // Fetch concurrently using Future.wait
  return [];
}

void main() async {
  final results = await fetchAllUsers([1, 2, 3], (id) async => 'User_\$id');
  print(results); // Expected: [User_1, User_2, User_3]
}`,
    referenceSolution: `Future<List<String>> fetchAllUsers(
  List<int> userIds,
  Future<String> Function(int) fetchUser,
) async {
  // Map to futures first so all start concurrently, then wait together
  final futures = userIds.map((id) => fetchUser(id));
  return await Future.wait(futures);
}`,
    testCases: [
      {
        id: 'tc_async_1',
        name: 'Fetches list of 3 users in order',
        expectedOutput: '[User_1, User_2, User_3]',
        testCode: 'void main() async { final r = await fetchAllUsers([1, 2, 3], (id) async => "User_\$id"); assert(r.length == 3 && r[1] == "User_2"); print("PASS_1"); }',
      },
      {
        id: 'tc_async_2',
        name: 'Empty list returns empty without error',
        expectedOutput: '[]',
        testCode: 'void main() async { final r = await fetchAllUsers([], (id) async => "User_\$id"); assert(r.isEmpty); print("PASS_2"); }',
      },
    ],
    learningObjectives: ['Coordinate concurrent asynchronous operations using Future.wait instead of slow sequential loops'],
    estimatedMinutes: 4,
    hints: [{ level: 1, title: 'Concurrent dispatch', content: 'Call `userIds.map(fetchUser)` to initiate all requests concurrently, then pass the Iterable to `Future.wait`.' }],
    explanation: {
      coreReasoning: 'Sequential `for (var id in ids) { await fetch(id); }` turns parallel IO into slow serial execution (N * latency). Using `Future.wait(ids.map(fetch))` executes all requests in parallel on the event loop (total time ~ max(latencies)).',
      dartRule: 'PREFER Future.wait() when multiple independent futures can run concurrently.',
    },
    sourceDesignation: 'verified_official',
  },

  // Module 09: Streams
  {
    id: 'q_mod09_01',
    moduleId: 'MOD_09',
    moduleName: 'Reactive Streams & Async Generators',
    topic: 'Stream Architectures',
    subtopic: 'Single-Subscription vs Broadcast Streams',
    difficulty: 'intermediate',
    taskType: 'knowledge',
    title: 'Single-Subscription vs Broadcast Stream Mechanics',
    prompt: 'What happens when a second listener attempts to call `.listen()` on a single-subscription Dart Stream that already has an active subscriber?',
    options: [
      {
        id: 'opt_1',
        text: 'The second listener silently replaces the first listener.',
        isCorrect: false,
      },
      {
        id: 'opt_2',
        text: 'The stream automatically upgrades itself to a broadcast stream at runtime.',
        isCorrect: false,
      },
      {
        id: 'opt_3',
        text: 'A StateError ("Bad state: Stream has already been listened to.") is thrown immediately.',
        isCorrect: true,
      },
      {
        id: 'opt_4',
        text: 'The second listener buffers all events until the first listener cancels.',
        isCorrect: false,
      },
    ],
    learningObjectives: ['Understand single-subscription stream constraints and broadcast conversions'],
    estimatedMinutes: 2,
    hints: [{ level: 1, title: 'Bad state', content: 'What exception does Dart throw when violating stream contract?' }],
    explanation: {
      coreReasoning: 'Single-subscription streams (the default in Dart) only allow one listener during their entire lifecycle. Even if the first subscription is canceled, you cannot re-listen unless the stream was created as or converted to a broadcast stream (`stream.asBroadcastStream()`). Attempting a second listen throws a StateError.',
      dartRule: 'Use Stream.asBroadcastStream() or StreamController.broadcast() when multiple independent listeners are required.',
    },
    sourceDesignation: 'verified_official',
  },
  {
    id: 'q_mod09_code1',
    moduleId: 'MOD_09',
    moduleName: 'Reactive Streams & Async Generators',
    topic: 'Async Generators',
    subtopic: 'Implementing async* Generator with yield',
    difficulty: 'intermediate',
    taskType: 'coding_challenge',
    title: 'Build Fibonacci Stream Generator with async*',
    prompt: 'Implement a function `Stream<int> fibonacciStream(int count)` using an `async*` generator that yields the first `count` numbers of the Fibonacci sequence (starting with 0, 1, 1, 2, 3, 5, ...). If count <= 0, yield nothing.',
    starterCode: `Stream<int> fibonacciStream(int count) async* {
  // Use async* and yield
}

void main() async {
  await for (final num in fibonacciStream(5)) {
    print(num); // Expected: 0, 1, 1, 2, 3
  }
}`,
    referenceSolution: `Stream<int> fibonacciStream(int count) async* {
  if (count <= 0) return;

  int a = 0;
  int b = 1;

  for (int i = 0; i < count; i++) {
    yield a;
    final next = a + b;
    a = b;
    b = next;
  }
}`,
    testCases: [
      {
        id: 'tc_stream_1',
        name: 'Yields first 5 Fibonacci numbers',
        expectedOutput: '[0, 1, 1, 2, 3]',
        testCode: 'void main() async { final list = await fibonacciStream(5).toList(); assert(list.length == 5 && list[4] == 3); print("PASS_1"); }',
      },
      {
        id: 'tc_stream_2',
        name: 'Count 0 yields empty list',
        expectedOutput: '[]',
        testCode: 'void main() async { final list = await fibonacciStream(0).toList(); assert(list.isEmpty); print("PASS_2"); }',
      },
    ],
    learningObjectives: ['Implement asynchronous event streams using async* and yield'],
    estimatedMinutes: 4,
    hints: [{ level: 1, title: 'Yield statement', content: 'Inside an async* function, emit values using `yield value;`.' }],
    explanation: {
      coreReasoning: 'Functions marked `async*` return a Stream. Whenever `yield` executes, the emitted value is pushed to the stream subscriber. `await for` consumes the stream sequentially as events are produced.',
      dartRule: 'async* functions return Stream<T> and emit items via yield or yield*.',
    },
    sourceDesignation: 'verified_official',
  },

  // Module 10: Isolates
  {
    id: 'q_mod10_01',
    moduleId: 'MOD_10',
    moduleName: 'Isolates & Parallel Concurrency',
    topic: 'Isolate Model',
    subtopic: 'Concurrency vs Parallelism & Isolate.run',
    difficulty: 'advanced',
    taskType: 'knowledge',
    title: 'Why async/await Cannot Utilize Multiple CPU Cores',
    prompt: 'A software engineer observes that running a heavy cryptographic loop inside an `async` function still freezes the main UI thread. Why does this occur in Dart, and what is the proper solution?',
    options: [
      {
        id: 'opt_1',
        text: 'The Dart compiler turns off multi-threading when debugging mode is enabled.',
        isCorrect: false,
      },
      {
        id: 'opt_2',
        text: 'Dart code within a single isolate executes on a single event loop thread; `async/await` enables non-blocking asynchronous coordination of IO, not multi-core CPU parallelism. The CPU-bound computation must be dispatched to a worker isolate via `Isolate.run()`.',
        isCorrect: true,
      },
      {
        id: 'opt_3',
        text: 'The engineer forgot to add `await Future.delayed(Duration.zero)` inside every loop iteration.',
        isCorrect: false,
      },
      {
        id: 'opt_4',
        text: 'Dart does not support multi-core processors on 64-bit operating systems.',
        isCorrect: false,
      },
    ],
    learningObjectives: [
      'Understand Dart single-threaded isolate event loop limitations',
      'Select Isolate.run for CPU-heavy tasks to achieve true OS-thread parallelism',
    ],
    estimatedMinutes: 3,
    hints: [{ level: 1, title: 'Single-threaded isolate', content: 'How many OS threads execute instructions inside a single Dart isolate?' }],
    explanation: {
      coreReasoning: 'Every Dart isolate has its own private heap memory and a single execution thread with an event loop. `async` and `await` are cooperative multitasking mechanisms for IO operations, not thread spawning. Heavy CPU computation blocks the single thread completely. `Isolate.run(computation)` spawns a separate isolate on another OS thread, performs the calculation, and returns the result without blocking.',
      dartRule: 'Use Isolate.run() for expensive CPU computations (JSON decoding huge payloads, image filtering, hashing).',
    },
    sourceDesignation: 'verified_official',
  },
];
