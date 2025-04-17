import * as assert from 'assert';
import {getPositionParams, range} from './util';
import {provideHover} from '../lsp';

const wikitext = `
__NOTOC__
{{ #LEN: }}
{{ NUMBEROFPAGES }}
<p style=-webkit-user-select:none;>
<templatedata>{"description":null}</templatedata>
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
	it('inline CSS', async () => {
		assert.deepStrictEqual(await provideHover(getPositionParams(__filename, wikitext, 4, 12)), {
			contents: {
				kind: 'markdown',
				value:
String.raw`🚨️ Property is nonstandard. Avoid using it.

Controls the appearance of selection\.

Syntax: auto | text | none | all`,
			},
			range: range(4, 9, 4, 33),
		});
	});
	it('JSON schema', async () => {
		assert.deepStrictEqual(await provideHover(getPositionParams(__filename, wikitext, 5, 17)), {
			contents: [
				'A brief description of the template. **It must be in plain text.** Once filled, '
				+ 'it can be displayed as caption when editing a single template and perhaps in search results when '
				+ 'users pick one of many. The default is `null`.',
			],
			range: range(5, 15, 5, 28),
		});
	});
	it('HTML attribute name', async () => {
		assert.deepStrictEqual(await provideHover(getPositionParams(__filename, wikitext, 4, 4)), {
			contents: {
				kind: 'markdown',
				value: 'Contains [CSS](https://developer.mozilla.org/docs/Web/CSS) styling declarations to be applied '
					+ 'to the element. Note that it is recommended for styles to be defined in a separate file or '
					+ 'files. This attribute and the [`<style>`]('
					+ 'https://developer.mozilla.org/docs/Web/HTML/Element/style "The HTML <style> element contains '
					+ 'style information for a document, or part of a document.") element have mainly the purpose of '
					+ 'allowing for quick styling, for example for testing purposes.',
			},
			range: range(4, 3, 4, 8),
		});
	});
});
