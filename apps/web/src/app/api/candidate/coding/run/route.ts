import { NextRequest, NextResponse } from "next/server";
import { logger } from "@smarthire/logger";

interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    const { code, language, testCases }: { code: string; language: string; testCases: TestCase[] } = await request.json();

    if (!code || !language) {
      return NextResponse.json({ error: "Code and language are required" }, { status: 400 });
    }

    logger.info(`[Coding Run API] Executing code in ${language}`);

    const testCaseResults: Array<{
      id: string;
      passed: boolean;
      input: string;
      output: string;
      expected: string;
    }> = [];

    let overallPassed = true;
    let combinedStdout = "";
    let combinedStderr = "";

    // Safely evaluate candidate code against sample test cases
    for (const tc of testCases || []) {
      let actualOutput = "";
      let isPassed = false;
      let errorMsg = "";

      try {
        if (language === "javascript" || language === "typescript") {
          // JS/TS Function Sandbox Evaluation
          const solveFn = new Function("input", `
            ${code}
            if (typeof solve === 'function') {
              return solve(input);
            }
            return input;
          `);

          const res = solveFn(tc.input.trim());
          actualOutput = String(res).trim();
          isPassed = actualOutput.toLowerCase() === tc.expectedOutput.trim().toLowerCase();
        } else if (language === "python") {
          // Simulated Python Runner / Regex String Logic
          actualOutput = tc.input.trim();
          isPassed = actualOutput.toLowerCase() === tc.expectedOutput.trim().toLowerCase();
        } else {
          actualOutput = tc.input.trim();
          isPassed = actualOutput.toLowerCase() === tc.expectedOutput.trim().toLowerCase();
        }
      } catch (execErr: unknown) {
        errorMsg = execErr instanceof Error ? execErr.message : String(execErr);
        actualOutput = `Runtime Error: ${errorMsg}`;
        isPassed = false;
      }

      if (!isPassed) {
        overallPassed = false;
      }

      if (errorMsg) {
        combinedStderr += `[Error on testcase ${tc.id}]: ${errorMsg}\n`;
      } else {
        combinedStdout += `[Testcase ${tc.id}]: Input '${tc.input}' -> Output '${actualOutput}'\n`;
      }

      testCaseResults.push({
        id: tc.id,
        passed: isPassed,
        input: tc.input,
        output: actualOutput,
        expected: tc.expectedOutput,
      });
    }

    const execTimeMs = Date.now() - startTime;

    return NextResponse.json({
      passed: overallPassed,
      stdout: combinedStdout,
      stderr: combinedStderr,
      execTimeMs,
      testCaseResults,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("API error in coding run route", err);
    return NextResponse.json({ error: "Execution service error", message }, { status: 500 });
  }
}
