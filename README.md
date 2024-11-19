# Wikitext Language Service

This is a language server extension for Visual Studio Code that provides language supports for the [Wikitext](https://www.mediawiki.org/wiki/Wikitext) language.

## Usage

This extension does not actively call any code. The server exists as an asset at the location: `server/dist/server.js`. You can call this asset from any extension, for example:

```typescript
function startWikiParse() : void {
  const serverPath: string | undefined = vscode.extensions.getExtension('bhsd.vscode-extension-wikiparser')?.extensionPath;
  if (serverPath === undefined) {
      return;
  }
  const serverMain: string = path.join(serverPath, 'server', 'dist', 'server.js');
  const serverOptions: ServerOptions = {
      run: {
          module: serverMain,
      },
      debug: {
          module: serverMain,
          args: ['--debug'],
      },
  };
  const clientOptions: LanguageClientOptions = {
      documentSelector: [
          { scheme: 'file', language: 'wikitext' },
          { scheme: 'untitled', language: 'wikitext' },
      ],
  };
  client = new NodeLanguageClient('Wikitext Language Server', serverOptions, clientOptions);
  client.start();
}
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
- More to come!
