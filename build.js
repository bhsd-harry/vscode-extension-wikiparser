/* eslint-disable n/no-unpublished-require */
'use strict';

const fs = require('fs'),
	esbuild = require('esbuild');

const /** @type {esbuild.Plugin} */ plugin = {
	name: 'tree-shake',
	setup(build) {
		build.onLoad(
			{filter: /\/(?:modes|definition|common\/dist\/color)\.js$/}, // eslint-disable-line require-unicode-regexp
			({path: p}) => {
				const contents = fs.readFileSync(p, 'utf8');
				return {
					contents: p.endsWith('color.js')
						? contents.replace(
							'/* #__PURE__ */ useMode(modeHwb);',
							'useMode(modeHwb);',
						)
						: contents.replaceAll(
							p.endsWith('modes.js')
								? /^([ \t]*)if \(.*\bdefinition\.(difference|interpolate|ranges)\b.*\) \{$[\s\S]+?^\1\},?$/gmu
								: /^([ \t]*)(average|difference|fromMode|interpolate|ranges|serialize): .+$[\s\S]+?^\1\},?$/gmu,
							'',
						),
				};
			},
		);
	},
};

const config = {
	entryPoints: ['server/src/lsp.ts'],
	plugins: [plugin],
	charset: 'utf8',
	bundle: true,
	platform: 'node',
	dropLabels: ['NPM'],
	external: [
		'@bhsd/stylelint-util',
		'vscode-css-languageservice',
		'vscode-html-languageservice',
		'vscode-json-languageservice',
		'vscode-languageserver',
		'vscode-languageserver-textdocument',
	],
	logLevel: 'info',
};

(async () => {
	await esbuild.build({
		...config,
		target: 'es2024',
		outdir: 'build',
	});
	await esbuild.build({
		...config,
		target: 'es2023',
		minify: true,
		outdir: 'server/dist',
	});
})();
