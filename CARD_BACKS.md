# Card-back rendering

Apocalypsis uses reusable background templates instead of separate Russian and English back-side images.

## Templates

| Template | Size | Intended use |
|---|---:|---|
| `assets/back.png` | 1049×1500 | neutral/default card back |
| `assets/back_yellow.png` | 1049×1500 | yellow/water-marked card-back variant |

The exact deck-to-template mapping is a presentation decision and can be stored in the registry as `back_template: neutral | yellow`. The templates remain language-neutral.

## Rendering contract

At runtime, render a card back as a template plus an optional overlay layer:

```yaml
back_template: neutral
overlay:
  text:
    ru: "Миссии"
    en: "Missions"
  position: center
  style: deck_label
```

The overlay must be separate from the source image. This allows the same template to serve Russian, English, and future locales, and allows the browser UI to use selectable text rather than rasterizing every translation.

## Secrecy rule

For a face-down card in normal play, the overlay may identify only the deck/category when the physical design permits it. It must never reveal the individual card title, outcome, or hidden text. Card-specific text belongs to the face-up view after the rules allow it.

For the later card-browser, tutorial, debug, and print/export views, the same template can receive an explicit localized label or explanatory text. Those views must opt into the overlay deliberately; gameplay backs default to no card-specific overlay.

## Implementation notes

- Keep the PNG templates as source assets for now; they are small and preserve the supplied artwork.
- The UI should expose `renderCardBack(template, locale, overlay)` rather than generate per-language image files.
- A future print renderer may rasterize the composed template and text, but that generated output should remain disposable rather than becoming a source asset.
