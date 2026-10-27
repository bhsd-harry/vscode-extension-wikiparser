import {jsDoc, node, extend, getOxlintConfig} from '@bhsd/code-standard'; // eslint-disable-line n/no-unpublished-import

const config = getOxlintConfig(extend(
	jsDoc,
	...node,
	{
		ignores: ['server/lib/'],
	},
	{
		rules: {
			'no-unused-labels': 0,
			'jsdoc/require-jsdoc': 0,
			'n/no-extraneous-import': [
				2,
				{
					allowModules: [
						'@bhsd/common',
						'@bhsd/test-util',
					],
				},
			],
		},
	},
	{
		files: ['server/src/test/*.ts'],
		rules: {
			'@typescript-eslint/strict-void-return': 0,
		},
	},
));

export default config;
