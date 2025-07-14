import * as assert from 'assert';
import {getParams, range, color, textEdit} from './util';
import {provideDocumentColor, provideColorPresentation} from '../lsp';
import type {Color} from 'vscode-languageserver/node';

const r = range(0, 1);

const colorInformation = async (text: string, start: number, end: number, c: Color): Promise<void> => {
		assert.deepStrictEqual(
			await provideDocumentColor(getParams(__filename, text)),
			[{range: range(start, end), color: c}],
		);
	},
	colorPresentation = (c: Color, label: string): void => {
		assert.deepStrictEqual(
			provideColorPresentation({...getParams(__filename, ''), color: c, range: r}),
			[{label, textEdit: textEdit(r, label)}],
		);
	};

describe('ColorInformation', () => {
	it('rgb()', async () => {
		await colorInformation(
			'<p style="color: rgba(255, 0, 0, .7)">',
			17,
			36,
			color(1, 0, 0, 0.7),
		);
	});
	it('hex', async () => {
		await colorInformation(
			'<poem style="color: #00ff00ff"/>',
			20,
			29,
			color(0, 1, 0, 1),
		);
	});
	it('named parameter', async () => {
		await colorInformation(
			'{{#tag:font|color=#f000}}',
			18,
			23,
			color(1, 0, 0, 0),
		);
	});
	it('anonymous parameter', async () => {
		await colorInformation(
			'{{color|rgb(0 0 255 / 50%)}}',
			8,
			26,
			color(0, 0, 1, 0.5),
		);
	});
	it('legacy hsl()', async () => {
		await colorInformation(
			'{{color|1=hsla(0, 100%, 50%, 0.5)}}',
			10,
			33,
			color(1, 0, 0, 0.5),
		);
	});
	it('modern hsl()', async () => {
		await colorInformation(
			'{{{|hsl(0deg 100 50)}}}',
			4,
			20,
			color(1, 0, 0, 1),
		);
	});
	it('color name', async () => {
		await colorInformation(
			'<p style="color:<!---->blue">',
			23,
			27,
			color(0, 0, 1, 1),
		);
		await colorInformation(
			'{|style=color:red|',
			14,
			17,
			color(1, 0, 0, 1),
		);
	});
});

describe('ColorPresentation', () => {
	it('with alpha', () => {
		colorPresentation(color(1, 0, 0, 0.5), 'rgba(255,0,0,0.5)');
	});
	it('without alpha', () => {
		colorPresentation(color(0, 0.9, 0, 1), '#00e600');
	});
});
