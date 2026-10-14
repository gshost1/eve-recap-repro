import { defineAgent } from "eve";
import { mockModel } from "eve/evals";

// Deterministic, offline model. Turn 1 calls big_grep; every later turn calls pad.
// After each tool result it reports what it can still see of the big_grep result.
export default defineAgent({
  model: mockModel(({ messages, toolResults, userMessageCount }) => {
    if (messages.some((m) => m.role === "system" && m.text.includes("CONTEXT CHECKPOINT"))) {
      return "checkpoint";
    }
    const last = messages.at(-1);
    if (last?.role === "user") {
      return { toolCalls: [{ name: userMessageCount === 1 ? "big_grep" : "pad", input: {} }] };
    }
    const grep = toolResults.find((r) => r.name === "big_grep");
    if (grep === undefined) return `turn ${userMessageCount}: big_grep result gone`;
    const value = typeof grep.output === "string" ? grep.output : JSON.stringify(grep.output);
    const annotations = value.match(/Truncated by eve/g)?.length ?? 0;
    const paths = new Set(value.match(/module_\d+\.ts/g)).size;
    const backslashes = value.match(/\\/g)?.length ?? 0;
    return `turn ${userMessageCount}: annotations=${annotations} paths=${paths} backslashes=${backslashes} fail=${value.includes("FAIL src/auth")}`;
  }),
  modelContextWindowTokens: 30_000,
});
