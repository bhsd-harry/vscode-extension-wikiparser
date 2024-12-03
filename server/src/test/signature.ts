import * as assert from 'assert';
import {getPositionParams} from './util';
import {provideSignatureHelp} from '../signature';

const wikitext = `
{{ #invoke: a | b | c | d }}
{{ PAGENAME }}
{{ PAGESIZE: a | R }}
`;

describe('signatureHelpProvider', () => {
	it('#invoke-1', async () => {
		assert.deepStrictEqual(
			await provideSignatureHelp(getPositionParams(__filename, wikitext, 1, 12, true)),
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
	});
	it('#invoke-2', async () => {
		assert.deepStrictEqual(
			await provideSignatureHelp(getPositionParams(__filename, wikitext, 1, 16, true)),
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
	});
	it('#invoke-4', async () => {
		assert.deepStrictEqual(
			await provideSignatureHelp(getPositionParams(__filename, wikitext, 1, 25, true)),
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
	it('PAGENAME-1', async () => {
		assert.deepStrictEqual(
			await provideSignatureHelp(getPositionParams(__filename, wikitext, 2, 11, true)),
			{
				signatures: [
					{
						label: '{{PAGENAME}}',
						parameters: [],
					},
					{
						label: '{{PAGENAME:page name}}',
						parameters: [{label: 'page name'}],
					},
				],
				activeParameter: -1,
			},
		);
	});
	it('PAGESIZE-1', async () => {
		assert.deepStrictEqual(
			await provideSignatureHelp(getPositionParams(__filename, wikitext, 3, 13, true)),
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
	});
	it('PAGESIZE-2', async () => {
		assert.deepStrictEqual(
			await provideSignatureHelp(getPositionParams(__filename, wikitext, 3, 17, true)),
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
