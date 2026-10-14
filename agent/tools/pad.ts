import { defineTool } from "eve/tools";
import { z } from "zod";

// Bulky new work each turn, so compaction is genuinely due again.
export default defineTool({
  description: "Read a large file.",
  inputSchema: z.object({}),
  async execute() {
    return "x".repeat(40_000);
  },
});
