/* eslint-disable n/no-unpublished-require */
'use strict';

const fs = require('fs'),
	esbuild = require('esbuild');

const /** @type {esbuild.Plugin} */ plugin = {
	name: 'tree-shake',
	setup(build) {
		build.onLoad(
			// eslint-disable-next-line require-unicode-regexp
			{filter: /\/(?:modes|definition|common\/dist\/color|lib\/lsp)\.js$/},
			({path: p}) => {
				// 不能使用 ReplacableString
				let contents = fs.readFileSync(p, 'utf8');
				if (p.endsWith('color.js')) {
					contents = contents.replace(
						'/* #__PURE__ */ useMode(modeHwb);',
						'useMode(modeHwb);',
					);
				} else if (p.endsWith('lsp.js')) {
					contents = contents.replace(
						'require("@bhsd/stylelint-util")',
						'null',
					);
				} else if (p.endsWith('modes.js')) {
					contents = contents.replaceAll(
						/^([ \t]*)if \(.*\bdefinition\.(difference|interpolate|ranges)\b.*\) \{$[\s\S]+?^\1\},?$/gmu,
						'',
					);
				} else if (p.endsWith('definition.js')) {
					contents = contents.replaceAll(
						/^([ \t]*)(average|difference|fromMode|interpolate|ranges|serialize): .+$[\s\S]+?^\1\},?$/gmu,
						'',
					);
				}
				return {contents};
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
