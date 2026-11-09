import { Question } from '../../types';

export const ADVANCED_QUESTIONS_BANK: Question[] = [
  // Module 02: Advanced Null Safety & Field Promotion
  {
    id: 'q_mod02_field_promo',
    moduleId: 'MOD_02',
    moduleName: 'Type System & Null Safety',
    topic: 'Field Promotion in Dart 3.2+',
    subtopic: 'Private Final Field Promotion Caveats',
    difficulty: 'expert',
    taskType: 'knowledge',
    title: 'Dart 3.2 Private Final Field Promotion Limitations',
    prompt: 'Dart 3.2 introduced private final field promotion (e.g. `if (_name != null)` promotes `_name` to non-null). Under which of the following scenarios does private final field promotion STILL fail to promote?',
    options: [
      {
        id: 'opt_1',
        text: 'When the class is instantiated inside an async function.',
        isCorrect: false,
      },
      {
        id: 'opt_2',
        text: 'When another library in the same package declares a conflicting non-promotable getter with the same private name `_name`.',
        isCorrect: true,
      },
      {
        id: 'opt_3',
        text: 'When the field is initialized using an initializer list rather than in the constructor body.',
        isCorrect: false,
      },
      {
        id: 'opt_4',
        text: 'Private fields always promote in all scenarios since Dart 3.2 without exception.',
        isCorrect: false,
      },
    ],
    learningObjectives: [
      'Understand compiler flow analysis constraints on private final field promotion in Dart 3.2+',
      'Identify library boundary rules governing identifier resolution',
    ],
    estimatedMinutes: 3,
    hints: [
      { level: 1, title: 'Scope of Privacy', content: 'In Dart, privacy is library-level, not class-level. What happens if multiple classes in the same library share a getter name?' },
    ],
    explanation: {
      coreReasoning: 'In Dart 3.2, private final fields can promote because subclasses in other libraries cannot override them with a getter. However, promotion still fails if: (1) there is a non-final field or getter with the same private name in the same library, or (2) the field is overridden or shadowed in a way that prevents the compiler from proving soundness.',
      dartRule: 'Private final field promotion requires that no conflicting non-final field or non-trivial getter exists in the library with the same name.',
    },
    sourceDesignation: 'verified_official',
  },
  {
    id: 'q_mod02_debug_late',
    moduleId: 'MOD_02',
    moduleName: 'Type System & Null Safety',
    topic: 'Late Field Traps',
    subtopic: 'LateInitializationError in Async Callbacks',
    difficulty: 'advanced',
    taskType: 'debugging',
    title: 'Debug LateInitializationError under Asynchronous Races',
    prompt: 'The following session manager service intermittently crashes in production with `LateInitializationError: Field "_sessionId" has not been initialized`. Diagnose the concurrency race condition and rewrite it to be sound without uninitialized late state.',
    brokenCode: `class SessionManager {
  late String _sessionId;
  bool _isInitializing = false;

  Future<String> getSessionId() async {
    if (!_isInitializing) {
      _isInitializing = true;
      // Simulating remote fetch
      await Future.delayed(const Duration(milliseconds: 50));
      _sessionId = 'SESSION_TOKEN_99';
    }
    // Bug: If a second caller arrives while _isInitializing is true,
    // it skips the if-block and reads _sessionId BEFORE it is initialized!
    return _sessionId;
  }
}

void main() async {
  final manager = SessionManager();
  // Simulating concurrent calls:
  final results = await Future.wait([
    manager.getSessionId(),
    manager.getSessionId(),
  ]);
  print('Sessions: \$results');
}`,
    referenceSolution: `class SessionManager {
  Future<String>? _initFuture;

  Future<String> getSessionId() {
    // Memoize the initialization future so all concurrent callers await the SAME future
    return _initFuture ??= _fetchSession();
  }

  Future<String> _fetchSession() async {
    await Future.delayed(const Duration(milliseconds: 50));
    return 'SESSION_TOKEN_99';
  }
}

void main() async {
  final manager = SessionManager();
  final results = await Future.wait([
    manager.getSessionId(),
    manager.getSessionId(),
  ]);
  print('Sessions: \$results');
}`,
    testCases: [
      {
        id: 'tc_late_1',
        name: 'Concurrent callers receive identical session ID without crashing',
        expectedOutput: '[SESSION_TOKEN_99, SESSION_TOKEN_99]',
        testCode: `void main() async {
  final manager = SessionManager();
  final results = await Future.wait([
    manager.getSessionId(),
    manager.getSessionId(),
  ]);
  assert(results.length == 2 && results[0] == 'SESSION_TOKEN_99' && results[1] == 'SESSION_TOKEN_99');
  print("PASS_1");
}`,
      },
    ],
    learningObjectives: [
      'Eliminate late keyword antipatterns in asynchronous singletons',
      'Use Future memoization (initFuture ??= fetch()) to handle concurrent callers cleanly',
    ],
    estimatedMinutes: 5,
    hints: [
      { level: 1, title: 'Race Condition', content: 'When caller 2 arrives while caller 1 is awaiting Future.delayed, caller 2 immediately tries to return `_sessionId`.' },
      { level: 2, title: 'Store the Future', content: 'Store `Future<String>? _initFuture` instead of a boolean and a late String.' },
    ],
    explanation: {
      coreReasoning: 'Using `late` on fields that are initialized asynchronously is a notorious recipe for `LateInitializationError`. The sound idiomatic solution in Dart is future memoization: `_initFuture ??= _fetchSession(); return _initFuture!;`. All concurrent callers await the exact same Future.',
      dartRule: 'AVOID late fields initialized asynchronously. Prefer memoizing the Future or using a Completer.',
    },
    sourceDesignation: 'reported_outlier_pattern',
  },

  // Module 04 & 14: Data Structures & Algorithms (LRU Cache)
  {
    id: 'q_mod04_lru_cache',
    moduleId: 'MOD_04',
    moduleName: 'Collections & Data Structures',
    topic: 'Advanced Collections',
    subtopic: 'LRU Cache with LinkedHashMap',
    difficulty: 'expert',
    taskType: 'coding_challenge',
    title: 'Implement an LRU Cache in Idiomatic Dart',
    prompt: 'Implement a generic Least Recently Used (LRU) Cache class: `LruCache<K, V>({required int capacity})`. Operations:\n- `V? get(K key)`: returns value and marks item as most recently used. Returns null if absent.\n- `void put(K key, V value)`: inserts or updates key. If capacity is exceeded, evicts the least recently used key.\nEnsure O(1) average time complexity for both get and put.',
    starterCode: `import 'dart:collection';

class LruCache<K, V> {
  final int capacity;
  final LinkedHashMap<K, V> _map = LinkedHashMap<K, V>();

  LruCache({required this.capacity});

  V? get(K key) {
    // Implement O(1) read and refresh recency
    return null;
  }

  void put(K key, V value) {
    // Implement O(1) insert and eviction if over capacity
  }

  int get length => _map.length;
}

void main() {
  final cache = LruCache<String, int>(capacity: 2);
  cache.put('a', 1);
  cache.put('b', 2);
  print(cache.get('a')); // 1 (makes 'a' most recently used)
  cache.put('c', 3);     // evicts 'b'
  print(cache.get('b')); // null
  print(cache.get('c')); // 3
}`,
    referenceSolution: `import 'dart:collection';

class LruCache<K, V> {
  final int capacity;
  final LinkedHashMap<K, V> _map = LinkedHashMap<K, V>();

  LruCache({required this.capacity}) {
    if (capacity <= 0) throw ArgumentError('Capacity must be greater than 0');
  }

  V? get(K key) {
    final value = _map.remove(key);
    if (value != null) {
      _map[key] = value; // Re-insert to move to end of iteration order
      return value;
    }
    return null;
  }

  void put(K key, V value) {
    if (_map.containsKey(key)) {
      _map.remove(key);
    } else if (_map.length >= capacity) {
      // In Dart LinkedHashMap, keys.first gives the oldest inserted key
      final oldestKey = _map.keys.first;
      _map.remove(oldestKey);
    }
    _map[key] = value;
  }

  int get length => _map.length;
}`,
    testCases: [
      {
        id: 'tc_lru_1',
        name: 'Evicts least recently used entry',
        expectedOutput: '1, null, 3',
        testCode: `void main() {
  final cache = LruCache<String, int>(capacity: 2);
  cache.put('a', 1);
  cache.put('b', 2);
  final r1 = cache.get('a'); // 1
  cache.put('c', 3); // should evict 'b'
  final r2 = cache.get('b'); // null
  final r3 = cache.get('c'); // 3
  assert(r1 == 1 && r2 == null && r3 == 3);
  print("PASS_1");
}`,
      },
      {
        id: 'tc_lru_2',
        name: 'Updating existing key refreshes recency without increasing length',
        expectedOutput: '1',
        testCode: `void main() {
  final cache = LruCache<String, int>(capacity: 2);
  cache.put('x', 10);
  cache.put('x', 20);
  assert(cache.length == 1 && cache.get('x') == 20);
  print("PASS_2");
}`,
      },
    ],
    learningObjectives: [
      'Leverage Dart core LinkedHashMap predictable iteration order for O(1) LRU caching',
      'Handle capacity bounds and key eviction cleanly',
    ],
    estimatedMinutes: 6,
    hints: [
      { level: 1, title: 'LinkedHashMap iteration order', content: 'In Dart, `LinkedHashMap` maintains insertion order. Removing and re-inserting a key moves it to the most recent position.' },
      { level: 2, title: 'Oldest key', content: '`_map.keys.first` retrieves the least recently inserted key in O(1) time.' },
    ],
    explanation: {
      coreReasoning: 'Dart standard `LinkedHashMap` preserves insertion order. To update recency in O(1) time: call `_map.remove(key)` and immediately `_map[key] = value`. The oldest item is always at `_map.keys.first`.',
      dartRule: 'LinkedHashMap in dart:collection maintains insertion order and supports O(1) eviction.',
    },
    sourceDesignation: 'original_mastery_challenge',
  },

  // Module 08: Asynchronous Coordination (Concurrency Limiter)
  {
    id: 'q_mod08_scheduler',
    moduleId: 'MOD_08',
    moduleName: 'Asynchronous Dart & Event Loop',
    topic: 'Concurrency Control',
    subtopic: 'Async Concurrency Limiter Pool',
    difficulty: 'expert',
    taskType: 'coding_challenge',
    title: 'Implement an Asynchronous Concurrency Limiter',
    prompt: 'Implement a `ConcurrencyLimiter` class in Dart that ensures at most `maxConcurrent` asynchronous operations run concurrently. Excess operations must be queued and executed as capacity becomes available.',
    starterCode: `import 'dart:async';

class ConcurrencyLimiter {
  final int maxConcurrent;
  int _activeCount = 0;
  final List<Completer<void>> _queue = [];

  ConcurrencyLimiter(this.maxConcurrent);

  Future<T> run<T>(Future<T> Function() task) async {
    // Wait if at max capacity
    // Execute task
    // Notify next in queue
    throw UnimplementedError();
  }
}

void main() async {
  final limiter = ConcurrencyLimiter(2);
  int peak = 0;
  int current = 0;

  Future<void> dummyTask(int id) async {
    current++;
    if (current > peak) peak = current;
    await Future.delayed(const Duration(milliseconds: 30));
    current--;
  }

  await Future.wait([
    limiter.run(() => dummyTask(1)),
    limiter.run(() => dummyTask(2)),
    limiter.run(() => dummyTask(3)),
    limiter.run(() => dummyTask(4)),
  ]);

  print('Peak concurrent: \$peak'); // Must be <= 2
}`,
    referenceSolution: `import 'dart:async';

class ConcurrencyLimiter {
  final int maxConcurrent;
  int _activeCount = 0;
  final List<Completer<void>> _queue = [];

  ConcurrencyLimiter(this.maxConcurrent) {
    if (maxConcurrent <= 0) throw ArgumentError('maxConcurrent must be >= 1');
  }

  Future<T> run<T>(Future<T> Function() task) async {
    while (_activeCount >= maxConcurrent) {
      final completer = Completer<void>();
      _queue.add(completer);
      await completer.future;
    }

    _activeCount++;
    try {
      return await task();
    } finally {
      _activeCount--;
      if (_queue.isNotEmpty) {
        final next = _queue.removeAt(0);
        next.complete();
      }
    }
  }
}`,
    testCases: [
      {
        id: 'tc_limiter_1',
        name: 'Limits peak concurrent operations to maxConcurrent',
        expectedOutput: 'Peak concurrent <= 2',
        testCode: `void main() async {
  final limiter = ConcurrencyLimiter(2);
  int peak = 0;
  int current = 0;

  Future<void> dummyTask(int id) async {
    current++;
    if (current > peak) peak = current;
    await Future.delayed(const Duration(milliseconds: 30));
    current--;
  }

  await Future.wait([
    limiter.run(() => dummyTask(1)),
    limiter.run(() => dummyTask(2)),
    limiter.run(() => dummyTask(3)),
    limiter.run(() => dummyTask(4)),
  ]);

  assert(peak == 2);
  print("PASS_1");
}`,
      },
    ],
    learningObjectives: [
      'Coordinate bounded async task execution with Completer queues',
      'Ensure finally cleanup blocks reliably decrement active workers even on exception',
    ],
    estimatedMinutes: 6,
    hints: [
      { level: 1, title: 'Completer pattern', content: 'Use `Completer<void>()` to suspend a caller until a prior operation finishes.' },
      { level: 2, title: 'Finally block', content: 'Always decrement `_activeCount` and complete the next waiter inside a `finally` block.' },
    ],
    explanation: {
      coreReasoning: 'A concurrency pool in Dart queues suspended `Completer` objects. When an active task completes, the `finally` block releases one permit and signals `next.complete()`, resuming the next queued caller on the event loop.',
      dartRule: 'Use Completers to bridge low-level asynchronous signaling with Futures.',
    },
    sourceDesignation: 'original_mastery_challenge',
  },

  // Module 09: Stream Subscription Leaks
  {
    id: 'q_mod09_broadcast_leak',
    moduleId: 'MOD_09',
    moduleName: 'Reactive Streams & Async Generators',
    topic: 'Subscription Lifecycle',
    subtopic: 'Preventing Stream Subscription Memory Leaks',
    difficulty: 'advanced',
    taskType: 'debugging',
    title: 'Diagnose StreamSubscription Leak in Event Bus',
    prompt: 'The following `EventMonitor` component subscribes to an application-wide broadcast stream on initialization, but its subscribers cause memory leaks and phantom callbacks when components are disposed. Identify the defect and provide a robust subscription management refactor.',
    brokenCode: `import 'dart:async';

class EventBus {
  final _controller = StreamController<String>.broadcast();
  Stream<String> get events => _controller.stream;
  void fire(String event) => _controller.add(event);
}

class EventMonitor {
  final EventBus bus;
  int eventCount = 0;

  EventMonitor(this.bus) {
    // Problem: Subscription is never stored or cancelled upon dispose!
    bus.events.listen((event) {
      eventCount++;
      print('Received event: \$event (Total: \$eventCount)');
    });
  }

  void dispose() {
    print('Disposing monitor');
    // Leaks listener!
  }
}`,
    referenceSolution: `import 'dart:async';

class EventBus {
  final _controller = StreamController<String>.broadcast();
  Stream<String> get events => _controller.stream;
  void fire(String event) => _controller.add(event);
  void dispose() => _controller.close();
}

class EventMonitor {
  final EventBus bus;
  StreamSubscription<String>? _subscription;
  int eventCount = 0;

  EventMonitor(this.bus) {
    _subscription = bus.events.listen((event) {
      eventCount++;
    });
  }

  void dispose() {
    _subscription?.cancel();
    _subscription = null;
  }
}

void main() {
  final bus = EventBus();
  final monitor = EventMonitor(bus);
  bus.fire('LOGIN');
  monitor.dispose();
  bus.fire('LOGOUT'); // Monitor should NOT receive this event!
  assert(monitor.eventCount == 1);
  print('PASS');
}`,
    testCases: [
      {
        id: 'tc_leak_1',
        name: 'Disposed monitor ignores subsequent events',
        expectedOutput: 'PASS',
        testCode: `void main() {
  final bus = EventBus();
  final monitor = EventMonitor(bus);
  bus.fire('LOGIN');
  monitor.dispose();
  bus.fire('LOGOUT');
  assert(monitor.eventCount == 1);
  print("PASS");
}`,
      },
    ],
    learningObjectives: [
      'Store and cancel StreamSubscription instances upon component lifecycle completion',
      'Prevent retained closures and memory leaks in reactive Dart architectures',
    ],
    estimatedMinutes: 5,
    hints: [
      { level: 1, title: 'Store subscription', content: '`Stream.listen()` returns a `StreamSubscription<T>`. Store it in a field.' },
      { level: 2, title: 'Cancel on dispose', content: 'Call `_subscription?.cancel()` inside `dispose()`.' },
    ],
    explanation: {
      coreReasoning: 'Broadcast streams retain all active listener closures in memory. If a listener does not cancel its `StreamSubscription`, the enclosing class instance cannot be garbage-collected, and phantom callbacks continue to fire on dead components.',
      dartRule: 'ALWAYS store and cancel StreamSubscription instances when the listener lifecycle concludes.',
    },
    sourceDesignation: 'reported_outlier_pattern',
  },

  // Module 14: Algorithms (Sliding Window Maximum)
  {
    id: 'q_mod14_sliding_window',
    moduleId: 'MOD_14',
    moduleName: 'Algorithms & Problem Solving in Dart',
    topic: 'Sliding Window',
    subtopic: 'Maximum Sum Subarray of Size K',
    difficulty: 'intermediate',
    taskType: 'coding_challenge',
    title: 'Maximum Sum Subarray of Size K with Sliding Window',
    prompt: 'Implement a function `int maxSubarraySum(List<int> nums, int k)` that returns the maximum sum of any contiguous subarray of size `k`. If `nums.length < k` or `k <= 0`, return 0. Your solution must run in O(N) time using a sliding window.',
    starterCode: `int maxSubarraySum(List<int> nums, int k) {
  // Implement O(N) sliding window
  return 0;
}

void main() {
  print(maxSubarraySum([2, 1, 5, 1, 3, 2], 3)); // Expected: 9 (subarray [5, 1, 3])
  print(maxSubarraySum([2, 3, 4, 1, 5], 2));       // Expected: 7 (subarray [3, 4])
}`,
    referenceSolution: `int maxSubarraySum(List<int> nums, int k) {
  if (nums.length < k || k <= 0) return 0;

  int windowSum = 0;
  for (int i = 0; i < k; i++) {
    windowSum += nums[i];
  }

  int maxSum = windowSum;

  for (int i = k; i < nums.length; i++) {
    windowSum += nums[i] - nums[i - k];
    if (windowSum > maxSum) {
      maxSum = windowSum;
    }
  }

  return maxSum;
}`,
    testCases: [
      {
        id: 'tc_sw_1',
        name: 'Standard array with k=3',
        expectedOutput: '9',
        testCode: 'void main() { assert(maxSubarraySum([2, 1, 5, 1, 3, 2], 3) == 9); print("PASS_1"); }',
      },
      {
        id: 'tc_sw_2',
        name: 'k=2 subarray',
        expectedOutput: '7',
        testCode: 'void main() { assert(maxSubarraySum([2, 3, 4, 1, 5], 2) == 7); print("PASS_2"); }',
      },
      {
        id: 'tc_sw_3',
        name: 'k larger than array length returns 0',
        expectedOutput: '0',
        testCode: 'void main() { assert(maxSubarraySum([1, 2], 5) == 0); print("PASS_3"); }',
      },
    ],
    learningObjectives: ['Implement O(N) sliding window arithmetic: add incoming element, subtract outgoing element'],
    estimatedMinutes: 4,
    hints: [
      { level: 1, title: 'Rolling sum', content: 'Compute sum of first k elements. Then loop from k to length: `windowSum += nums[i] - nums[i - k]`.' },
    ],
    explanation: {
      coreReasoning: 'A naive nested loop takes O(N * K) time. The sliding window technique adds the new element entering the right edge and subtracts the old element exiting the left edge in O(1) time per step, achieving optimal O(N) time.',
      dartRule: 'Use sliding window technique to optimize contiguous array interval queries from O(N*K) to O(N).',
    },
    sourceDesignation: 'verified_official',
  },

  // Module 05: Class Modifiers Matrix
  {
    id: 'q_mod05_modifiers_matrix',
    moduleId: 'MOD_05',
    moduleName: 'Object-Oriented Programming',
    topic: 'Dart 3 Class Modifiers',
    subtopic: 'base vs interface vs final vs sealed',
    difficulty: 'advanced',
    taskType: 'knowledge',
    title: 'Dart 3 Class Modifiers: Subtyping vs Interface Contracts',
    prompt: 'In Dart 3, which class modifier allows external libraries to EXTEND the class (inheriting its implementation) while strictly FORBIDDING external libraries from IMPLEMENTING it as an interface?',
    options: [
      {
        id: 'opt_1',
        text: '`base class`: External libraries can only extend (inherit), preserving private invariants and super calls, but cannot implement as a bare interface.',
        isCorrect: true,
      },
      {
        id: 'opt_2',
        text: '`interface class`: External libraries can implement the interface, but are forbidden from extending.',
        isCorrect: false,
      },
      {
        id: 'opt_3',
        text: '`final class`: External libraries are allowed to extend as long as they override all public methods.',
        isCorrect: false,
      },
      {
        id: 'opt_4',
        text: '`abstract class`: Automatically prevents implements outside the library unless marked with @allowImplement.',
        isCorrect: false,
      },
    ],
    learningObjectives: [
      'Master Dart 3 modifier matrix (base, interface, final, sealed, mixin)',
      'Understand API design boundary protection in Dart packages',
    ],
    estimatedMinutes: 3,
    hints: [
      { level: 1, title: 'Modifier rule', content: '`base` enforces that the class hierarchy preserves the base implementation. Any subtype in an outside library must also be marked base, final, or sealed.' },
    ],
    explanation: {
      coreReasoning: 'Dart 3 introduced class modifiers to control subtyping across library boundaries: `base` guarantees that code can extend the class but cannot implement it, protecting internal invariants and ensuring `super` method calls cannot be circumvented. `interface` does the opposite (allows implement, forbids extend). `final` forbids both outside the library. `sealed` closes the hierarchy completely to enable exhaustive pattern matching.',
      dartRule: 'Use `base class` when you want callers to inherit your implementation without breaking private member expectations via `implements`.',
    },
    sourceDesignation: 'verified_official',
  },

  // Module 09: Stream Batching
  {
    id: 'q_mod09_batch_stream',
    moduleId: 'MOD_09',
    moduleName: 'Streams & Reactive Programming',
    topic: 'Stream Transformation',
    subtopic: 'Custom Stream Chunking & Buffering',
    difficulty: 'advanced',
    taskType: 'coding_challenge',
    title: 'Stream Batching: Chunking Events into Fixed Windows',
    prompt: 'Implement a function `Stream<List<int>> batchStream(Stream<int> source, int batchSize)` that groups incoming stream values into fixed-size lists of length `batchSize`. When the source stream completes, any remaining items in the buffer must be emitted as a final non-empty batch.',
    starterCode: `import 'dart:async';

Stream<List<int>> batchStream(Stream<int> source, int batchSize) async* {
  // Buffer items and yield fixed batches
}

void main() async {
  final stream = Stream.fromIterable([1, 2, 3, 4, 5, 6, 7]);
  await for (final batch in batchStream(stream, 3)) {
    print(batch); // [1, 2, 3], then [4, 5, 6], then [7]
  }
}`,
    referenceSolution: `import 'dart:async';

Stream<List<int>> batchStream(Stream<int> source, int batchSize) async* {
  if (batchSize <= 0) {
    throw ArgumentError.value(batchSize, 'batchSize', 'Must be greater than 0');
  }

  var buffer = <int>[];

  await for (final item in source) {
    buffer.add(item);
    if (buffer.length == batchSize) {
      yield List<int>.unmodifiable(buffer);
      buffer = <int>[];
    }
  }

  if (buffer.isNotEmpty) {
    yield List<int>.unmodifiable(buffer);
  }
}`,
    testCases: [
      {
        id: 'tc_batch_1',
        name: 'Even batches and partial remainder',
        expectedOutput: '[[1, 2, 3], [4, 5, 6], [7]]',
        testCode: `void main() async {
  final input = Stream.fromIterable([1, 2, 3, 4, 5, 6, 7]);
  final batches = await batchStream(input, 3).toList();
  assert(batches.length == 3);
  assert(batches[0].length == 3 && batches[0][0] == 1);
  assert(batches[1].length == 3 && batches[1][0] == 4);
  assert(batches[2].length == 1 && batches[2][0] == 7);
  print(batches);
}`,
      },
      {
        id: 'tc_batch_2',
        name: 'Exact division with no trailing leftovers',
        expectedOutput: '[[10, 20], [30, 40]]',
        testCode: `void main() async {
  final input = Stream.fromIterable([10, 20, 30, 40]);
  final batches = await batchStream(input, 2).toList();
  assert(batches.length == 2);
  print(batches);
}`,
      },
      {
        id: 'tc_batch_3',
        name: 'Empty source stream produces empty batch stream',
        expectedOutput: '[]',
        testCode: `void main() async {
  final input = Stream<int>.empty();
  final batches = await batchStream(input, 5).toList();
  assert(batches.isEmpty);
  print(batches);
}`,
      },
    ],
    learningObjectives: [
      'Build custom reactive stream pipeline transformations using async*',
      'Handle end-of-stream boundary flush conditions cleanly',
    ],
    estimatedMinutes: 5,
    hints: [
      { level: 1, title: 'Buffering', content: 'Use an internal List<int> buffer. In an \`await for\` loop, add items. When buffer.length == batchSize, yield List.from(buffer) and reset buffer.' },
    ],
    explanation: {
      coreReasoning: 'Using an \`async*\` generator with \`await for\` simplifies stream buffering without needing complex low-level \`StreamTransformerBase\` boilerplate. Always ensure trailing elements in the buffer are yielded when the source stream completes, and return unmodifiable snapshots to prevent caller mutations.',
      dartRule: 'PREFER using async* stream generators for sequential asynchronous event transformation.',
    },
    sourceDesignation: 'original_mastery_challenge',
  },

  // Module 10: Isolate Handshake
  {
    id: 'q_mod10_isolate_handshake',
    moduleId: 'MOD_10',
    moduleName: 'Concurrency & Isolates',
    topic: 'Isolate Architecture',
    subtopic: 'Bidirectional Port Handshake',
    difficulty: 'advanced',
    taskType: 'knowledge',
    title: 'Two-Way Isolate Communication: The Handshake Pattern',
    prompt: 'In Dart, what is the standard protocol for establishing two-way (bidirectional) communication between a parent isolate and a worker isolate spawned via \`Isolate.spawn\`?',
    options: [
      {
        id: 'opt_1',
        text: 'The parent creates a ReceivePort and passes its sendPort to Isolate.spawn. The worker creates its own ReceivePort, sends its worker.sendPort back through the parent SendPort, and both sides now hold each other\'s SendPort.',
        isCorrect: true,
      },
      {
        id: 'opt_2',
        text: 'The parent shares a pointer to its ReceivePort in a shared global variable since isolates share heap memory in Dart 3.',
        isCorrect: false,
      },
      {
        id: 'opt_3',
        text: 'Two-way communication is not supported by Isolate.spawn; you must use WebSockets or UNIX domain sockets.',
        isCorrect: false,
      },
      {
        id: 'opt_4',
        text: 'Isolate.spawn returns a BidirectionalChannel object that handles reads and writes automatically without ports.',
        isCorrect: false,
      },
    ],
    learningObjectives: [
      'Understand Dart\'s share-nothing memory model and actor concurrency',
      'Implement the canonical ReceivePort/SendPort handshake protocol',
    ],
    estimatedMinutes: 3,
    hints: [
      { level: 1, title: 'Share nothing', content: 'Isolates have completely separate memory heaps. The only way to communicate is by passing messages through SendPort.' },
    ],
    explanation: {
      coreReasoning: 'Because Dart isolates share no mutable heap memory, bidirectional communication requires a port handshake: 1. Parent creates a \`ReceivePort\` and sends its \`sendPort\` as the initial message argument to \`Isolate.spawn(workerEntry, parentPort.sendPort)\`. 2. Worker receives the \`SendPort\`, creates its own \`ReceivePort\`, and sends \`workerReceivePort.sendPort\` back to the parent. 3. Both sides now possess a \`SendPort\` to message the other.',
      dartRule: 'Isolates communicate strictly via message passing through SendPort and ReceivePort.',
    },
    sourceDesignation: 'verified_official',
  },

  // Module 14: 0/1 Knapsack Dynamic Programming
  {
    id: 'q_mod14_knapsack',
    moduleId: 'MOD_14',
    moduleName: 'Algorithms & Problem Solving in Dart',
    topic: 'Dynamic Programming',
    subtopic: '0/1 Knapsack Problem in Dart',
    difficulty: 'advanced',
    taskType: 'coding_challenge',
    title: '0/1 Knapsack Optimization using Dynamic Programming',
    prompt: 'Given \`weights\` and \`values\` of \`N\` items and a knapsack of max \`capacity\`, write \`int knapsack(int capacity, List<int> weights, List<int> values)\` that returns the maximum value that can be placed in the knapsack. Each item can be chosen at most once. Solve this using Dynamic Programming.',
    starterCode: `int knapsack(int capacity, List<int> weights, List<int> values) {
  // Implement 0/1 knapsack dynamic programming
  return 0;
}

void main() {
  // Weights: [1, 3, 4, 5], Values: [1, 4, 5, 7], Capacity: 7
  // Best choice: items with weight 3 & 4 (value 4 + 5 = 9)
  print(knapsack(7, [1, 3, 4, 5], [1, 4, 5, 7])); // Expected: 9
}`,
    referenceSolution: `import 'dart:math';

int knapsack(int capacity, List<int> weights, List<int> values) {
  if (capacity <= 0 || weights.isEmpty || weights.length != values.length) {
    return 0;
  }

  // 1D DP array space optimization: dp[w] = max value for capacity w
  final dp = List<int>.filled(capacity + 1, 0);

  for (int i = 0; i < weights.length; i++) {
    final w = weights[i];
    final v = values[i];

    // Traverse backwards to avoid using the same item multiple times
    for (int cap = capacity; cap >= w; cap--) {
      dp[cap] = max(dp[cap], dp[cap - w] + v);
    }
  }

  return dp[capacity];
}`,
    testCases: [
      {
        id: 'tc_kp_1',
        name: 'Standard knapsack optimal selection',
        expectedOutput: '9',
        testCode: 'void main() { assert(knapsack(7, [1, 3, 4, 5], [1, 4, 5, 7]) == 9); print("PASS_1"); }',
      },
      {
        id: 'tc_kp_2',
        name: 'Zero capacity returns 0',
        expectedOutput: '0',
        testCode: 'void main() { assert(knapsack(0, [2, 3], [5, 10]) == 0); print("PASS_2"); }',
      },
      {
        id: 'tc_kp_3',
        name: 'Items too heavy for knapsack',
        expectedOutput: '0',
        testCode: 'void main() { assert(knapsack(3, [5, 6, 7], [10, 20, 30]) == 0); print("PASS_3"); }',
      },
      {
        id: 'tc_kp_4',
        name: 'All items fit',
        expectedOutput: '60',
        testCode: 'void main() { assert(knapsack(10, [1, 2, 3], [10, 20, 30]) == 60); print("PASS_4"); }',
      },
    ],
    learningObjectives: [
      'Master dynamic programming state transitions in Dart',
      'Optimize 2D DP space complexity into a 1D reverse-traversal array O(W)',
    ],
    estimatedMinutes: 6,
    hints: [
      { level: 1, title: 'State transition', content: 'For each item with weight \`w\` and value \`v\`, loop capacity backwards from \`capacity\` down to \`w\`: \`dp[cap] = max(dp[cap], dp[cap - w] + v)\`.' },
    ],
    explanation: {
      coreReasoning: 'The 0/1 knapsack problem has optimal substructure and overlapping subproblems. By running backwards from \`capacity\` to \`weights[i]\`, we can compress the classic 2D \`O(N*W)\` memory table into a single 1D array of size \`W + 1\`, running in O(N*W) time and O(W) space.',
      dartRule: 'In Dart, List.filled(size, initialValue) provides pre-allocated, continuous memory for fast numeric DP arrays.',
    },
    sourceDesignation: 'original_mastery_challenge',
  },

  // Module 14: Linked List Cycle Detection
  {
    id: 'q_mod14_cycle_detection',
    moduleId: 'MOD_14',
    moduleName: 'Algorithms & Problem Solving in Dart',
    topic: 'Pointer Algorithms',
    subtopic: 'Floyd\'s Tortoise and Hare Cycle Detection',
    difficulty: 'intermediate',
    taskType: 'coding_challenge',
    title: 'Floyd\'s Cycle Detection in a Singly Linked List',
    prompt: 'Implement \`bool hasCycle(ListNode? head)\` that determines if a singly linked list contains a cycle. You MUST implement Floyd\'s Tortoise and Hare two-pointer algorithm with O(N) time and O(1) space without modifying node values.',
    starterCode: `class ListNode {
  int val;
  ListNode? next;
  ListNode(this.val, [this.next]);
}

bool hasCycle(ListNode? head) {
  // Implement Floyd's Tortoise and Hare algorithm
  return false;
}

void main() {
  final n1 = ListNode(3);
  final n2 = ListNode(2);
  final n3 = ListNode(0);
  final n4 = ListNode(-4);
  n1.next = n2;
  n2.next = n3;
  n3.next = n4;
  n4.next = n2; // Creates cycle back to n2

  print(hasCycle(n1)); // Expected: true
}`,
    referenceSolution: `class ListNode {
  int val;
  ListNode? next;
  ListNode(this.val, [this.next]);
}

bool hasCycle(ListNode? head) {
  if (head == null || head.next == null) return false;

  ListNode? slow = head;
  ListNode? fast = head.next;

  while (fast != null && fast.next != null) {
    if (slow == fast) {
      return true;
    }
    slow = slow?.next;
    fast = fast.next?.next;
  }

  return false;
}`,
    testCases: [
      {
        id: 'tc_cycle_1',
        name: 'List with internal cycle',
        expectedOutput: 'true',
        testCode: `void main() {
  final a = ListNode(1);
  final b = ListNode(2);
  final c = ListNode(3);
  a.next = b;
  b.next = c;
  c.next = a; // cycle
  assert(hasCycle(a) == true);
  print("PASS_1");
}`,
      },
      {
        id: 'tc_cycle_2',
        name: 'Acyclic list terminates at null',
        expectedOutput: 'false',
        testCode: `void main() {
  final a = ListNode(1);
  final b = ListNode(2);
  a.next = b;
  assert(hasCycle(a) == false);
  print("PASS_2");
}`,
      },
      {
        id: 'tc_cycle_3',
        name: 'Single node pointing to null',
        expectedOutput: 'false',
        testCode: `void main() {
  final a = ListNode(100);
  assert(hasCycle(a) == false);
  print("PASS_3");
}`,
      },
    ],
    learningObjectives: [
      'Implement two-pointer fast/slow traversal in Dart',
      'Maintain O(1) auxiliary memory without allocating hash sets',
    ],
    estimatedMinutes: 4,
    hints: [
      { level: 1, title: 'Two pointers', content: 'Advance slow pointer by 1 step (\`slow = slow?.next\`), advance fast pointer by 2 steps (\`fast = fast.next?.next\`). If they meet (\`slow == fast\`), a cycle exists.' },
    ],
    explanation: {
      coreReasoning: 'Floyd\'s cycle-finding algorithm uses two pointers moving at different speeds (1 step vs 2 steps). If there is a loop, the distance between them decreases by 1 each step until they collide inside the loop. This requires strictly O(1) memory and O(N) time.',
      dartRule: 'Sound null-safe navigation with ?. prevents NoSuchMethodError when traversing linked pointer chains.',
    },
    sourceDesignation: 'verified_official',
  },
];
