#!/usr/local/bin/bash
tsc --project server/tsconfig.json && \
node build.js && \
bash sed.sh -i '/@bhsd\/stylelint-util/d' build/lsp.js
esbuild server/src/server.ts --charset=utf8 --minify --target=es2023 --format=cjs --outdir=server/dist --drop-labels=NPM
mkdir -p server/config server/dist/test
WIKILINT=$(node -e 'console.log( path.resolve( require.resolve( "wikilint/package" ), ".." ) )')
cp -r "$WIKILINT"/{config,data} .
mv config/default.json server/config/
rm {config,data}/.schema.json

mv server/lib/test/* server/dist/test/
bash sed.sh -i '1i\
#!/usr/bin/env node' server/lib/server.js
