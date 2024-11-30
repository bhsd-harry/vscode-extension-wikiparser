# WikiParser Language Server

[![VSCode Marketplace: WikiParser Language Server](https://vsmarketplacebadges.dev/version-short/bhsd.vscode-extension-wikiparser.webp?color=blueviolet&logo=visual-studio-code&style=?style=for-the-badge)](https://marketplace.visualstudio.com/items?itemName=Bhsd.vscode-extension-wikiparser)
[![CodeQL](https://github.com/bhsd-harry/vscode-extension-wikiparser/actions/workflows/codeql.yml/badge.svg)](https://github.com/bhsd-harry/vscode-extension-wikiparser/actions/workflows/codeql.yml)

This is a language server extension for Visual Studio Code that provides language supports for the [Wikitext](https://www.mediawiki.org/wiki/Wikitext) language.

## Installation

You can install this extension from the [Visual Studio Code Marketplace](https://marketplace.visualstudio.com/items?itemName=Bhsd.vscode-extension-wikiparser).

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

## Features

- Linting and quick fixes, offered by [WikiLint](https://npmjs.com/package/wikilint)
<div><img src="https://github.com/bhsd-harry/vscode-extension-wikiparser/blob/main/assets/lint.png?raw=true" width="300" alt="Linting"></div>

- Auto-completion
<div><img src="https://github.com/bhsd-harry/vscode-extension-wikiparser/blob/main/assets/autocomplete.gif?raw=true" width="250" alt="Auto-completion"></div>

- Color preview
<div><img src="https://github.com/bhsd-harry/vscode-extension-wikiparser/blob/main/assets/color.png?raw=true" width="400" alt="Color preview"></div>

- Code navigation
<div><img src="https://github.com/bhsd-harry/vscode-extension-wikiparser/blob/main/assets/navigation.png?raw=true" width="400" alt="Code navigation"></div>

- Followable wiki and external links
<div><img src="https://github.com/bhsd-harry/vscode-extension-wikiparser/blob/main/assets/link.png?raw=true" width="300" alt="Followable links"></div>

- Symbol renaming
<div><img src="https://github.com/bhsd-harry/vscode-extension-wikiparser/blob/main/assets/rename.gif?raw=true" width="400" alt="Symbol renaming"></div>

- Code folding
<div><img src="https://github.com/bhsd-harry/vscode-extension-wikiparser/blob/main/assets/folding.gif?raw=true" width="600" alt="Code Folding"></div>

- Outline view
<div><img src="https://github.com/bhsd-harry/vscode-extension-wikiparser/blob/main/assets/outline.png?raw=true" width="300" alt="Outline"></div>

- Hover information
<div><img src="https://github.com/bhsd-harry/vscode-extension-wikiparser/blob/main/assets/hover.png?raw=true" width="600" alt="Hover information"></div>

- Help with parser function signatures
<div><img src="https://github.com/bhsd-harry/vscode-extension-wikiparser/blob/main/assets/signature.gif?raw=true" width="500" alt="Parser function signatures"></div>
