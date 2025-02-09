import * as assert from 'assert';
import {Color} from 'vscode-languageserver/node';
import {getParams, range} from './util';
import {provideDocumentColor} from '../lsp';
import type {ColorInformation} from 'vscode-languageserver/node';

const wikitext = `
<p style="color: rgba(255, 0, 0, .7)">
<poem style="color: #00ff00ff"/>
{{#tag:font|color=#f000}}
{{color|rgb(0 0 255 / 50%)}}
{{color|1=hsla(0, 100%, 50%, 0.5)}}
{{{|hsl(0deg 100 50)}}}
`,
	results: ColorInformation[] = [
		{
			range: range(1, 17, 1, 36),
			color: Color.create(1, 0, 0, 0.7),
		},
		{
			range: range(2, 20, 2, 29),
			color: Color.create(0, 1, 0, 1),
		},
		{
			range: range(3, 18, 3, 23),
			color: Color.create(1, 0, 0, 0),
		},
		{
			range: range(4, 8, 4, 26),
			color: Color.create(0, 0, 1, 0.5),
		},
		{
			range: range(5, 10, 5, 33),
			color: Color.create(1, 0, 0, 0.5),
		},
		{
			range: range(6, 4, 6, 20),
			color: Color.create(1, 0, 0, 1),
		},
	];

describe('colorProvider', () => {
	it('ColorInformation', async () => {
		assert.deepStrictEqual(await provideDocumentColor(getParams(__filename, wikitext)), results);
	});
});
