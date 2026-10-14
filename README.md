# eve-recap-repro

Minimal reproduction: eve's compaction re-caps tool results it already capped, once per
compaction, so the kept content shrinks while annotations and escape characters pile up.

Created with `npx eve@0.79.0 init`. Changes from the scaffold, all offline (no API key):

- `agent/agent.ts`: `mockModel` from `eve/evals` and `modelContextWindowTokens: 30_000`, so
  compaction runs. The mock calls `big_grep` on turn 1 and `pad` on each later turn, then
  reports what it can still see of the `big_grep` result.
- `agent/tools/big_grep.ts`: 400 grep lines ending in a `FAIL` line.
- `agent/tools/pad.ts`: 40,000 chars of new work per turn, so each turn compacts again.
- `evals/recap.eval.ts`: sends 6 turns and logs the model's report.

## Run

```bash
npm install
npx eve eval --verbose
```

## Output (eve 0.79.0)

```
[recap] turn 1: annotations=0 paths=400 backslashes=0 fail=true
[recap] turn 2: annotations=0 paths=400 backslashes=0 fail=true
[recap] turn 3: annotations=0 paths=400 backslashes=0 fail=true
[recap] turn 4: annotations=1 paths=60 backslashes=180 fail=false
[recap] turn 5: annotations=2 paths=48 backslashes=393 fail=false
[recap] turn 6: annotations=3 paths=35 backslashes=663 fail=false
```

Three `compaction.completed` events, all on the tool-result cap path: the mock answers summary
requests with `checkpoint`, and that text never appears.

Expected: after the first cap (turn 4), the `big_grep` result stays the same: one annotation,
60 paths. Cause: `capToolResults` in `packages/eve/src/harness/compaction/engine.ts` has no
already-capped check, and a capped result's serialized form exceeds `TRANSCRIPT_PAYLOAD_LIMIT`
again.
