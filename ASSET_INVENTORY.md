# Apocalypsis asset inventory

Inventory captured from `assets/cards` on 2026-08-03. Counts include every file in each deck directory, including obvious backs where present.

| Deck directory | Files | PDF count | Review |
|---|---:|---:|---|
| `fractions` | 14 | 14 | matches |
| `characters` | 37 files / 36 fronts | 36 | now matches the 36-card photo inventory; `back.webp` is the extra file |
| `items` | 50 files / 49 fronts | 63 physical upgrades | now reconciled: 49 unique fronts, with filename copy counts summing to 63; `back.webp` is the extra file |
| `capital` | 25 | 25 | matches |
| `connections` | 21 | 21 | matches |
| `missions` | 19 | 18 in PDF / 19 current assets | accept 19 for MVP; likely a later revision or an added card |
| `crisis` | 9 | 9 | matches |
| `atlantis` | 18 | 18 | matches |
| `bosses` | 9 | 9 current set | accepted as the correct boss set |
| `hunger` | 11 | 11 | matches |
| `epidemic` | 11 | 11 | matches |
| `war` | 11 | 11 | matches |
| `world` | 28 | 28 | now matches after filename cleanup |
| `vatican` | 11 files / 10 fronts | 10 | matches: `back.webp` is the back-side graphic |
| `nk` | 9 | 10 | one missing, or source count differs |

## Immediate reconciliation work

1. Separate front cards from backs and non-card leftovers.
2. Compare stable titles, not filenames, against the PDF component counts.
3. Identify the missing character and North Korea card, and explain the boss/world/mission/item count differences.
4. Parse temporary multiplicity suffixes such as `x3` into a `copies` field in the card registry.
5. Normalize filenames after parsing, removing the temporary `xN` suffix while retaining the copy count in the registry.
6. Add stable IDs and `reviewed` status to a machine-readable catalogue.
7. Do not enable an unreviewed asset in the MVP deck.

## Temporary copy-count convention

When a filename ends in `xN`, `N` is the intended number of physical copies of that card. For example, `world/earthquake x3.webp` becomes registry entry `world.earthquake` with `copies: 3`, then the canonical file is renamed to `earthquake.webp`. Files without a suffix default to `copies: 1` until reviewed.

## Current obvious special files

- `characters/back.webp`, `items/back.webp`, and `vatican/back.webp` are backs, not cards.
- `world` and some other directories contain generated filenames; these require title extraction before IDs can be assigned.
- `rules SA_compressed.pdf` is present in the repository workspace but intentionally remains uncommitted until the source-file policy is confirmed.
