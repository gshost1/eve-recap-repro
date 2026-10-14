import { defineTool } from "eve/tools";
import { z } from "zod";

// 400 matches ending in a test failure: a typical large grep / test-run output.
export default defineTool({
  description: "Search the repository.",
  inputSchema: z.object({}),
  async execute() {
    const lines = Array.from({ length: 400 }, (_, i) => `src/app/module_${i}.ts:${i + 10}: "ok"`);
    lines.push('FAIL src/auth/session.test.ts > TypeError: Cannot read properties of undefined (reading "token")');
    return lines.join("\n");
  },
});
