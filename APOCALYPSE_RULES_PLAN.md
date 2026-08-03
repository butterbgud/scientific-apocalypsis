# Normalize the Apocalypsis rulebook

This plan follows `/home/clop/.openclaw/workspace/PLANS.md`.

## Purpose / Big Picture

`actual_rules.md` will become the readable, authoritative working rules document for Apocalypsis. It will let us design an MVP without inventing mechanics: setup, round structure, actions, checks, resources, regions, disasters, missions, crises, Vatican, Progress Awakening, solo mode, and the tutorial will be represented explicitly. Rules that exist only on individual cards will remain card data, not be guessed here.

## Progress

- [x] (2026-08-03 13:05 Europe/Tallinn) Inventory the repository and compare the user draft with `rules SA_compressed.pdf`.
- [x] (2026-08-03 13:20 Europe/Tallinn) Extract native PDF text and visually inspect image-only pages containing checks, modifiers, injuries, regions, Vatican, solo mode, and tutorial rules.
- [x] (2026-08-03 13:28 Europe/Tallinn) Rewrite `actual_rules.md` as a coherent normalized rulebook.
- [x] (2026-08-03 13:29 Europe/Tallinn) Validate headings, cross-references, and source coverage against the PDF; `git diff --check` passes.
- [x] (2026-08-03 13:30 Europe/Tallinn) Report remaining card-level work and intentionally unexpanded card effects in the document.

## Surprises & Discoveries

- The PDF is 38 pages, with printed rule pages through 33 plus contact pages. Several pages are image-rendered, so `pdftotext` alone misses important rules.
- The “end of game” rule is not simply “highest Authority”: Progress 13 is an immediate loss, Enlightenment 12 is an immediate win, and ties are broken by Connections and then Capital.
- A helper is not considered present in a region and is exempt from ordinary task effects; only its helper ability affects the main agent unless the card says otherwise.

## Decision Log

- Decision: Preserve the document in Russian, matching the source rulebook and the existing draft, while using normalized headings and short implementation notes.
  Rationale: Translation would introduce another source of rules errors before the mechanics are settled.
  Date/Author: 2026-08-03 / Codex.
- Decision: Keep `RULES.md` and the original PDF untouched until the normalized document is reviewed.
  Rationale: They are useful as comparison and recovery sources; deleting them is unnecessary for this milestone.
  Date/Author: 2026-08-03 / Codex.
- Decision: Do not invent unreadable card text. Put card-specific mechanics in a clearly marked follow-up section instead.
  Rationale: The global rule loop can be implemented safely without pretending to know every card effect.
  Date/Author: 2026-08-03 / Codex.

## Outcomes & Retrospective

At completion, `actual_rules.md` is a coherent global rules reference with an explicit card-catalogue gap list. It is not yet a complete machine-readable card database; that is the next phase after card OCR and mapping review.

The normalized document passed `git diff --check` on 2026-08-03. The source PDF and old reference files remain untouched.

## Context and Orientation

The repository is `/home/clop/citadel/apocalypsis`. `actual_rules.md` is the user’s initial extracted draft. `rules SA_compressed.pdf` is the current source of truth. `RULES.md` is an older high-level ledger and is retained for comparison. The rules use three resources (Capital, Connections, Authority), three Progress tracks, an Enlightenment track, task cards, agents, helpers, regions, disasters, Vatican cards, World cards, North Korea cards, and Progress Awakening boss cards.

## Plan of Work

Rewrite `actual_rules.md` around the playable loop rather than the PDF’s page order: objective and components, setup, round sequence, player actions, agents/helpers, resources and tracks, checks, tasks and special decks, regions/disasters, end conditions, variants, and unresolved card-level work. Preserve source-specific numbers and timing. Add a source note and a gap list so later OCR work has a clear target.

## Concrete Steps

From `/home/clop/citadel/apocalypsis`, inspect the PDF with `pdftotext -layout`, use rendered page images for image-only text, edit `actual_rules.md`, then run `git diff --check` and search for unresolved markers.

## Validation and Acceptance

The document is accepted when it contains the complete global loop, has no contradictory duplicate rules, preserves the PDF’s numeric thresholds and costs, and labels unresolved card-specific material instead of guessing. `git diff --check` must report no whitespace errors.

## Idempotence and Recovery

Only the untracked `actual_rules.md` and this plan are added. The source PDF and old reference files are not modified. Re-running extraction is safe; if review rejects a section, restore the draft from Git history or compare it with the unchanged PDF.

## Artifacts and Notes

The source PDF has native text for most setup and core-loop sections; pages covering checks, modifiers, dark times, injuries, regions, Vatican, solo mode, prestige, and tutorial were visually inspected because they are image-rendered.

## Interfaces and Dependencies

No software interface changes are made in this milestone. The output is Markdown consumed by future rule-engine and card-catalogue work.
