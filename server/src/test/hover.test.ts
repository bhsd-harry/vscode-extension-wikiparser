import * as assert from 'assert';
import {getPositionParams, range} from './util';
import {provideHover} from '../lsp';
import type {Range as TextRange} from 'vscode-languageserver/node';

const hoverTest = (title: string, text: string, character: number, value: string | string[], r: TextRange): void => {
	it(title, async () => {
		assert.deepStrictEqual(
			await provideHover(getPositionParams(__filename, text, 0, character)),
			{
				contents: Array.isArray(value) ? value : {kind: 'markdown', value},
				range: r,
			},
		);
	});
};

describe('hoverProvider', () => {
	hoverTest(
		'behavior switch',
		'__NOTOC__',
		0,
		'Hides the table of contents (TOC).',
		range(0, 9),
	);
	hoverTest(
		'parser function',
		'{{ #LEN: }}',
		2,
		`- **{{ #LEN:** *string* **}}**

The #len function returns the length of the given string.`,
		range(2, 7),
	);
	hoverTest(
		'variable',
		'{{ subst: NUMBEROFPAGES }}',
		10,
		`- **{{ NUMBEROFPAGES** **}}**
- **{{ NUMBEROFPAGES:** R **}}**

Number of wiki pages.`,
		range(10, 24),
	);
	hoverTest(
		'subst',
		'{{ subst: NUMBEROFPAGES }}',
		2,
		`- **{{ subst:** *xyz* **}}**

In the wikitext, the tag is substituted by the content (single-level evaluation only), `
		+ 'see [Help:Templates](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Templates#Usage).',
		range(2, 8),
	);
	hoverTest(
		'{{=}}',
		'{{ = }}',
		0,
		`Used to include an equal sign.

See [help](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:ParserFunctions#Raw_equal_signs)`
		+ ' for further explanation.',
		range(0, 7),
	);
	hoverTest(
		'inline CSS',
		'<p style=box-sizing:border-box>',
		11,
		/* eslint-disable @stylistic/max-len */
		String.raw`Specifies the behavior of the 'width' and 'height' properties\.

![Baseline icon](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTAiIHZpZXdCb3g9IjAgMCA1NDAgMzAwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxzdHlsZT4KICAgIC5ncmVlbi1zaGFwZSB7CiAgICAgIGZpbGw6ICNDNEVFRDA7IC8qIExpZ2h0IG1vZGUgKi8KICAgIH0KCiAgICBAbWVkaWEgKHByZWZlcnMtY29sb3Itc2NoZW1lOiBkYXJrKSB7CiAgICAgIC5ncmVlbi1zaGFwZSB7CiAgICAgICAgZmlsbDogIzEyNTIyNTsgLyogRGFyayBtb2RlICovCiAgICAgIH0KICAgIH0KICA8L3N0eWxlPgogIDxwYXRoIGQ9Ik00MjAgMzBMMzkwIDYwTDQ4MCAxNTBMMzkwIDI0MEwzMzAgMTgwTDMwMCAyMTBMMzkwIDMwMEw1NDAgMTUwTDQyMCAzMFoiIGNsYXNzPSJncmVlbi1zaGFwZSIvPgogIDxwYXRoIGQ9Ik0xNTAgMEwzMCAxMjBMNjAgMTUwTDE1MCA2MEwyMTAgMTIwTDI0MCA5MEwxNTAgMFoiIGNsYXNzPSJncmVlbi1zaGFwZSIvPgogIDxwYXRoIGQ9Ik0zOTAgMEw0MjAgMzBMMTUwIDMwMEwwIDE1MEwzMCAxMjBMMTUwIDI0MEwzOTAgMFoiIGZpbGw9IiMxRUE0NDYiLz4KPC9zdmc+) _Widely available across major browsers (Baseline since 2015)_

Syntax: content\-box | border\-box

[MDN Reference](https://developer.mozilla.org/docs/Web/CSS/box-sizing)`,
		/* eslint-enable @stylistic/max-len */
		range(9, 30),
	);
	hoverTest(
		'JSON schema',
		'<templatedata>{"description":null}</templatedata>',
		17,
		[
			'A brief description of the template. **It must be in plain text.** Once filled, '
			+ 'it can be displayed as caption when editing a single template and perhaps in search results when '
			+ 'users pick one of many. The default is `null`.',
		],
		range(15, 28),
	);
	hoverTest(
		'HTML tag',
		'<p style=box-sizing:border-box>',
		1,
		'The p element represents a paragraph.',
		range(0, 2),
	);
	hoverTest(
		'HTML attribute name',
		'<p style=box-sizing:border-box>',
		3,
		'Contains [CSS](https://developer.mozilla.org/docs/Web/CSS) styling declarations to be applied '
		+ 'to the element. Note that it is recommended for styles to be defined in a separate file or '
		+ 'files. This attribute and the [`<style>`]('
		+ 'https://developer.mozilla.org/docs/Web/HTML/Element/style "The HTML <style> element contains '
		+ 'style information for a document, or part of a document.") element have mainly the purpose of '
		+ 'allowing for quick styling, for example for testing purposes.',
		range(3, 8),
	);
});
