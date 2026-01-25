import {jsDoc, node, extend} from '@bhsd/code-standard'; // eslint-disable-line n/no-unpublished-import

export default extend(
	jsDoc,
	...node,
	{
		ignores: ['server/lib/'],
	},
	{
		rules: {
			'no-unused-labels': 0,
			'jsdoc/require-jsdoc': 0,
		},
	},
	{
		files: ['server/**/*.ts'],
		languageOptions: {
			parserOptions: {
				project: './server/tsconfig.json',
			},
		},
	},
	{
		files: ['server/src/test/*.ts'],
		rules: {
			'@typescript-eslint/strict-void-return': 0,
		},
	},
);
