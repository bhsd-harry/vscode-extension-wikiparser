import * as assert from 'assert';
import {getParams, range, color, textEdit} from './util';
import {provideDocumentColor, provideColorPresentation} from '../lsp';
import type {ColorInformation, ColorPresentation} from 'vscode-languageserver/node';

const wikitext = `
<p style="color: rgba(255, 0, 0, .7)">
<poem style="color: #00ff00ff"/>
{{#tag:font|color=#f000}}
{{color|rgb(0 0 255 / 50%)}}
{{color|1=hsla(0, 100%, 50%, 0.5)}}
{{{|hsl(0deg 100 50)}}}
<p style="color:<!---->blue">
{|style=color:red|
`,
	results: ColorInformation[] = [
		{
			range: range(1, 17, 1, 36),
			color: color(1, 0, 0, 0.7),
		},
		{
			range: range(2, 20, 2, 29),
			color: color(0, 1, 0, 1),
		},
		{
			range: range(3, 18, 3, 23),
			color: color(1, 0, 0, 0),
		},
		{
			range: range(4, 8, 4, 26),
			color: color(0, 0, 1, 0.5),
		},
		{
			range: range(5, 10, 5, 33),
			color: color(1, 0, 0, 0.5),
		},
		{
			range: range(6, 4, 6, 20),
			color: color(1, 0, 0, 1),
		},
		{
			range: range(7, 23, 7, 27),
			color: color(0, 0, 1, 1),
		},
		{
			range: range(8, 14, 8, 17),
			color: color(1, 0, 0, 1),
		},
	].reverse(),
	r = range(0, 0, 0, 1);

const colorPresentation = (label: string): ColorPresentation => ({
	label,
	textEdit: textEdit(r, label),
});

describe('colorProvider', () => {
	it('ColorInformation', async () => {
		assert.deepStrictEqual(await provideDocumentColor(getParams(__filename, wikitext)), results);
	});

	it('ColorPresentation', () => {
		assert.deepStrictEqual(
			provideColorPresentation({
				...getParams(__filename, wikitext),
				color: color(1, 0, 0, 0.5),
				range: r,
			}),
			[colorPresentation('#ff000080')],
		);
		assert.deepStrictEqual(
			provideColorPresentation({
				...getParams(__filename, wikitext),
				color: color(0, 0.9, 0, 1),
				range: r,
			}),
			[colorPresentation('#00e600')],
		);
	});
});
