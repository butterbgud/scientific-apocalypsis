import { assignTask, drawTaskChoices, resolveTask, setup } from "../src/engine";

function stateOf<T extends { state: unknown }>(result: T | { error: string }) {
  if ("error" in result) throw new Error(result.error);
  return result.state as any;
}

let state = stateOf(setup(42));
state = stateOf(drawTaskChoices(state));
const task = state.taskChoices[0];
const beforeResources = { ...state.players[0].resources };
const beforeTracks = { ...state.tracks };
state = stateOf(assignTask(state, task, "agent.flamenko", "region.0"));
state = stateOf(resolveTask(state, task, 6));

const changedResource = Object.keys(beforeResources).some((key) => state.players[0].resources[key as keyof typeof beforeResources] !== beforeResources[key as keyof typeof beforeResources]);
const changedTrack = Object.keys(beforeTracks).some((key) => state.tracks[key as keyof typeof beforeTracks] !== beforeTracks[key as keyof typeof beforeTracks]);
if (!changedTrack || state.history.at(-1)?.type !== "task_critical") throw new Error("Fixture did not apply the selected task rewards.");
console.log("kernel smoke passed", state.history.map((event: { type: string }) => event.type).join(" -> "));
