"use client";

import * as React from "react";
import { Play, Send, Terminal, Clock, CheckCircle2, XCircle, Code, RotateCcw } from "lucide-react";

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  explanation?: string;
  isSample?: boolean;
}

export interface CodingQuestion {
  id: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  category?: string;
  description: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  testCases: TestCase[];
  starterCode?: Record<string, string>;
}

interface CodingExamIDEProps {
  question: CodingQuestion;
  durationMinutes: number;
  onSubmit: (submission: {
    code: string;
    language: string;
    timeSpentSeconds: number;
  }) => Promise<void>;
}

const DEFAULT_STARTER_CODE: Record<string, string> = {
  javascript: `/**
 * Complete the function below.
 * @param {string} input - Input parameter
 * @return {string} - Result output
 */
function solve(input) {
  // Write your code here
  return input;
}

// Read line from stdin or test input
const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim();
console.log(solve(input));`,
  typescript: `function solve(input: string): string {
  // Write your code here
  return input;
}

const input = "sample";
console.log(solve(input));`,
  python: `# Complete the function below
def solve(input_data: str) -> str:
    # Write your solution here
    return input_data.strip()

if __name__ == "__main__":
    import sys
    input_str = sys.stdin.read()
    print(solve(input_str))`,
  cpp: `#include <iostream>
#include <string>
using namespace std;

string solve(string input) {
    // Write your code here
    return input;
}

int main() {
    string input;
    if (cin >> input) {
        cout << solve(input) << endl;
    }
    return 0;
}`,
  java: `import java.util.Scanner;

public class Solution {
    public static String solve(String input) {
        // Write your code here
        return input;
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        if (scanner.hasNext()) {
            String input = scanner.next();
            System.out.println(solve(input));
        }
    }
}`
};

export function CodingExamIDE({ question, durationMinutes, onSubmit }: CodingExamIDEProps) {
  const [language, setLanguage] = React.useState<string>("python");
  const [code, setCode] = React.useState<string>("");
  const [activeTab, setActiveTab] = React.useState<"problem" | "testcases">("problem");
  const [terminalTab, setTerminalTab] = React.useState<"console" | "tests">("console");
  
  // Timer state
  const [secondsRemaining, setSecondsRemaining] = React.useState(durationMinutes * 60);
  const [startTime] = React.useState(Date.now());
  
  // Execution state
  const [running, setRunning] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [terminalLogs, setTerminalLogs] = React.useState<string[]>([
    "Terminal initialized.",
    "Ready for compilation and execution. Write your code and click 'Run Code' to execute against sample test cases."
  ]);
  const [executionResults, setExecutionResults] = React.useState<{
    passed: boolean;
    stdout?: string;
    stderr?: string;
    execTimeMs?: number;
    testCaseResults?: Array<{ id: string; passed: boolean; input: string; output: string; expected: string }>;
  } | null>(null);

  // Initialize starter code when language changes
  React.useEffect(() => {
    const starter = question.starterCode?.[language] || DEFAULT_STARTER_CODE[language] || DEFAULT_STARTER_CODE.python;
    setCode(starter);
  }, [language, question]);

  const handleFinalSubmit = React.useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    const timeSpentSeconds = Math.floor((Date.now() - startTime) / 1000);

    try {
      await onSubmit({
        code,
        language,
        timeSpentSeconds,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setTerminalLogs((prev) => [...prev, `Submission error: ${msg}`]);
    } finally {
      setSubmitting(false);
    }
  }, [submitting, startTime, onSubmit, code, language]);

  // Exam Countdown Interval
  React.useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (!submitting) {
            handleFinalSubmit();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [submitting, handleFinalSubmit]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleRunCode = async () => {
    setRunning(true);
    setTerminalTab("console");
    setTerminalLogs((prev) => [...prev, `\n> Executing [${language.toUpperCase()}] code against sample test cases...`]);

    try {
      const res = await fetch("/api/candidate/coding/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language,
          testCases: question.testCases,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Execution failed");

      setExecutionResults(data);
      if (data.testCaseResults) {
        const passedCount = data.testCaseResults.filter((t: { passed: boolean }) => t.passed).length;
        setTerminalLogs((prev) => [
          ...prev,
          `Status: ${data.passed ? "SUCCESS" : "TEST CASES FAILED"} (${passedCount}/${data.testCaseResults.length} passed)`,
          `Execution Time: ${data.execTimeMs || 42}ms`,
          data.stdout ? `stdout:\n${data.stdout}` : "",
          data.stderr ? `stderr:\n${data.stderr}` : "",
        ].filter(Boolean));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setTerminalLogs((prev) => [...prev, `[ERROR]: ${msg}`]);
    } finally {
      setRunning(false);
    }
  };

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case "easy":
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Easy</span>;
      case "hard":
        return <span className="bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Hard</span>;
      case "medium":
      default:
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Medium</span>;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#1e1e1e] text-zinc-100 overflow-hidden font-sans select-none">
      {/* Top Header Navbar */}
      <header className="h-14 bg-[#141414] border-b border-zinc-800 px-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
            <Code className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              {question.title} {getDifficultyBadge(question.difficulty)}
            </h1>
            <p className="text-[11px] text-zinc-400 font-medium">Coding Interview Assessment</p>
          </div>
        </div>

        {/* Center Live Countdown Timer */}
        <div className="flex items-center gap-2 bg-[#252526] px-3.5 py-1.5 rounded-xl border border-zinc-700 shadow-inner">
          <Clock className={`h-4 w-4 ${secondsRemaining < 300 ? "text-red-400 animate-pulse" : "text-emerald-400"}`} />
          <span className="text-xs font-mono font-bold text-zinc-200 tracking-wider">
            Time Remaining: <span className={secondsRemaining < 300 ? "text-red-400 font-extrabold" : "text-white"}>{formatTimer(secondsRemaining)}</span>
          </span>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-3">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-[#252526] border border-zinc-700 text-zinc-200 text-xs font-bold rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="python">Python 3</option>
            <option value="javascript">JavaScript (Node.js)</option>
            <option value="typescript">TypeScript</option>
            <option value="cpp">C++ (GCC)</option>
            <option value="java">Java 17</option>
          </select>

          <button
            onClick={handleRunCode}
            disabled={running || submitting}
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold px-3.5 py-1.5 rounded-lg border border-zinc-700 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Play className="h-3.5 w-3.5 text-emerald-400 fill-emerald-400" />
            {running ? "Running..." : "Run Code"}
          </button>

          <button
            onClick={handleFinalSubmit}
            disabled={submitting}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
            {submitting ? "Submitting..." : "Submit Exam"}
          </button>
        </div>
      </header>

      {/* Main Split Body Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Pane: Problem Description & Testcases */}
        <div className="w-1/2 border-r border-zinc-800 flex flex-col bg-[#181818] overflow-hidden">
          {/* Left Sub-header Tabs */}
          <div className="h-10 bg-[#141414] border-b border-zinc-800 flex items-center px-4 gap-4 text-xs font-bold">
            <button
              onClick={() => setActiveTab("problem")}
              className={`py-2 border-b-2 transition-colors cursor-pointer ${
                activeTab === "problem" ? "border-emerald-500 text-emerald-400" : "border-transparent text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Problem Description
            </button>
            <button
              onClick={() => setActiveTab("testcases")}
              className={`py-2 border-b-2 transition-colors cursor-pointer ${
                activeTab === "testcases" ? "border-emerald-500 text-emerald-400" : "border-transparent text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Sample Test Cases ({question.testCases.length})
            </button>
          </div>

          {/* Left Content Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-left text-zinc-300 text-sm leading-relaxed">
            {activeTab === "problem" ? (
              <>
                <div className="space-y-2">
                  <h2 className="text-lg font-bold text-zinc-100">{question.title}</h2>
                  <p className="whitespace-pre-line text-zinc-300">{question.description}</p>
                </div>

                <div className="space-y-2 pt-2 border-t border-zinc-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Input Format</h3>
                  <p className="text-xs font-mono bg-[#252526] p-3 rounded-lg border border-zinc-700/60">{question.inputFormat}</p>
                </div>

                <div className="space-y-2 pt-2 border-t border-zinc-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Output Format</h3>
                  <p className="text-xs font-mono bg-[#252526] p-3 rounded-lg border border-zinc-700/60">{question.outputFormat}</p>
                </div>

                <div className="space-y-2 pt-2 border-t border-zinc-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Constraints</h3>
                  <p className="text-xs font-mono bg-[#252526] p-3 rounded-lg border border-zinc-700/60">{question.constraints}</p>
                </div>

                <div className="space-y-3 pt-2 border-t border-zinc-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Examples</h3>
                  {question.testCases.map((tc, idx) => (
                    <div key={tc.id} className="bg-[#252526] rounded-xl border border-zinc-700/60 p-4 space-y-2 text-xs font-mono">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Example {idx + 1}</span>
                      <div>
                        <span className="text-zinc-400 block font-sans">Input:</span>
                        <code className="text-zinc-100 font-bold block pt-0.5">{tc.input}</code>
                      </div>
                      <div>
                        <span className="text-zinc-400 block font-sans">Expected Output:</span>
                        <code className="text-emerald-300 font-bold block pt-0.5">{tc.expectedOutput}</code>
                      </div>
                      {tc.explanation && (
                        <div className="pt-1 text-zinc-400 font-sans text-[11px] border-t border-zinc-700/40">
                          <span className="font-bold text-zinc-300">Explanation:</span> {tc.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Sample Test Suite</h3>
                {question.testCases.map((tc, idx) => (
                  <div key={tc.id} className="bg-[#252526] rounded-xl border border-zinc-700/60 p-4 space-y-2 text-xs font-mono text-left">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-zinc-200 font-sans">Test Case #{idx + 1}</span>
                      <span className="text-[9px] font-bold bg-zinc-700 text-zinc-300 px-2 py-0.5 rounded-full uppercase">Sample</span>
                    </div>
                    <div>
                      <span className="text-zinc-400 text-[11px]">Input:</span>
                      <pre className="bg-[#181818] p-2.5 rounded-lg text-zinc-200 mt-1 overflow-x-auto border border-zinc-700">{tc.input}</pre>
                    </div>
                    <div>
                      <span className="text-zinc-400 text-[11px]">Expected Output:</span>
                      <pre className="bg-[#181818] p-2.5 rounded-lg text-emerald-400 mt-1 overflow-x-auto border border-zinc-700">{tc.expectedOutput}</pre>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: IDE Code Editor & Interactive Terminal Console */}
        <div className="w-1/2 flex flex-col bg-[#1e1e1e] overflow-hidden">
          {/* Top Half: Code Editor Window */}
          <div className="flex-1 flex flex-col bg-[#1e1e1e] overflow-hidden border-b border-zinc-800">
            {/* Editor Sub-header */}
            <div className="h-10 bg-[#141414] border-b border-zinc-800 px-4 flex items-center justify-between text-xs font-mono text-zinc-400">
              <span className="flex items-center gap-2">
                <Code className="h-3.5 w-3.5 text-emerald-400" />
                solution.{language === "python" ? "py" : language === "javascript" ? "js" : language === "typescript" ? "ts" : language === "cpp" ? "cpp" : "java"}
              </span>
              <button
                onClick={() => setCode(question.starterCode?.[language] || DEFAULT_STARTER_CODE[language] || "")}
                className="hover:text-zinc-200 flex items-center gap-1 transition-colors cursor-pointer text-[11px]"
              >
                <RotateCcw className="h-3 w-3" /> Reset Template
              </button>
            </div>

            {/* Custom Monospaced IDE Code Textarea */}
            <div className="flex-1 relative bg-[#1e1e1e] p-4 font-mono text-xs text-zinc-100 overflow-auto">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                className="w-full h-full bg-transparent text-zinc-100 font-mono text-xs leading-relaxed focus:outline-none resize-none selection:bg-emerald-500/30"
              />
            </div>
          </div>

          {/* Bottom Half: Integrated Terminal Output Console */}
          <div className="h-64 flex flex-col bg-[#141414] text-xs font-mono overflow-hidden">
            {/* Terminal Sub-header */}
            <div className="h-9 bg-[#1c1c1c] border-b border-zinc-800 px-4 flex items-center justify-between text-xs text-zinc-400 font-sans">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setTerminalTab("console")}
                  className={`flex items-center gap-1.5 font-bold transition-colors cursor-pointer ${
                    terminalTab === "console" ? "text-emerald-400" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <Terminal className="h-3.5 w-3.5" /> Interactive Terminal
                </button>
                {executionResults?.testCaseResults && (
                  <button
                    onClick={() => setTerminalTab("tests")}
                    className={`flex items-center gap-1.5 font-bold transition-colors cursor-pointer ${
                      terminalTab === "tests" ? "text-emerald-400" : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Test Case Output
                  </button>
                )}
              </div>

              {running && (
                <span className="text-[10px] text-emerald-400 animate-pulse font-bold flex items-center gap-1">
                  Executing...
                </span>
              )}
            </div>

            {/* Terminal Log Console */}
            <div className="flex-1 p-4 overflow-y-auto space-y-1 text-left">
              {terminalTab === "console" ? (
                terminalLogs.map((log, idx) => (
                  <div key={idx} className="whitespace-pre-wrap text-zinc-300 leading-relaxed font-mono">
                    {log}
                  </div>
                ))
              ) : (
                <div className="space-y-3">
                  {executionResults?.testCaseResults?.map((res, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border text-xs font-mono ${
                        res.passed ? "bg-emerald-950/20 border-emerald-800/40 text-emerald-300" : "bg-red-950/20 border-red-800/40 text-red-300"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold font-sans">Test Case #{idx + 1}</span>
                        <span className="font-bold flex items-center gap-1">
                          {res.passed ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <XCircle className="h-3.5 w-3.5 text-red-400" />}
                          {res.passed ? "Passed" : "Failed"}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-400 font-sans">Input: <code className="text-zinc-200">{res.input}</code></div>
                      <div className="text-[11px] text-zinc-400 font-sans">Output: <code className="text-zinc-100">{res.output || "<empty>"}</code></div>
                      <div className="text-[11px] text-zinc-400 font-sans">Expected: <code className="text-emerald-400">{res.expected}</code></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
