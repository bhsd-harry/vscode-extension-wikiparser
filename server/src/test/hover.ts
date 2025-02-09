import * as assert from 'assert';
import {getPositionParams, range} from './util';
import {provideHover} from '../lsp';

const wikitext = `
__NOTOC__
{{ #LEN: }}
{{ NUMBEROFPAGES }}
`;

describe('hoverProvider', () => {
	it('behavior switch', async () => {
		assert.deepStrictEqual(await provideHover(getPositionParams(__filename, wikitext, 1, 0)), {
			contents: {
				kind: 'markdown',
				value: 'Hides the table of contents (TOC).',
			},
			range: range(1, 0, 1, 9),
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
			range: range(2, 2, 2, 7),
		});
	});
	it('variable', async () => {
		assert.deepStrictEqual(await provideHover(getPositionParams(__filename, wikitext, 3, 4)), {
			contents: {
				kind: 'markdown',
				value:
`- **{{ NUMBEROFPAGES** **}}**
- **{{ NUMBEROFPAGES:** R **}}**

Number of wiki pages.`,
			},
			range: range(3, 2, 3, 17),
		});
	});
});
