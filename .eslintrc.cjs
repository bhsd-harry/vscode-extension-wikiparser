'use strict';

const config = require('@bhsd/common/eslintrc.node.cjs');
const [json, ts] = config.overrides;

module.exports = {
	...config,
	extends: [
		...config.extends,
		'plugin:markdown/recommended-legacy',
	],
	rules: {
		...config.rules,
		'n/no-missing-import': [
			2,
			{
				allowModules: ['vscode'],
			},
		],
		'n/no-missing-require': 0,
		'jsdoc/require-jsdoc': 0,
	},
	overrides: [
		json,
		{
			...ts,
			files: 'server/**/*.ts',
			parserOptions: {
				ecmaVersion: 'latest',
				project: './server/tsconfig.json',
			},
			rules: {
				...ts.rules,
				'@typescript-eslint/no-base-to-string': 0,
			},
		},
	],
};
