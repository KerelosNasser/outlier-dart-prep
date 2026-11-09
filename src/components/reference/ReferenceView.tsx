import React from 'react';
import { ExternalLink, BookOpen, ShieldCheck, CheckCircle2, Bookmark } from 'lucide-react';
import { PatternVisualizer } from './PatternVisualizer';

export const ReferenceView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white tracking-tight">Official Dart 3 Reference & Research Library</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Authoritative specifications, Effective Dart style rules, and research integrity classifications.
        </p>
      </div>

      {/* Official Documentation Links Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: 'Dart Language Tour',
            desc: 'Official language specification covering syntax, types, records, and class modifiers.',
            url: 'https://dart.dev/language',
          },
          {
            title: 'Effective Dart Guide',
            desc: 'Mandatory style and usage rules (Style, Documentation, Usage, Design).',
            url: 'https://dart.dev/effective-dart',
          },
          {
            title: 'Dart Core API Reference',
            desc: 'Standard library APIs: dart:core, dart:async, dart:collection, dart:isolate.',
            url: 'https://api.dart.dev/',
          },
          {
            title: 'Dart Testing Guide',
            desc: 'Official package:test unit and async testing documentation.',
            url: 'https://dart.dev/testing',
          },
        ].map((link, i) => (
          <a
            key={i}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className="p-4 bg-[#111827] border border-slate-800 hover:border-slate-700 rounded-lg transition-all hover:bg-slate-800/40 group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-sky-400 mb-1">
                <span>OFFICIAL DOCS</span>
                <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">{link.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{link.desc}</p>
            </div>
          </a>
        ))}
      </div>

      {/* Modern Dart 3 Architectural Cheat Sheet */}
      <div className="bg-[#111827] border border-slate-800 rounded-lg p-6 space-y-6">
        <h2 className="text-base font-bold text-white">Modern Dart 3 Architectural Cheat Sheet</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono text-slate-300">
          {/* Box 1: Records & Patterns */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded space-y-2">
            <div className="text-sky-400 font-bold font-sans">1. Records & Pattern Matching (Dart 3.0)</div>
            <pre className="text-[11px] leading-relaxed text-slate-200 overflow-x-auto">
{`// Records: anonymous typed tuples
final record = ('John', age: 30);
print(record.$1);     // Positional: 'John'
print(record.age);    // Named: 30

// Pattern matching switch expression
final label = switch (record) {
  (String name, age: >= 18) => 'Adult: $name',
  _ => 'Other',
};`}
            </pre>
          </div>

          {/* Box 2: Sound Null Safety */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded space-y-2">
            <div className="text-emerald-400 font-bold font-sans">2. Sound Flow Analysis & Promotion</div>
            <pre className="text-[11px] leading-relaxed text-slate-200 overflow-x-auto">
{`// Promotion on local variables:
void handle(String? text) {
  if (text == null) return;
  // text is promoted to non-nullable String!
  print(text.toUpperCase());
}

// Shadow instance fields to promote safely:
final localVal = this.publicField;
if (localVal != null) { /* safe */ }`}
            </pre>
          </div>

          {/* Box 3: Class Modifiers */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded space-y-2">
            <div className="text-amber-400 font-bold font-sans">3. Class Modifiers (Dart 3.0)</div>
            <pre className="text-[11px] leading-relaxed text-slate-200 overflow-x-auto">
{`// sealed: closed hierarchy, exhaustive switch
sealed class Result<T> {}
class Success<T> extends Result<T> { final T val; Success(this.val); }
class Failure<T> extends Result<T> { final String err; Failure(this.err); }

// base: can only be extended, not implemented
base class Vehicle {}

// final: cannot be extended or implemented outside
final class Config {}`}
            </pre>
          </div>

          {/* Box 4: Event Loop & Microtasks */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded space-y-2">
            <div className="text-purple-400 font-bold font-sans">4. Event Loop Scheduling Order</div>
            <pre className="text-[11px] leading-relaxed text-slate-200 overflow-x-auto">
{`// 1. Synchronous main() execution
// 2. Microtask Queue (scheduleMicrotask, Future.microtask)
//    - ALWAYS drained completely before event queue!
// 3. Event Queue (Future, Future.delayed, I/O timers)
// 4. Isolates for true multi-core CPU parallelism:
final result = await Isolate.run(() => heavyWork());`}
            </pre>
          </div>
        </div>
      </div>

      {/* Interactive Pattern Matching & AST Visualizer */}
      <PatternVisualizer />

      {/* Research Integrity Classification Record */}
      <div className="bg-[#111827] border border-slate-800 rounded-lg p-6 space-y-4 text-xs">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Research Integrity & Verification Record</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div className="p-3.5 bg-slate-900 border border-slate-800 rounded space-y-1">
            <span className="text-[10px] font-mono text-emerald-400 font-bold">VERIFIED</span>
            <div className="font-semibold text-slate-200">Official Specifications</div>
            <p className="text-[11px] text-slate-400">
              Sound null safety, Dart 3 records, class modifiers, and core APIs confirmed via dart.dev official documentation.
            </p>
          </div>
          <div className="p-3.5 bg-slate-900 border border-slate-800 rounded space-y-1">
            <span className="text-[10px] font-mono text-sky-400 font-bold">REPORTED</span>
            <div className="font-semibold text-slate-200">Contributor Experiences</div>
            <p className="text-[11px] text-slate-400">
              Side-by-side model comparison, bug diagnosis, and justification writing reported by active AI coding specialists.
            </p>
          </div>
          <div className="p-3.5 bg-slate-900 border border-slate-800 rounded space-y-1">
            <span className="text-[10px] font-mono text-amber-400 font-bold">INFERRED</span>
            <div className="font-semibold text-slate-200">Preparation Recommendations</div>
            <p className="text-[11px] text-slate-400">
              Edge-case null testing, Big-O analysis, and rate-limiter simulations structured as optimal preparation drills.
            </p>
          </div>
          <div className="p-3.5 bg-slate-900 border border-slate-800 rounded space-y-1">
            <span className="text-[10px] font-mono text-slate-500 font-bold">UNKNOWN</span>
            <div className="font-semibold text-slate-200">Proprietary Secrets</div>
            <p className="text-[11px] text-slate-400">
              Live passing cutoffs and private assessment questions are intentionally not claimed or guessed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
