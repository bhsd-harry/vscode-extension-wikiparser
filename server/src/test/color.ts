import * as assert from 'assert';
import {getParams} from './util';
import {provideDocumentColors} from '../color';
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
			range: {
				start: {line: 1, character: 17},
				end: {line: 1, character: 36},
			},
			color: {red: 1, green: 0, blue: 0, alpha: 0.7},
		},
		{
			range: {
				start: {line: 2, character: 20},
				end: {line: 2, character: 29},
			},
			color: {red: 0, green: 1, blue: 0, alpha: 1},
		},
		{
			range: {
				start: {line: 3, character: 18},
				end: {line: 3, character: 23},
			},
			color: {red: 1, green: 0, blue: 0, alpha: 0},
		},
		{
			range: {
				start: {line: 4, character: 8},
				end: {line: 4, character: 26},
			},
			color: {red: 0, green: 0, blue: 1, alpha: 0.5},
		},
		{
			range: {
				start: {line: 5, character: 10},
				end: {line: 5, character: 33},
			},
			color: {red: 1, green: 0, blue: 0, alpha: 0.5},
		},
		{
			range: {
				start: {line: 6, character: 4},
				end: {line: 6, character: 20},
			},
			color: {red: 1, green: 0, blue: 0, alpha: 1},
		},
	];

describe('colorProvider', () => {
	it('ColorInformation', async () => {
		assert.deepStrictEqual(await provideDocumentColors(getParams(__filename, wikitext)), results);
	});
});
