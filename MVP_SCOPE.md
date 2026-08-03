# Apocalypsis MVP scope

This is the implementation target after the rulebook sanity pass. The MVP should prove that one complete round is fun and mechanically faithful before we transcribe every card.

## Sanity findings

- The global rule loop is now sufficiently specified: setup, purchase, task selection, assignment, helpers, checks, disasters, regional effects, end-of-round progression, and victory/loss thresholds are all defined.
- The source and asset inventory still need reconciliation before calling the card set complete. The PDF lists 35 agents, 10 North Korea cards, 10 Vatican cards, 28 World cards, and 18 Progress Awakening cards; the current folders contain 34 character images, 9 NK images, 11 Vatican images, 30 World images, and 9 boss images. Some differences may be backs, duplicates, or source-count conventions, but we must verify them.
- `OCR_CATALOGUE.md` currently has 43 numbered entries, while the rules’ deck counts imply more cards. It is not yet sufficient as the complete card database.
- The normalized rules had three documentation defects, now corrected: a Switzerland cross-reference, inconsistent timing for Enlightenment-triggered disaster placement, and an incorrect aggregate card count.

## MVP definition

The MVP is a two-seat game: one human and one bot. It uses the real rules engine and real card schema, but only a verified starter subset of cards. A game must support:

1. deterministic setup with two factions, starting agents, resources, five regions, class bonuses, four tracks, and Vatican markers;
2. the purchase phase for agents and upgrades;
3. drawing three task choices from Capital, Connections, and Mission decks;
4. sending up to two agents to tasks, including immediate cost payment and region placement;
5. adding a helper to a task;
6. resolving one normal task through choice, dice check, success/critical-success/failure, reward, and regional effect;
7. resolving one disaster before a task;
8. resolving one World card after all agents act;
9. advancing a Progress track and triggering the corresponding threshold behavior;
10. ending through either the shared loss condition or Enlightenment victory, with Authority tie-breaks.

North Korea, Vatican, crises, bosses, injuries, Switzerland, and the crown should be represented in the state model during the MVP, but can initially have one verified fixture card each. This prevents the engine from baking in a second incompatible lifecycle later.

## Deliberate non-goals

The MVP will not include every card, translation, multiplayer networking, prestige levels, or polished artwork. It will not invent missing card text. Unverified cards remain unavailable until reviewed.

## Implementation order

### Gate 0 — inventory and schema

Reconcile every asset folder against the PDF counts and assign stable IDs. Define card schemas for agents, upgrades, tasks, disasters, World, Vatican, North Korea, crises, bosses, factions, and regions. Every effect must declare its timing and target.

### Gate 1 — deterministic rules kernel

Implement a pure state transition layer with seeded randomness. The kernel should expose setup, buy, draw tasks, assign agent, add helper, resolve check, resolve disaster, resolve task, resolve World card, advance tracks, and determine outcome. No UI should be required to test it.

### Gate 2 — one complete scripted scenario

Create a fixture with known cards and dice so tests can prove: a successful task pays its cost and grants its reward; a failed task applies the correct failure; a critical success adds its bonus; an extra disaster token modifies checks without drawing a duplicate disaster card; a helper affects only the main agent; and a threshold can end the game.

### Gate 3 — minimal playable UI

Expose the kernel through the existing web shell or a simple local screen. The player must see resources, tracks, agents, regions, available tasks, pending choices, dice results, and the history of effects. Bot actions may be deterministic at first.

### Gate 4 — rules expansion

Add card families in this order: verified basic tasks, all three disasters, World, Vatican, agents/upgrades, missions/crises, North Korea, Switzerland, bosses, then faction-specific effects. After each family, add fixtures for every timing and targeting rule it introduces.

## Acceptance test for the first playable slice

From a fresh seed, the human can start a game, buy at least one agent or upgrade, choose a task, place an agent in a region, resolve any required disaster, make a check, receive the correct outcome, watch a bot take its turn, and see either the next round or a correctly declared end state. Replaying the same seed produces the same state transitions.

## Immediate next action

Perform Gate 0: inventory reconciliation and card schema design. Do not start UI work until the state and effect timing vocabulary is written down; otherwise the first card exceptions will leak into the interface and become expensive to undo.
