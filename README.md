# WikiParser Language Server

[![VS Code Marketplace: WikiParser Language Server](https://vsmarketplacebadges.dev/version-short/bhsd.vscode-extension-wikiparser.webp?color=blueviolet&logo=visual-studio-code&style=?style=for-the-badge)](https://marketplace.visualstudio.com/items?itemName=Bhsd.vscode-extension-wikiparser)
[![CodeQL](https://github.com/bhsd-harry/vscode-extension-wikiparser/actions/workflows/codeql.yml/badge.svg)](https://github.com/bhsd-harry/vscode-extension-wikiparser/actions/workflows/codeql.yml)
[![CI](https://github.com/bhsd-harry/vscode-extension-wikiparser/actions/workflows/node.js.yml/badge.svg)](https://github.com/bhsd-harry/vscode-extension-wikiparser/actions/workflows/node.js.yml)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/80fab92ae83b4dd4b17f8891ccac3f38)](https://app.codacy.com/gh/bhsd-harry/vscode-extension-wikiparser/dashboard)

This is a language server extension for Visual Studio Code that provides language supports for the [Wikitext](https://www.mediawiki.org/wiki/Wikitext) language.

## Installation

For a standalone version of the language server, please refer to [wikitext-lsp](https://npmjs.com/package/wikitext-lsp).

You can install this extension from the [Visual Studio Code Marketplace](https://marketplace.visualstudio.com/items?itemName=Bhsd.vscode-extension-wikiparser).

## Features

### Linting and quick fixes, offered by [WikiLint](https://npmjs.com/package/wikilint)
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
*Available since version 1.1.1*
<div><img src="https://github.com/bhsd-harry/vscode-extension-wikiparser/blob/main/assets/inlay.png?raw=true" width="550" alt="Inlay hints"></div>

## Configuration

| Configuration | Description | Default |
| :- | :- | :- |
| `wikiparser.articlePath` | Specify the article path of the wiki site.<br>Also set the parser configuration automatically for all language editions of Wikipedia. | |
| `wikiparser.config` | Manually specifiy the path to the parser configuration file. | |
| `wikiparser.user` | Specify the [policy](https://foundation.wikimedia.org/wiki/Policy:Wikimedia_Foundation_User-Agent_Policy)-compliant user information (a URI for wiki userpage or an email address) for the User-Agent header of HTTP requests sent to WMF sites from the language server. | |
| `wikiparser.linter.enable` | Enable diagnostics. | `true` |
| `wikiparser.linter.severity` | Display or hide warnings. | `errors only` |
| `wikiparser.linter.lilypond` | Specify the path to the LilyPond executable to lint `<score>`. | |
| `wikiparser.completion` | Enable auto-completion. | `true` |
| `wikiparser.color` | Enable color decorators. | `true` |
| `wikiparser.hover` | Enable hover information. | `true` |
| `wikiparser.inlay` | Enable inlay hints for anonymous template/module parameters. | `true` |
| `wikiparser.signature` | Enable parser function signature help. | `true` |

## Usage

This extension does not activate automatically. The server exists as an asset at the location: `server/dist/server.js`. You can call this asset from any extension, for example:

```js
const path = require('path'),
	{extensions} = require('vscode'),
	{LanguageClient} = require('vscode-languageclient/node');

const {extensionPath} = extensions.getExtension('Bhsd.vscode-extension-wikiparser');
new LanguageClient(
	'WikiParser Language Server',
	{
		run: {module: path.join(extensionPath, 'server', 'dist', 'server.js')},
	},
	{
		documentSelector: [
			{scheme: 'file', language: 'wikitext'},
			{scheme: 'untitled', language: 'wikitext'},
		],
	},
).start();
```

If the [Wikitext](https://marketplace.visualstudio.com/items?itemName=RoweWilsonFrederiskHolme.wikitext) extension is installed, this extension will automatically activate by setting the `wikitext.wikiparser.enable` configuration to `true`.
