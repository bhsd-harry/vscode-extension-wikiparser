import * as assert from 'assert';
import {getPositionParams} from './util';
import {provideSignatureHelp} from '../lsp';

const wikitext = `
{{ #invoke: a | b | c | d }}
{{ PAGENAME: }}
{{ PAGESIZE: a | R }}
`;

describe('signatureHelpProvider', () => {
	it('#invoke', async () => {
		assert.deepStrictEqual(
			await provideSignatureHelp(getPositionParams(__filename, wikitext, 1, 12)),
			{
				signatures: [
					{
						label: '{{#invoke:module name|function name|args}}',
						parameters: [
							{label: 'module name'},
							{label: 'function name'},
							{label: 'args'},
						],
						activeParameter: 0,
					},
				],
				activeParameter: 0,
			},
		);
		assert.deepStrictEqual(
			await provideSignatureHelp(getPositionParams(__filename, wikitext, 1, 16)),
			{
				signatures: [
					{
						label: '{{#invoke:module name|function name|args}}',
						parameters: [
							{label: 'module name'},
							{label: 'function name'},
							{label: 'args'},
						],
						activeParameter: 1,
					},
				],
				activeParameter: 1,
			},
		);
		assert.deepStrictEqual(
			await provideSignatureHelp(getPositionParams(__filename, wikitext, 1, 25)),
			{
				signatures: [
					{
						label: '{{#invoke:module name|function name|args}}',
						parameters: [
							{label: 'module name'},
							{label: 'function name'},
							{label: 'args'},
						],
						activeParameter: 2,
					},
				],
				activeParameter: 3,
			},
		);
	});
	it('PAGENAME', async () => {
		assert.deepStrictEqual(
			await provideSignatureHelp(getPositionParams(__filename, wikitext, 2, 2)),
			{
				signatures: [
					{
						label: '{{PAGENAME:page name}}',
						parameters: [{label: 'page name'}],
					},
				],
				activeParameter: -1,
			},
		);
	});
	it('PAGESIZE', async () => {
		assert.deepStrictEqual(
			await provideSignatureHelp(getPositionParams(__filename, wikitext, 3, 13)),
			{
				signatures: [
					{
						label: '{{PAGESIZE:page name|R}}',
						parameters: [
							{label: 'page name'},
							{label: 'R', documentation: 'Predefined parameter'},
						],
					},
				],
				activeParameter: 0,
			},
		);
		assert.deepStrictEqual(
			await provideSignatureHelp(getPositionParams(__filename, wikitext, 3, 17)),
			{
				signatures: [
					{
						label: '{{PAGESIZE:page name|R}}',
						parameters: [
							{label: 'page name'},
							{label: 'R', documentation: 'Predefined parameter'},
						],
					},
				],
				activeParameter: 1,
			},
		);
	});
});
