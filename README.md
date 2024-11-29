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
- Auto-completion
- Color preview
- Code navigation
- Followable wiki and external links
- Symbol renaming
- Code folding
- Outline view
- Hover information
- Help with parser function signatures
