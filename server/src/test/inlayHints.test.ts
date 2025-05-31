import * as assert from 'assert';
import {getParams, range} from './util';
import {provideInlayHints} from '../lsp';

const inlayHintsTest = (title: string, text: string, character: number): void => {
	it(title, async () => {
		assert.deepStrictEqual(
			await provideInlayHints({
				...getParams(__filename, text),
				range: range(0, 0),
			}),
			[
				{
					position: {line: 0, character},
					kind: 2,
					label: '1=',
				},
			],
		);
	});
};

describe('inlayHintsProvider', () => {
	inlayHintsTest('template', '{{a|b=|c}}', 7);
	inlayHintsTest('module', '{{#invoke:a|b|c}}', 14);
});
