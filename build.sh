#!/usr/local/bin/bash
tsc --project server/tsconfig.json && \
esbuild server/src/lsp.ts --charset=utf8 --bundle --target=es2024 --platform=node --outdir=build\
 --external:chalk --external:entities --external:stylelint --external:mathjax\
 --external:vscode-languageserver --external:vscode-languageserver-textdocument\
 --external:vscode-css-languageservice --external:vscode-json-languageservice --external:vscode-html-languageservice && \
esbuild build/lsp.js --charset=utf8 --minify --target=es2023 --outdir=server/dist
esbuild server/src/server.ts --charset=utf8 --minify --target=es2023 --format=cjs --outdir=server/dist --drop-labels=NPM
mkdir -p server/config server/dist/test
WIKILINT=$(node -e 'console.log( path.resolve( require.resolve( "wikilint/package" ), ".." ) )')
cp -r "$WIKILINT"/{config,data} .
mv config/default.json server/config/
rm {config,data}/.schema.json

mv server/lib/test/* server/dist/test/
bash sed.sh -i '1i\
#!/usr/bin/env node' server/lib/server.js
