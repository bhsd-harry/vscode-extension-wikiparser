import * as assert from 'assert';
import {getParams, range} from './util';
import {provideInlayHints} from '../lsp';

const wikitext = `
{{a
|b
|c=
}}
`;

describe('inlayHintsProvider', () => {
	it('anonymous parameter', async () => {
		assert.deepStrictEqual(
			await provideInlayHints({...getParams(__filename, wikitext), range: range(0, 0, 0, 0)}),
			[
				{
					position: {line: 2, character: 1},
					kind: 2,
					label: '1=',
				},
			],
		);
	});
});
