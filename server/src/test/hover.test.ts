import * as assert from 'assert';
import {getPositionParams, range} from './util';
import {provideHover} from '../lsp';

const wikitext = `
__NOTOC__
{{ #LEN: }}
{{ subst: NUMBEROFPAGES }}
{{ = }}
<p style=box-sizing:border-box>
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
		assert.deepStrictEqual(await provideHover(getPositionParams(__filename, wikitext, 2, 2)), {
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
		assert.deepStrictEqual(await provideHover(getPositionParams(__filename, wikitext, 3, 10)), {
			contents: {
				kind: 'markdown',
				value:
`- **{{ NUMBEROFPAGES** **}}**
- **{{ NUMBEROFPAGES:** R **}}**

Number of wiki pages.`,
			},
			range: range(3, 10, 3, 24),
		});
		assert.deepStrictEqual(await provideHover(getPositionParams(__filename, wikitext, 4, 0)), {
			contents: {
				kind: 'markdown',
				value:
`Used to include an equal sign.

See [help](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:ParserFunctions#Raw_equal_signs)`
+ ' for further explanation.',
			},
			range: range(4, 0, 4, 7),
		});
	});
	it('subst', async () => {
		assert.deepStrictEqual(await provideHover(getPositionParams(__filename, wikitext, 3, 2)), {
			contents: {
				kind: 'markdown',
				value:
`- **{{ subst:** *xyz* **}}**

In the wikitext, the tag is substituted by the content (single-level evaluation only), `
+ 'see [Help:Templates](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Templates#Usage).',
			},
			range: range(3, 2, 3, 8),
		});
	});
	it('inline CSS', async () => {
		assert.deepStrictEqual(await provideHover(getPositionParams(__filename, wikitext, 5, 11)), {
			contents: {
				kind: 'markdown',
				value: /* eslint-disable @stylistic/max-len */
String.raw`Specifies the behavior of the 'width' and 'height' properties\.

![Baseline icon](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTAiIHZpZXdCb3g9IjAgMCA1NDAgMzAwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxzdHlsZT4KICAgIC5ncmVlbi1zaGFwZSB7CiAgICAgIGZpbGw6ICNDNEVFRDA7IC8qIExpZ2h0IG1vZGUgKi8KICAgIH0KCiAgICBAbWVkaWEgKHByZWZlcnMtY29sb3Itc2NoZW1lOiBkYXJrKSB7CiAgICAgIC5ncmVlbi1zaGFwZSB7CiAgICAgICAgZmlsbDogIzEyNTIyNTsgLyogRGFyayBtb2RlICovCiAgICAgIH0KICAgIH0KICA8L3N0eWxlPgogIDxwYXRoIGQ9Ik00MjAgMzBMMzkwIDYwTDQ4MCAxNTBMMzkwIDI0MEwzMzAgMTgwTDMwMCAyMTBMMzkwIDMwMEw1NDAgMTUwTDQyMCAzMFoiIGNsYXNzPSJncmVlbi1zaGFwZSIvPgogIDxwYXRoIGQ9Ik0xNTAgMEwzMCAxMjBMNjAgMTUwTDE1MCA2MEwyMTAgMTIwTDI0MCA5MEwxNTAgMFoiIGNsYXNzPSJncmVlbi1zaGFwZSIvPgogIDxwYXRoIGQ9Ik0zOTAgMEw0MjAgMzBMMTUwIDMwMEwwIDE1MEwzMCAxMjBMMTUwIDI0MEwzOTAgMFoiIGZpbGw9IiMxRUE0NDYiLz4KPC9zdmc+) _Widely available across major browsers (Baseline since 2015)_

Syntax: content\-box | border\-box

[MDN Reference](https://developer.mozilla.org/docs/Web/CSS/box-sizing)`,
			/* eslint-enable @stylistic/max-len */
			},
			range: range(5, 9, 5, 30),
		});
	});
	it('JSON schema', async () => {
		assert.deepStrictEqual(await provideHover(getPositionParams(__filename, wikitext, 6, 17)), {
			contents: [
				'A brief description of the template. **It must be in plain text.** Once filled, '
				+ 'it can be displayed as caption when editing a single template and perhaps in search results when '
				+ 'users pick one of many. The default is `null`.',
			],
			range: range(6, 15, 6, 28),
		});
	});
	it('HTML tag', async () => {
		assert.deepStrictEqual(await provideHover(getPositionParams(__filename, wikitext, 5, 1)), {
			contents: {
				kind: 'markdown',
				value: 'The p element represents a paragraph.',
			},
			range: range(5, 0, 5, 2),
		});
	});
	it('HTML attribute name', async () => {
		assert.deepStrictEqual(await provideHover(getPositionParams(__filename, wikitext, 5, 3)), {
			contents: {
				kind: 'markdown',
				value: 'Contains [CSS](https://developer.mozilla.org/docs/Web/CSS) styling declarations to be applied '
					+ 'to the element. Note that it is recommended for styles to be defined in a separate file or '
					+ 'files. This attribute and the [`<style>`]('
					+ 'https://developer.mozilla.org/docs/Web/HTML/Element/style "The HTML <style> element contains '
					+ 'style information for a document, or part of a document.") element have mainly the purpose of '
					+ 'allowing for quick styling, for example for testing purposes.',
			},
			range: range(5, 3, 5, 8),
		});
	});
});
