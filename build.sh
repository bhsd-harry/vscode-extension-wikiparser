#!/usr/local/bin/bash
npx tsc --project server/tsconfig.json && \
npx esbuild server/src/lsp.ts --charset=utf8 --bundle --target=es2024 --platform=node --outdir=build\
 --external:chalk --external:entities --external:stylelint --external:mathjax\
 --external:vscode-languageserver --external:vscode-languageserver-textdocument\
 --external:vscode-css-languageservice --external:vscode-json-languageservice --external:vscode-html-languageservice && \
npx esbuild build/lsp.js --charset=utf8 --minify --target=es2023 --outdir=server/dist
npx esbuild server/src/server.ts --charset=utf8 --minify --target=es2023 --outdir=server/dist --drop-labels=NPM
mkdir -p server/config
WIKILINT=$(node -e 'console.log( path.resolve( require.resolve( "wikilint/package" ), ".." ) )')
cp -r "$WIKILINT"/{config,data} .
mv config/default.json server/config/
rm {config,data}/.schema.json

mv server/lib/test/* server/dist/test/
sed -i '' -e '1i\
#!/usr/bin/env node' server/lib/server.js
