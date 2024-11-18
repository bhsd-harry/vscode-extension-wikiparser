'use strict';

const config = require('@bhsd/common/eslintrc.node.cjs');
const [json, ts] = config.overrides;

module.exports = {
	...config,
	rules: {
		...config.rules,
		'n/no-missing-import': [
			2,
			{
				allowModules: ['vscode'],
			},
		],
		'jsdoc/require-jsdoc': 0,
		'@stylistic/linebreak-style': [2, process.env.NODE_ENV === 'prod' ? 'unix' : 'windows'],
	},
	overrides: [
		json,
		{
			...ts,
			files: 'client/**/*.ts',
			parserOptions: {
				ecmaVersion: 'latest',
				project: './client/tsconfig.json',
			},
		},
		{
			...ts,
			files: 'server/**/*.ts',
			parserOptions: {
				ecmaVersion: 'latest',
				project: './server/tsconfig.json',
			},
		},
	],
};
