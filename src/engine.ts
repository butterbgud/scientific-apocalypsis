export type Resource = "capital" | "connections" | "authority";
export type Track = "enlightenment" | "social_progress" | "natural_progress" | "technical_progress";
export type Phase = "purchase" | "task_selection" | "actions" | "resolution" | "end";

export type TaskCard = {
  id: string;
  title: string;
  image: string;
  deck: "capital" | "connections" | "mission";
  cost: number;
  characteristic: keyof Agent["characteristics"];
  difficulty: number;
  reward: Partial<Record<Resource, number>>;
  trackReward: Partial<Record<Track, number>>;
};

export type Agent = {
  id: string;
  name: string;
  characteristics: Record<"intelligence" | "willpower" | "charisma" | "machiavellianism" | "narcissism" | "psychopathy", number>;
  classes: string[];
  ownerId: string;
  location: string | null;
  injured: boolean;
};

export type Region = { id: string; name: string; capacity: number; assignments: string[] };
export type Assignment = { taskId: string; agentId: string; helperIds: string[]; regionId: string; paid: number };
export type Player = { id: string; name: string; resources: Record<Resource, number>; agents: string[]; hand: string[]; sentThisRound: number };
export type Event = { type: string; message: string; data?: Record<string, unknown> };

export type GameState = {
  tutorial: boolean;
  seed: number;
  phase: Phase;
  round: number;
  currentPlayerId: string;
  tracks: Record<Track, number>;
  players: Player[];
  agents: Record<string, Agent>;
  regions: Record<string, Region>;
  tasks: Record<string, TaskCard>;
  taskDeck: string[];
  taskChoices: string[];
  assignments: Assignment[];
  history: Event[];
  outcome: "victory" | "loss" | null;
};

export type Result<T = GameState> = { state: T; events: Event[] } | { error: string };

const fixtureTasks: TaskCard[] = [
  { id: "task.capital.microwave", title: "Карта капитала", image: "capital/microwave.webp", deck: "capital", cost: 1, characteristic: "psychopathy", difficulty: 3, reward: { capital: 2 }, trackReward: { enlightenment: 1 } },
  { id: "task.connections.flat-earth", title: "Карта связей", image: "connections/flat_earth.webp", deck: "connections", cost: 1, characteristic: "charisma", difficulty: 3, reward: { connections: 2 }, trackReward: { social_progress: 1 } },
  { id: "task.mission.digital-religion", title: "Карта миссии", image: "missions/5g_towers.webp", deck: "mission", cost: 2, characteristic: "machiavellianism", difficulty: 4, reward: { authority: 1 }, trackReward: { technical_progress: 1 } },
  { id: "task.capital.herbs", title: "Карта капитала", image: "capital/herbs.webp", deck: "capital", cost: 1, characteristic: "intelligence", difficulty: 2, reward: { capital: 1 }, trackReward: { natural_progress: 1 } },
];

const starterAgent: Omit<Agent, "ownerId"> = {
  id: "agent.flamenko",
  name: "Павел Фламинго",
  characteristics: { intelligence: 2, willpower: 2, charisma: 3, machiavellianism: 1, narcissism: 2, psychopathy: 2 },
  classes: ["healer"],
  location: null,
  injured: false,
};

function rng(seed: number): { next: () => number; seed: () => number } {
  let value = seed >>> 0;
  return { next: () => ((value = (value * 1664525 + 1013904223) >>> 0) / 0x100000000), seed: () => value };
}

function result(state: GameState, events: Event[]): Result {
  return { state: { ...state, history: [...state.history, ...events] }, events };
}

function fail(message: string): Result { return { error: message }; }

export function setup(seed = 1, playerCount = 2, tutorial = false): Result {
  if (playerCount !== 2) return fail("MVP setup supports exactly two players.");
  const random = rng(seed);
  const ids = Array.from({ length: 3 }, () => fixtureTasks.map((task) => task.id)).flat().sort(() => random.next() - 0.5);
  const regions = ["Anglosaxony", "Asian Republics", "Sharia Countries", "Third World", "Soviet Countries"];
  const players: Player[] = [0, 1].map((index) => ({ id: `player.${index}`, name: index === 0 ? "You" : "Bot", resources: { capital: 5, connections: 4, authority: 1 }, agents: [], hand: [], sentThisRound: 0 }));
  const agents: Record<string, Agent> = {};
  for (const [index, player] of players.entries()) {
    const id = index === 0 ? starterAgent.id : "agent.bot.flamingo";
    agents[id] = { ...starterAgent, id, name: index === 0 ? starterAgent.name : "Александр Окружной", ownerId: player.id };
    player.agents.push(id);
  }
  if (tutorial) {
    agents["agent.flamenko"] = { ...agents["agent.flamenko"], name: "Алексей Трёхкорочкин", classes: ["spiritual_leader"] };
  }
  const tutorialCards = ["task.connections.flat-earth", "task.capital.microwave", "task.capital.herbs"];
  const tutorialDeck = [...tutorialCards, ...ids.filter((id) => !tutorialCards.includes(id))];
  return result({ tutorial, seed: random.seed(), phase: "task_selection", round: 1, currentPlayerId: "player.0", tracks: { enlightenment: tutorial ? 7 : 0, social_progress: tutorial ? 4 : 0, natural_progress: tutorial ? 4 : 0, technical_progress: tutorial ? 4 : 0 }, players, agents, regions: Object.fromEntries(regions.map((name, index) => [`region.${index}`, { id: `region.${index}`, name, capacity: 2, assignments: [] }])), tasks: Object.fromEntries(fixtureTasks.map((task) => [task.id, task])), taskDeck: tutorial ? tutorialDeck : ids, taskChoices: [], assignments: [], history: [], outcome: null }, [{ type: "setup", message: tutorial ? "Tutorial match initialized from the rulebook setup." : "Two-player game initialized." }]);
}

export function drawTaskChoices(state: GameState): Result {
  if (state.phase !== "task_selection") return fail("Tasks can only be drawn during task selection.");
  if (state.taskDeck.length < 3) return fail("The task deck does not contain three cards.");
  const choices = state.taskDeck.slice(0, 3);
  return result({ ...state, phase: "actions", taskDeck: state.taskDeck.slice(3), taskChoices: choices }, [{ type: "draw_tasks", message: "Three task choices drawn.", data: { choices } }]);
}

export function assignTask(state: GameState, taskId: string, agentId: string, regionId: string): Result {
  if (state.phase !== "actions") return fail("Agents can only be assigned during the action phase.");
  const player = state.players.find((candidate) => candidate.id === state.currentPlayerId);
  const task = state.tasks[taskId]; const agent = state.agents[agentId]; const region = state.regions[regionId];
  if (!player || !task || !agent || !region || !state.taskChoices.includes(taskId)) return fail("Task, agent, or region is not available.");
  if (agent.ownerId !== player.id) return fail("You may only send your own agent.");
  if (player.sentThisRound >= 2) return fail("A player may send at most two agents per round.");
  if (region.assignments.length >= region.capacity) return fail("That region is full.");
  if (player.resources[task.deck === "capital" ? "capital" : task.deck === "connections" ? "connections" : "authority"] < task.cost) return fail("Insufficient resources to pay this task.");
  const resource: Resource = task.deck === "capital" ? "capital" : task.deck === "connections" ? "connections" : "authority";
  const nextPlayer = { ...player, resources: { ...player.resources, [resource]: player.resources[resource] - task.cost }, sentThisRound: player.sentThisRound + 1 };
  const assignment = { taskId, agentId, helperIds: [], regionId, paid: task.cost };
  return result({ ...state, phase: "resolution", players: state.players.map((candidate) => candidate.id === player.id ? nextPlayer : candidate), agents: { ...state.agents, [agentId]: { ...agent, location: regionId } }, regions: { ...state.regions, [regionId]: { ...region, assignments: [...region.assignments, taskId] } }, assignments: [...state.assignments, assignment] }, [{ type: "assign_task", message: `${agent.name} assigned to ${task.title}.`, data: { taskId, agentId, regionId } }]);
}

export function addHelper(state: GameState, taskId: string, helperId: string): Result {
  const assignment = state.assignments.find((candidate) => candidate.taskId === taskId);
  const helper = state.agents[helperId];
  if (state.phase !== "resolution" || !assignment || !helper) return fail("No matching task assignment exists.");
  if (assignment.helperIds.length >= 3) return fail("A task cannot have more than three helpers.");
  if (assignment.agentId === helperId || helper.ownerId !== state.currentPlayerId) return fail("That agent cannot be added as a helper.");
  return result({ ...state, assignments: state.assignments.map((candidate) => candidate === assignment ? { ...candidate, helperIds: [...candidate.helperIds, helperId] } : candidate) }, [{ type: "add_helper", message: `${helper.name} added as helper.` }]);
}

export function resolveTask(state: GameState, taskId: string, roll?: number): Result {
  const assignment = state.assignments.find((candidate) => candidate.taskId === taskId); const task = state.tasks[taskId];
  if (state.phase !== "resolution" || !assignment || !task) return fail("No matching task is ready for resolution.");
  const agent = state.agents[assignment.agentId]; const player = state.players.find((candidate) => candidate.id === agent.ownerId)!;
  const random = rng(state.seed); const dice = roll ?? (Math.floor(random.next() * 6) + 1); const score = dice + agent.characteristics[task.characteristic] + assignment.helperIds.length;
  const critical = dice === 6; const success = critical || score >= task.difficulty;
  const nextPlayer = success ? { ...player, resources: Object.entries(task.reward).reduce((resources, [key, amount]) => ({ ...resources, [key]: resources[key as Resource] + (amount ?? 0) }), player.resources) } : player;
  const tracks = success ? { ...state.tracks, ...Object.entries(task.trackReward).reduce((current, [key, amount]) => ({ ...current, [key]: current[key as Track] + (amount ?? 0) }), state.tracks) } : state.tracks;
  const events = [{ type: critical ? "task_critical" : success ? "task_success" : "task_failure", message: `${task.title}: ${success ? (critical ? "critical success" : "success") : "failure"}.`, data: { dice, score, difficulty: task.difficulty } }];
  return result({ ...state, seed: random.seed(), phase: "actions", players: state.players.map((candidate) => candidate.id === player.id ? nextPlayer : candidate), tracks, assignments: state.assignments.filter((candidate) => candidate.taskId !== taskId), taskChoices: state.taskChoices.filter((id) => id !== taskId) }, events);
}

export function runBotTurn(state: GameState): Result {
  const bot = state.players.find((player) => player.id === "player.1");
  if (!bot) return fail("Bot player is missing.");
  const taskId = state.taskChoices.find((id) => {
    const task = state.tasks[id];
    const resource: Resource = task.deck === "capital" ? "capital" : task.deck === "connections" ? "connections" : "authority";
    return bot.resources[resource] >= task.cost;
  });
  const region = Object.values(state.regions).find((candidate) => candidate.assignments.length < candidate.capacity);
  if (!taskId || !region) return result({ ...state, currentPlayerId: "player.0", phase: "actions" }, [{ type: "bot_pass", message: "Bot has no legal task this turn." }]);
  const agentId = bot.agents[0];
  const assigned = assignTask({ ...state, currentPlayerId: "player.1" }, taskId, agentId, region.id);
  if ("error" in assigned) return result({ ...state, currentPlayerId: "player.0", phase: "actions" }, [{ type: "bot_pass", message: `Bot passed: ${assigned.error}` }]);
  const resolved = resolveTask(assigned.state, taskId);
  if ("error" in resolved) return resolved;
  return result({ ...resolved.state, currentPlayerId: "player.0", phase: "actions" }, [{ type: "bot_turn", message: "Bot completed its task." }]);
}

export function startNextRound(state: GameState): Result {
  if (state.phase !== "actions") return fail("The next round can only begin after all actions resolve.");
  // The tutorial gives each side one starter agent. A full game can raise this
  // requirement when recruitment is implemented, but the tutorial must be able
  // to advance with its current one-agent setup.
  if (state.players.some((player) => player.sentThisRound < 1)) return fail("Both players must complete their action before the round ends.");
  const regions = Object.fromEntries(Object.values(state.regions).map((region) => [region.id, { ...region, assignments: [] }]));
  const agents = Object.fromEntries(Object.values(state.agents).map((agent) => [agent.id, { ...agent, location: null }]));
  const players = state.players.map((player) => ({ ...player, sentThisRound: 0 }));
  return result({ ...state, round: state.round + 1, phase: "task_selection", taskChoices: [], assignments: [], regions, agents, players }, [{ type: "round_end", message: `Round ${state.round} ended.` }]);
}

export function getOutcome(state: GameState): GameState["outcome"] {
  if (state.tracks.enlightenment >= 12) return "victory";
  if (state.players.some((player) => player.resources.capital < 0 || player.resources.connections < 0)) return "loss";
  return null;
}
