## v1.3.0

*2025-03-11*

**Added**

- Configuration option to enable diagnostics for `score` extension tag with the path to the [LilyPond](https://lilypond.org) executable

**Changed**

- Upgrade the [WikiLint](https://npmjs.com/package/wikilint) package to [v2.17.2](https://github.com/bhsd-harry/wikiparser-node/blob/main/CHANGELOG.md#v1172)

## v1.2.0

*2025-03-08*

**Added**

- Diagnostics, hover and completion for JSON embedded in extension tags (`templatedata`, `mapframe`, `maplink`, and `graph`)
- Diagnostics, hover and completion for inline CSS of extension tags, HTML tags, and tables

**Changed**

- Upgrade the [WikiLint](https://npmjs.com/package/wikilint) package to [v2.17.1](https://github.com/bhsd-harry/wikiparser-node/blob/main/CHANGELOG.md#v1171)

## v1.1.1

*2025-02-21*

**Added**

- Inlay hints for template anonymous parameters
- Configuration options to disable inlay hints, code completions, color decorators, hovers, and parser function signature help
- Configuration option to include warnings in diagnostics

**Changed**

- Upgrade the [WikiLint](https://npmjs.com/package/wikilint) package to [v2.16.4](https://github.com/bhsd-harry/wikiparser-node/blob/main/CHANGELOG.md#v1164)
- The configuration option to enable/disable diagnostics is now renamed from `wikiparser.lint` to `wikiparser.linter.enable`

## v1.1.0

*2025-02-10*

**Changed**

- All language server features are now directly provided by the [WikiLint](https://npmjs.com/package/wikilint) package [v2.16.1](https://github.com/bhsd-harry/wikiparser-node/blob/main/CHANGELOG.md#v1161)

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
