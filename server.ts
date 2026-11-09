import express, { Request, Response } from 'express';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '1mb' }));

// Health and SDK capability probe
app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    const dartProc = spawn('dart', ['--version']);
    let versionOutput = '';
    dartProc.stdout.on('data', (d) => { versionOutput += d.toString(); });
    dartProc.stderr.on('data', (d) => { versionOutput += d.toString(); });
    dartProc.on('close', (code) => {
      res.json({
        status: 'online',
        sdkAvailable: code === 0,
        version: versionOutput.trim() || 'Dart SDK 3.13.7 (stable)',
        sandboxMode: 'native_subprocess',
      });
    });
  } catch (err: any) {
    res.json({
      status: 'limited',
      sdkAvailable: false,
      error: err.message,
      sandboxMode: 'fallback_evaluator',
    });
  }
});

// Run Dart code in an isolated temporary directory with timeout protection
app.post('/api/dart/run', async (req: Request, res: Response) => {
  const { code, tests, timeoutMs = 4000 } = req.body;

  if (!code || typeof code !== 'string') {
    res.status(400).json({ success: false, error: 'Source code is required' });
    return;
  }

  // Create isolated sandbox folder
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dart-run-'));
  const filePath = path.join(tempDir, 'main.dart');

  // Prepare source code: handle test harness linkage and entry point requirements
  let fullCode = code;
  if (tests && typeof tests === 'string') {
    // If unit tests are attached, avoid duplicate main collision
    let sanitizedUserCode = code;
    if (/(\bvoid\s+main\b|\bmain\s*\()/.test(tests)) {
      sanitizedUserCode = sanitizedUserCode.replace(/\bvoid\s+main\s*\(/g, 'void __student_main(');
      sanitizedUserCode = sanitizedUserCode.replace(/\bmain\s*\(/g, '__student_main(');
    }
    fullCode = `${sanitizedUserCode}\n\n// --- TEST HARNESS ---\n${tests}`;
  } else {
    // If running standalone without main(), append entry point so Dart doesn't error
    if (!/(\bvoid\s+main\b|\bmain\s*\()/.test(code)) {
      fullCode = `${code}\n\nvoid main() {\n  print("// Code compiled and executed successfully (no main() declared).");\n}`;
    }
  }

  fs.writeFileSync(filePath, fullCode, 'utf8');

  const startTime = Date.now();
  let stdout = '';
  let stderr = '';
  let killed = false;

  // Sanitized environment: never expose process.env credentials to user code
  const sanitizedEnv = {
    PATH: process.env.PATH || '/usr/local/bin:/usr/bin:/bin',
    HOME: tempDir,
    TEMP: tempDir,
    TMPDIR: tempDir,
  };

  const child = spawn('dart', ['run', filePath], {
    cwd: tempDir,
    env: sanitizedEnv,
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  const timer = setTimeout(() => {
    killed = true;
    child.kill('SIGKILL');
  }, Math.min(Math.max(timeoutMs, 1000), 10000));

  child.stdout.on('data', (data) => {
    if (stdout.length < 50000) {
      stdout += data.toString();
    }
  });

  child.stderr.on('data', (data) => {
    if (stderr.length < 50000) {
      stderr += data.toString();
    }
  });

  child.on('close', (exitCode) => {
    clearTimeout(timer);
    const durationMs = Date.now() - startTime;

    // Clean up temporary sandbox directory
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup error
    }

    if (killed) {
      res.json({
        success: false,
        timedOut: true,
        exitCode: -1,
        stdout,
        stderr: `Execution timed out after ${timeoutMs}ms. Check for infinite loops or unyielding async operations.`,
        durationMs,
      });
      return;
    }

    // Determine error type (compile vs runtime)
    const isCompileError = stderr.includes('Error:') || stderr.includes('Error compiling');
    const isRuntimeError = exitCode !== 0 && !isCompileError;

    res.json({
      success: exitCode === 0,
      exitCode,
      stdout,
      stderr,
      isCompileError,
      isRuntimeError,
      durationMs,
    });
  });

  child.on('error', (err) => {
    clearTimeout(timer);
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {}

    res.status(500).json({
      success: false,
      error: `Failed to execute Dart process: ${err.message}`,
    });
  });
});

// Run Dart static analysis on snippet with structured JSON diagnostics
app.post('/api/dart/analyze', async (req: Request, res: Response) => {
  const { code } = req.body;
  if (!code || typeof code !== 'string') {
    res.status(400).json({ success: false, error: 'Source code is required' });
    return;
  }

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dart-analyze-'));
  const filePath = path.join(tempDir, 'main.dart');
  fs.writeFileSync(filePath, code, 'utf8');

  // Request JSON format from dart analyze for precise AST / compiler diagnostics
  const child = spawn('dart', ['analyze', '--format=json', filePath], {
    cwd: tempDir,
    env: { PATH: process.env.PATH || '/usr/local/bin:/usr/bin:/bin' },
  });

  let rawOutput = '';
  child.stdout.on('data', (d) => { rawOutput += d.toString(); });
  child.stderr.on('data', (d) => { rawOutput += d.toString(); });

  child.on('close', (exitCode) => {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {}

    interface ParsedDiagnostic {
      code: string;
      severity: 'error' | 'warning' | 'info';
      message: string;
      correction?: string;
      documentation?: string;
      startLine: number;
      startColumn: number;
      endLine: number;
      endColumn: number;
    }

    const diagnostics: ParsedDiagnostic[] = [];
    let clean = exitCode === 0;

    try {
      const parsed = JSON.parse(rawOutput.trim());
      if (parsed && Array.isArray(parsed.diagnostics)) {
        for (const item of parsed.diagnostics) {
          const sevRaw = (item.severity || '').toUpperCase();
          const severity: 'error' | 'warning' | 'info' = 
            sevRaw === 'ERROR' ? 'error' : sevRaw === 'WARNING' ? 'warning' : 'info';
          
          const range = item.location?.range;
          const startLine = range?.start?.line ?? 1;
          const startColumn = range?.start?.column ?? 1;
          const endLine = range?.end?.line ?? startLine;
          const endColumn = range?.end?.column ?? (startColumn + 4);

          diagnostics.push({
            code: item.code || 'dart_analyzer_issue',
            severity,
            message: item.problemMessage || 'Static analysis issue',
            correction: item.correctionMessage,
            documentation: item.documentation,
            startLine,
            startColumn,
            endLine,
            endColumn,
          });
        }
      }
    } catch {
      // Fallback: Parse standard plain text dart analyze output if json was not output
      const regex = /^\s*(error|warning|info)\s*[-•]\s*(.*?):(\d+):(\d+)\s*[-•]\s*(.*?)(?:\s*[-•]\s*(\S+))?$/gmi;
      let match;
      while ((match = regex.exec(rawOutput)) !== null) {
        const severityStr = match[1].toLowerCase() as 'error' | 'warning' | 'info';
        const line = parseInt(match[3], 10) || 1;
        const col = parseInt(match[4], 10) || 1;
        const message = match[5]?.trim() || 'Analyzer issue';
        const ruleCode = match[6]?.trim() || '';

        diagnostics.push({
          code: ruleCode,
          severity: severityStr,
          message,
          startLine: line,
          startColumn: col,
          endLine: line,
          endColumn: col + 5,
        });
      }
    }

    const errorCount = diagnostics.filter(d => d.severity === 'error').length;
    const warningCount = diagnostics.filter(d => d.severity === 'warning').length;
    const infoCount = diagnostics.filter(d => d.severity === 'info').length;

    clean = errorCount === 0 && warningCount === 0;

    res.json({
      clean,
      errorCount,
      warningCount,
      infoCount,
      diagnostics,
      output: clean 
        ? 'No issues found! Code conforms to Dart 3 sound type system.' 
        : `${errorCount} error(s), ${warningCount} warning(s), ${infoCount} hint(s) identified.`,
      raw: rawOutput.trim(),
    });
  });
});

// Format Dart code according to Effective Dart
app.post('/api/dart/format', async (req: Request, res: Response) => {
  const { code } = req.body;
  if (!code || typeof code !== 'string') {
    res.status(400).json({ success: false, error: 'Source code is required' });
    return;
  }

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dart-format-'));
  const filePath = path.join(tempDir, 'main.dart');
  fs.writeFileSync(filePath, code, 'utf8');

  const child = spawn('dart', ['format', filePath], {
    cwd: tempDir,
    env: { PATH: process.env.PATH || '/usr/local/bin:/usr/bin:/bin' },
  });

  child.on('close', (exitCode) => {
    let formattedCode = code;
    if (exitCode === 0) {
      formattedCode = fs.readFileSync(filePath, 'utf8');
    }
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {}

    res.json({
      success: exitCode === 0,
      formattedCode,
    });
  });
});

// Mount Vite or serve static files
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Outlier Dart Mastery Lab server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
