/* eslint-disable n/no-unpublished-require */
'use strict';

const fs = require('fs'),
	path = require('path'),
	esbuild = require('esbuild');

const /** @type {esbuild.Plugin} */ plugin = {
	name: 'tree-shake',
	setup(build) {
		build.onLoad(
			// eslint-disable-next-line require-unicode-regexp
			{filter: /\/(?:modes|definition|regex|common\/dist\/color|lib\/lsp)\.js$/},
			({path: p}) => {
				const base = path.basename(p, '.js');
				// 不能使用 ReplacableString
				let contents = fs.readFileSync(p, 'utf8');
				switch (base) {
					case 'color':
						contents = contents.replace(
							'/* #__PURE__ */ useMode(modeHwb);',
							'useMode(modeHwb);',
						);
						break;
					case 'definition':
						contents = contents.replaceAll(
							/^([ \t]*)(average|difference|fromMode|interpolate|ranges|serialize): .+$[\s\S]+?^\1\},?$/gmu,
							'',
						);
						break;
					case 'lsp':
						contents = contents.replace(
							'require("@bhsd/stylelint-util")',
							'null',
						);
						break;
					case 'modes':
						contents = contents.replaceAll(
							/^([ \t]*)if \(.*\bdefinition\.(difference|interpolate|ranges)\b.*\) \{$[\s\S]+?^\1\},?$/gmu,
							'',
						);
						break;
					case 'regex':
						contents = contents.replaceAll(
							/^export const (?:num|hue|(?:(?:rx_)?num_)?per)_none = .+;$/gmu,
							'',
						);
						// no default
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
