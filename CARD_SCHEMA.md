# Apocalypsis card and state schema

This is the first implementation contract for the deterministic rules kernel. It is deliberately data-first: card text becomes structured effects, while the engine owns timing, legality, randomness, and state transitions.

## Stable identifiers

Every card gets an immutable ID of the form `<deck>.<slug>`, for example `character.pravshov` or `mission.digital_religion`. The asset path is metadata and may change without changing the ID. A card is not playable until its `reviewed` flag is true.

## Card envelope

```yaml
id: mission.example
deck: mission
asset: assets/cards/missions/example.webp
copies: 1
title:
  ru: "Название"
  en: null
reviewed: false
solo_allowed: true
cost: { capital: 0, connections: 0, authority: 0 }
requires_classes: []
effects: []
source: { pdf_page: null, ocr_id: null, confidence: low }
```

`reviewed: false` is a hard content gate, not a suggestion. It keeps uncertain OCR out of the playable deck.

During asset intake, a temporary filename suffix such as `example x3.webp` means `copies: 3`. The suffix is parsed once into the registry and then removed from the canonical asset filename. A card’s stable ID remains singular; `copies` controls how many physical copies enter its deck.

## Card types

The initial union of card types is:

- `faction`: starting faction, symbol, starting agent, and faction ability;
- `agent`: six base characteristics, classes, helper ability, cost, and starting data;
- `upgrade`: cost, capacity impact, classes, characteristic modifiers, and ability;
- `task`: `capital`, `connections`, `mission`, or `atlantis`;
- `crisis`: persistent task with an end-of-round effect and explicit close condition;
- `disaster`: `hunger`, `epidemic`, or `war`;
- `world`: progress-track effects and player responses;
- `vatican`: resource/check response and fallback consequence;
- `north_korea`: player-side task response and agent fate;
- `awakening`: progress boss with its own crisis rules.

## Effect vocabulary

Effects are normalized as data, never as arbitrary UI callbacks. The first kernel needs these operations:

```yaml
- op: resource_delta
  resource: capital | connections | authority
  amount: -2
  target: owner | active_player | agent_owner | chosen_player
- op: track_delta
  track: enlightenment | social_progress | natural_progress | technical_progress
  amount: 1
- op: state_add
  state: physical_injury | mental_injury | illness | dark_times
  target: main_agent | chosen_agent | all_agents_in_region
- op: class_add
  class: healer | spiritual_leader | investigator | real_scientist | seer
  target: main_agent | chosen_agent
- op: check
  characteristic: intelligence | willpower | charisma | machiavellianism | narcissism | psychopathy
  difficulty: 2
  dice_bonus: 0
  success: []
  critical_success: []
  failure: []
- op: draw
  deck: world | vatican | north_korea | disaster_hunger | disaster_epidemic | disaster_war
- op: choose
  options: []
- op: discard_card
  target: player_hand | task | upgrade
- op: lose_agent
  target: main_agent | chosen_agent
- op: close_crisis
  target: chosen_crisis | active_crisis
- op: attach_upgrade
  target: chosen_agent
```

Later operations can be added, but every new operation must state its target, timing, and test fixture.

## Timing vocabulary

Each effect belongs to one explicit timing window:

`setup`, `start_round`, `purchase`, `draw_tasks`, `send_agent`, `add_helper`, `before_disaster`, `resolve_disaster`, `before_check`, `after_check`, `task_success`, `task_critical`, `task_failure`, `after_task`, `end_round`, `world_step`, `vatican_step`, `north_korea_step`, `lose_agent`, or `game_end`.

The engine resolves effects in timing order and preserves card order within one card. A card may not silently mutate state from a renderer or UI event handler.

## State model

```yaml
game:
  phase: setup | purchase | task_selection | actions | resolution | world | end
  round: 1
  current_player: player.0
  first_player: player.0
  rng_seed: 12345
  tracks:
    enlightenment: 0
    social_progress: 0
    natural_progress: 0
    technical_progress: 0
  vatican_markers: [6, 8, 10, 12]
  disaster_tokens: []
  regions: []
  players: []
  decks: {}
  pending_choice: null
  history: []
  outcome: null
```

Each player needs resources, faction, hand, agents, crises, and per-round counters (`agents_sent_to_tasks`, `agents_sent_to_north_korea`, `agent_purchases`). Each agent needs its owner, card ID, characteristics, classes, upgrades, states, location, and helper links.

## Kernel commands

The first pure state-transition API should expose:

`setup(seed, player_count)`, `buy_agent`, `buy_upgrade`, `draw_task_choices`, `assign_task`, `add_helper`, `choose`, `roll_check`, `resolve_disaster`, `resolve_task`, `resolve_world_card`, `advance_track`, `end_round`, and `get_outcome`.

Commands return either a new state plus event list, or a typed legality error. Random rolls and deck draws consume the seeded RNG stored in state so a fixture can reproduce them exactly.

## Legality invariants

The kernel must reject or prevent:

- negative resources;
- a third task agent in one round;
- a second North Korea agent for one player in one round;
- a task in a full region;
- an agent without a required class;
- a helper attached above the default limit of three;
- a duplicate disaster draw for identical extra tokens;
- an unreviewed card entering a playable deck;
- any command after a terminal game outcome.

## First fixture set

The first tests should use six reviewed fixture cards rather than the full deck: one agent, one upgrade, one Capital task, one Connections task, one Mission, and one disaster. Add one World fixture before the first end-to-end scenario. Real card IDs may replace fixture IDs without changing the engine contract.
