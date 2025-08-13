## v1.4.0

*2025-08-14*

**Added**

- Configuration option to set the user's wiki userpage or email address, which may be required when accessing WMF sites according to the [Wikimedia Foundation's policy](https://foundation.wikimedia.org/wiki/Policy:Wikimedia_Foundation_User-Agent_Policy)
- New refactoring action to escape `|` and `=` characters in templates
- New fix-all actions for `WikiLint` diagnostics

**Changed**

- Upgrade the [WikiLint](https://npmjs.com/package/wikilint) package to [v2.24.1](https://github.com/bhsd-harry/wikiparser-node/blob/main/CHANGELOG.md#v1241)

## v1.3.6

*2025-07-14*

**Changed**

- Upgrade the [WikiLint](https://npmjs.com/package/wikilint) package to [v2.21.3](https://github.com/bhsd-harry/wikiparser-node/blob/main/CHANGELOG.md#v1213)

## v1.3.5

*2025-06-21*

**Changed**

- Upgrade the [WikiLint](https://npmjs.com/package/wikilint) package to [v2.21.2](https://github.com/bhsd-harry/wikiparser-node/blob/main/CHANGELOG.md#v1212)

## v1.3.4

*2025-04-26*

**Added**

- Configuration option to enable diagnostics for `math` and `chem` extension tags with the path to the [Mathjax](https://npmjs.com/package/mathjax) package

**Changed**

- Upgrade the [WikiLint](https://npmjs.com/package/wikilint) package to [v2.20.1](https://github.com/bhsd-harry/wikiparser-node/blob/main/CHANGELOG.md#v1201)

## v1.3.3

*2025-04-16*

**Changed**

- Upgrade the [WikiLint](https://npmjs.com/package/wikilint) package to [v2.20.0](https://github.com/bhsd-harry/wikiparser-node/blob/main/CHANGELOG.md#v1200)

## v1.3.2

*2025-04-04*

**Changed**

- Upgrade the [WikiLint](https://npmjs.com/package/wikilint) package to [v2.18.4](https://github.com/bhsd-harry/wikiparser-node/blob/main/CHANGELOG.md#v1184)

## v1.3.1

*2025-03-24*

**Changed**

- Upgrade the [WikiLint](https://npmjs.com/package/wikilint) package to [v2.18.3](https://github.com/bhsd-harry/wikiparser-node/blob/main/CHANGELOG.md#v1183)

## v1.3.0

*2025-03-15*

**Added**

- Configuration option to enable diagnostics for `score` extension tag with the path to the [LilyPond](https://lilypond.org) executable
- When setting the `wikiparser.articlePath` to Wikipedia, the parser configuration will be automatically updated
- Configuration option to specify the path to the parser configuration file

**Changed**

- Upgrade the [WikiLint](https://npmjs.com/package/wikilint) package to [v2.18.2](https://github.com/bhsd-harry/wikiparser-node/blob/main/CHANGELOG.md#v1182)

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
