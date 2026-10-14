import { defineEval } from "eve/evals";

// Each turn adds a large tool result, so every turn compacts. The cap path should
// leave the already-capped big_grep result alone; instead it is re-capped each time.
export default defineEval({
  async test(t) {
    let turn = await t.send("Search the repo.");
    t.log(turn.message ?? "(no message)");
    for (let i = 2; i <= 6; i += 1) {
      turn = await turn.session.send(`Read file ${i}.`);
      t.log(turn.message ?? "(no message)");
    }
    t.succeeded();
  },
});
