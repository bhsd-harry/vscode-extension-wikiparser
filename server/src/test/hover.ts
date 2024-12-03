import * as assert from 'assert';
import {getPositionParams} from './util';
import {provideHover} from '../hover';

const wikitext = `
__NOTOC__
{{ #LEN: }}
{{ PAGESIZE }}
`;

describe('hoverProvider', () => {
	it('behavior switch', async () => {
		assert.deepStrictEqual(await provideHover(getPositionParams(__filename, wikitext, 1, 0)), {
			contents: {
				kind: 'markdown',
				value: 'Hides the table of contents (TOC).',
			},
			range: {
				start: {line: 1, character: 0},
				end: {line: 1, character: 9},
			},
		});
	});
	it('parser function', async () => {
		assert.deepStrictEqual(await provideHover(getPositionParams(__filename, wikitext, 2, 7)), {
			contents: {
				kind: 'markdown',
				value:
`- **{{ #LEN:** *string* **}}**

The #len function returns the length of the given string.`,
			},
			range: {
				start: {line: 2, character: 2},
				end: {line: 2, character: 7},
			},
		});
	});
	it('variable', async () => {
		assert.deepStrictEqual(await provideHover(getPositionParams(__filename, wikitext, 3, 4)), {
			contents: {
				kind: 'markdown',
				value:
`- **{{ PAGESIZE** **}}**
- **{{ PAGESIZE:** *page name* **}}**
- **{{ PAGESIZE:** *page name* **|** R **}}**

**[Expensive]** Returns the byte size of the specified page.`,
			},
			range: {
				start: {line: 3, character: 2},
				end: {line: 3, character: 12},
			},
		});
	});
});
