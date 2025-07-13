'use strict';

const config = require('@bhsd/common/eslintrc.node.cjs');
const [json, ts] = config.overrides;

module.exports = {
	...config,
	ignorePatterns: [
		...config.ignorePatterns,
		'server/lib',
	],
	rules: {
		...config.rules,
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
