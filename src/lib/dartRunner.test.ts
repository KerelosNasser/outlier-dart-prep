import test from 'node:test';
import assert from 'node:assert/strict';
import { executeDartCode, analyzeDartCode, formatDartCode } from './dartRunner.ts';

test('analyzeDartCode identifies type mismatches and returns structured diagnostics', async () => {
  const code = 'void main() { int x = "not a number"; }';
  const result = await analyzeDartCode(code);

  assert.strictEqual(typeof result.clean, 'boolean');
  assert.ok(result.diagnostics.length > 0, 'Expected diagnostics to be populated');
  
  const typeError = result.diagnostics.find(d => d.code === 'invalid_assignment' || d.severity === 'error');
  assert.ok(typeError, 'Expected an invalid_assignment or error diagnostic');
  assert.strictEqual(typeError.severity, 'error');
  assert.ok(typeError.startLine >= 1);
  assert.ok(typeError.startColumn >= 1);
});

test('analyzeDartCode marks clean code as clean with 0 diagnostics', async () => {
  const code = 'void main() { print("Hello Dart 3"); }';
  const result = await analyzeDartCode(code);

  assert.strictEqual(result.clean, true);
  assert.strictEqual(result.errorCount, 0);
  assert.strictEqual(result.diagnostics.length, 0);
});

test('formatDartCode formats code cleanly with Effective Dart rules', async () => {
  const messyCode = 'void main(){int a=1;int b=2;print(a+b);}';
  const result = await formatDartCode(messyCode);

  assert.strictEqual(result.success, true);
  assert.ok(result.formattedCode.includes('\n'), 'Formatted code should have multiple lines');
});
