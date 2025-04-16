#!/usr/local/bin/bash
npx tsc --project server/tsconfig.json && \
npx esbuild server/src/lsp.ts --charset=utf8 --bundle --target=es2023 --platform=node --outdir=server/dist\
 --external:chalk --external:entities --external:stylelint --external:mathjax\
 --external:vscode-languageserver --external:vscode-languageserver-textdocument\
 --external:vscode-css-languageservice --external:vscode-json-languageservice --external:vscode-html-languageservice
mkdir -p server/config
WIKILINT=$(node -e 'console.log( path.resolve( require.resolve( "wikilint/package" ), ".." ) )')
cp -r "$WIKILINT"/config .
mv config/default.json server/config/
cp -r "$WIKILINT"/data .
rm config/.schema.json data/.schema.json
