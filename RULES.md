# Научный апокалипсис — rules and implementation ledger

Source: `apocalypsis_full_description.pdf`. The source document is a 16-page high-level game description, not a complete card-by-card rulebook. This ledger records the confirmed design and marks details that still need cards or further rules.

## Theme and objective

Players lead factions of obscurantists resisting a world of accelerating scientific, social, and technological progress. The shared objective is to raise the **Enlightenment** track to its maximum before any one of the three Progress tracks reaches its critical maximum:

- natural-scientific Progress;
- social Progress;
- technological Progress.

If Progress reaches its limit first, all players lose to the World Government. If Enlightenment reaches its limit first, only the player with the most **Authority** wins. Authority comes from successful missions, cards, faction abilities, and agent abilities.

## Factions

There are 14 unique factions. Each has a different play style, bonuses, and a starting Agent. Additional Agents can be bought with **Connections**. The source gives examples such as the Antiviral Committee and Free Masons’ enemies, but does not include the complete faction card text.

## Player resources

### Authority

The final competitive score. Successful missions and special effects increase it. Some effects can steal Authority from another player.

### Enlightenment

The shared cooperative race track. Players want to advance it to its maximum before any Progress track does.

### Connections

Used to buy additional Agents, pay for some missions, and avoid certain negative Events.

### Capital

Used to buy Agent Upgrades, attempt harder missions, and avoid certain Events. Upgrades can be attached to friendly or hostile Agents depending on the card.

## Agents

Each Agent has six RPG-style characteristics:

- Intelligence;
- Willpower;
- Charisma;
- Machiavellianism;
- Narcissism;
- Psychopathy.

The Dark Triad checks are generally riskier but can offer stronger rewards. Agents also have classes, and an Agent may multiclass:

1. Healer;
2. Spiritual Leader;
3. Investigator;
4. Real Scientist;
5. Seer.

Some missions and sub-missions require particular classes. Every Agent also has an **Assistant** ability; some Assistants help their owner, while others are more useful when sent to help an opponent.

## Round structure

The PDF implies the following round flow:

1. Each player buys Agents and Upgrades and chooses from offered cards.
2. Each player chooses missions from a visible pool, normally three or four Missions, three Agents, and three Upgrades.
3. Players assign Agents, Upgrades, resources, and regions to missions.
4. No player may send more than two Agents on missions in one round.
5. Resolve missions with characteristic checks, Agent abilities, Upgrades, regional bonuses, other Agents, and situational modifiers.
6. Resolve the World Government turn, which accelerates Progress and can create crises.
7. Resolve Vatican cards activated by Progress increases.
8. Resolve Northern Korea cards, an additional player-side deck with powerful but dangerous effects.
9. Continue until the Enlightenment or a Progress track reaches its limit.

The exact order of buying, assignment, simultaneous reveals, and resolution needs confirmation from the physical cards or a fuller rulebook.

## Mission types

The base mission categories are:

- **Capital mission** — gain Capital;
- **Connections mission** — gain Connections;
- **Mission** — usually the most demanding and the main source of Enlightenment and Authority;
- **Search for Atlantis** — unpredictable missions that commonly improve Agents.

Missions may contain sub-missions with class requirements. Crisis cards are urgent Missions with negative consequences if ignored.

## Checks and resolution

Mission success is determined by dice modified by:

- the relevant Agent characteristic;
- Agent abilities;
- Upgrades;
- regional bonuses;
- helping Agents;
- situational bonuses and penalties;
- Capital or Connections invested in the attempt.

The source does not specify dice count, target numbers, rerolls, or the exact failure table. Those must be taken from the cards or later rules.

## Flat Earth map and regions

The map is divided into five regions. Each region provides:

- a bonus to one Agent class;
- resource bonuses or penalties when missions succeed or fail;
- a location for regional Disasters.

Players should consider both their own assignment and other players’ Agents in the same region: they may help, interfere, or trigger Assistant abilities.

## Disasters

Wars, epidemics, and famine tokens accumulate in regions as feedback from player actions. A region with a Disaster requires a Disaster card to be drawn before a mission. Outcomes can include:

- illness;
- physical or psychological injury;
- Agent death;
- other negative effects.

Some factions and Agents can exploit Disasters instead of suffering from them.

## Escalation decks

### World Government

After all Agents have acted, World Government cards advance Progress and can make the shared loss condition arrive faster. Crises such as Robot Invasion increase Technological Progress until players respond.

When a Progress track reaches a critical level, a corresponding **Awakening Crisis** appears. These are boss-like emergency Missions; ignoring them can rapidly end the game.

### Vatican

Progress increases activate Vatican cards. These represent institutional concessions to official science and force players to spend resources or risk difficult Agent checks.

### Northern Korea

This is an additional player-side deck. It can provide powerful interventions, including nuclear attacks or mass morale effects, but Agents sent there generally do not return.

## Cooperation and competition

Players must sometimes cooperate because Progress threatens everyone. They can:

- send Agents to help another player;
- use Assistant abilities on opponents;
- spend Capital or lose Authority to treat Agents;
- negotiate around shared Missions and regional threats.

The player with the highest current Authority receives the **Crown**, which grants useful bonuses. This creates a moving-leader incentive and a reason to monitor other players’ scores.

## End conditions

- **Players lose together:** any Progress track reaches its maximum first.
- **Players win competitively:** Enlightenment reaches its maximum first; the highest-Authority player wins.
- **Outstanding question:** tie-breaking, simultaneous track completion, and whether the Crown affects final ties are not specified in the source description.

## Prototype implementation order

1. Shared tracks: Enlightenment, three Progress tracks, Authority, Capital, Connections.
2. Five-region board with class bonuses and Disaster tokens.
3. Agent cards with six stats, classes, health states, and Assistant abilities.
4. Mission selection and two-Agent assignment limit.
5. Dice checks with transparent modifiers.
6. World Government, Vatican, Northern Korea, Crisis, and Disaster decks.
7. Faction powers, upgrades, cooperation, Crown, and final scoring.

## Comparison note

This description is sufficient to prototype the core loop, but not enough to reproduce the complete game faithfully without the actual cards. Card text will be the primary source of truth for implementation.
