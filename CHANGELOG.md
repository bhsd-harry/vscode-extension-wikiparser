## v1.1.1

*2025-02-12*

**Added**

- Inlay hints for template anonymous parameters
- Configuration options to disable inlay hints, code completions, color decorators, hovers, and parser function signature help
- Configuration option to include warnings in diagnostics

**Changed**

- The configuration option to enable/disable diagnostics is now renamed from `wikiparser.lint` to `wikiparser.linter.enable`

## v1.1.0

*2025-02-10*

**Added**

- Document link provider for the `link` parameter of images

**Fixed**

- Renaming of template parameter names

## v1.0.5

*2024-12-06*

**Added**

- More suggested code actions for syntax errors

## v1.0.4

*2024-12-03*

**Added**

- New parser function signatures
- Sticky scroll by sections

**Fixed**

- Wrong parser function names of `#dateformat`, `#formatdate` and `#time`
- Issue with duplicate section names in the outline

## v1.0.3

*2024-12-01*

**Fixed**

- Detection of `<ref>` definitions with non-empty content
- Folding range for sections
