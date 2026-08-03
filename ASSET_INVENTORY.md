# Apocalypsis asset inventory

Inventory captured from `assets/cards` on 2026-08-03. Counts include every file in each deck directory, including obvious backs where present.

| Deck directory | Files | PDF count | Review |
|---|---:|---:|---|
| `fractions` | 14 | 14 | matches |
| `characters` | 34 | 35 | one missing, or source count differs |
| `items` | 48 | 63 upgrades | likely incomplete/renamed or count convention differs |
| `capital` | 25 | 25 | matches |
| `connections` | 21 | 21 | matches |
| `missions` | 19 | 18 | one extra, or source count differs |
| `crisis` | 9 | 9 | matches |
| `atlantis` | 18 | 18 | matches |
| `bosses` | 9 | 18 | likely source count includes paired/card-side convention; verify |
| `hunger` | 11 | 11 | matches |
| `epidemic` | 11 | 11 | matches |
| `war` | 11 | 11 | matches |
| `world` | 30 | 28 | two extra, or source count differs |
| `vatican` | 11 | 10 | includes `back.webp`; likely 10 fronts |
| `nk` | 9 | 10 | one missing, or source count differs |

## Immediate reconciliation work

1. Separate front cards from backs and non-card leftovers.
2. Compare stable titles, not filenames, against the PDF component counts.
3. Identify the missing character and North Korea card, and explain the boss/world/mission/item count differences.
4. Add stable IDs and `reviewed` status to a machine-readable catalogue.
5. Do not enable an unreviewed asset in the MVP deck.

## Current obvious special files

- `characters/back.webp`, `items/back.webp`, and `vatican/back.webp` are backs, not cards.
- `world` and some other directories contain generated filenames; these require title extraction before IDs can be assigned.
- `rules SA_compressed.pdf` is present in the repository workspace but intentionally remains uncommitted until the source-file policy is confirmed.
