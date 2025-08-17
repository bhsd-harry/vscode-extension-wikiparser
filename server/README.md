# WikiParser Language Server

[![npm version](https://badge.fury.io/js/wikitext-lsp.svg)](https://www.npmjs.com/package/wikitext-lsp)
[![CodeQL](https://github.com/bhsd-harry/vscode-extension-wikiparser/actions/workflows/codeql.yml/badge.svg)](https://github.com/bhsd-harry/vscode-extension-wikiparser/actions/workflows/codeql.yml)
[![CI](https://github.com/bhsd-harry/vscode-extension-wikiparser/actions/workflows/node.js.yml/badge.svg)](https://github.com/bhsd-harry/vscode-extension-wikiparser/actions/workflows/node.js.yml)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/80fab92ae83b4dd4b17f8891ccac3f38)](https://app.codacy.com/gh/bhsd-harry/vscode-extension-wikiparser/dashboard)

[Language Server Protocol](https://microsoft.github.io/language-server-protocol/) implementation for [Wikitext](https://www.mediawiki.org/wiki/Wikitext).

## Installation

You can install this via [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm):

```bash
npm i -g wikitext-lsp
```

## Features

### Linting and quick fixes, offered by [WikiLint](https://www.npmjs.com/package/wikilint)
<div><img src="https://github.com/bhsd-harry/vscode-extension-wikiparser/blob/main/assets/lint.png?raw=true" width="300" alt="Linting"></div>

### Auto-completion
<div><img src="https://github.com/bhsd-harry/vscode-extension-wikiparser/blob/main/assets/autocomplete.gif?raw=true" width="250" alt="Auto-completion"></div>

### Color preview
<div><img src="https://github.com/bhsd-harry/vscode-extension-wikiparser/blob/main/assets/color.png?raw=true" width="450" alt="Color preview"></div>

### Code navigation
<div><img src="https://github.com/bhsd-harry/vscode-extension-wikiparser/blob/main/assets/navigation.png?raw=true" width="400" alt="Code navigation"></div>

### Followable wiki and external links
<div><img src="https://github.com/bhsd-harry/vscode-extension-wikiparser/blob/main/assets/link.png?raw=true" width="300" alt="Followable links"></div>

### Symbol renaming
<div><img src="https://github.com/bhsd-harry/vscode-extension-wikiparser/blob/main/assets/rename.gif?raw=true" width="400" alt="Symbol renaming"></div>

### Code folding
<div><img src="https://github.com/bhsd-harry/vscode-extension-wikiparser/blob/main/assets/folding.gif?raw=true" width="800" alt="Code Folding"></div>

### Outline view
<div><img src="https://github.com/bhsd-harry/vscode-extension-wikiparser/blob/main/assets/outline.png?raw=true" width="300" alt="Outline"></div>

### Hover
<div><img src="https://github.com/bhsd-harry/vscode-extension-wikiparser/blob/main/assets/hover.png?raw=true" width="700" alt="Hover"></div>

### Help with parser function signatures
<div><img src="https://github.com/bhsd-harry/vscode-extension-wikiparser/blob/main/assets/signature.gif?raw=true" width="550" alt="Parser function signatures"></div>

### Inlay hints
<div><img src="https://github.com/bhsd-harry/vscode-extension-wikiparser/blob/main/assets/inlay.png?raw=true" width="550" alt="Inlay hints"></div>

## Configuration

| Configuration | Description | Default | Example |
| :- | :- | :- | :- |
| `wikiparser.articlePath` | Specify the article path of the wiki site.<br>Also set the parser configuration automatically for all language editions of Wikipedia. | | `https://en.wikipedia.org/wiki/` |
| `wikiparser.config` | Manually specifiy the absolute path to the parser configuration file or the name of a [preset configuration](https://github.com/bhsd-harry/wikiparser-node/tree/lint/config). | | `enwiki` |
| `wikiparser.user` | Specify the [policy](https://foundation.wikimedia.org/wiki/Policy:Wikimedia_Foundation_User-Agent_Policy)-compliant user information (a URI for wiki userpage or an email address) for the User-Agent header of HTTP requests sent to WMF sites from the language server. | | `user@example.net` or `https://meta.wikimedia.org/wiki/User:Example` |
| `wikiparser.linter.enable` | Enable diagnostics. | `true` | |
| `wikiparser.linter.severity` | Display or hide warnings. | `errors only` | `errors and warnings` |
| `wikiparser.linter.lilypond` | Specify the path to the LilyPond executable to lint `<score>`. | | `/opt/homebrew/bin/lilypond` |
| `wikiparser.completion` | Enable auto-completion. | `true` | |
| `wikiparser.color` | Enable color decorators. | `true` | |
| `wikiparser.hover` | Enable hover information. | `true` | |
| `wikiparser.inlay` | Enable inlay hints for anonymous template/module parameters. | `true` | |
| `wikiparser.signature` | Enable parser function signature help. | `true` | |

## Usage

```bash
wikitext-lsp --stdio
```

## Changelog

Please see the [CHANGELOG](https://marketplace.visualstudio.com/items/Bhsd.vscode-extension-wikiparser/changelog) of the associated VS Code extension.
