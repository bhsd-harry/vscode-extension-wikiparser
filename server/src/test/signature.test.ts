import * as assert from 'assert';
import {getPositionParams} from './util';
import {provideSignatureHelp} from '../lsp';
import type {SignatureHelp} from 'vscode-languageserver/node';

const invoke = {
		label: '{{#invoke:module name|function name|args}}',
		parameters: [
			{label: 'module name'},
			{label: 'function name'},
			{label: 'args'},
		],
	},
	pagesize = [
		{
			label: '{{PAGESIZE:page name|R}}',
			parameters: [
				{label: 'page name'},
				{label: 'R', documentation: 'Predefined parameter'},
			],
		},
	];

const signatureHelp = (text: string, character: number): Promise<SignatureHelp | undefined> =>
	provideSignatureHelp(getPositionParams(__filename, text, 0, character));

describe('SignatureHelp', () => {
	it('#invoke', async () => {
		assert.deepStrictEqual(
			await signatureHelp('{{ #invoke: a | b | c | d }}', 12),
			{
				signatures: [
					{
						...invoke,
						activeParameter: 0,
					},
				],
				activeParameter: 0,
			},
		);
		assert.deepStrictEqual(
			await signatureHelp('{{ #invoke: a | b | c | d }}', 16),
			{
				signatures: [
					{
						...invoke,
						activeParameter: 1,
					},
				],
				activeParameter: 1,
			},
		);
		assert.deepStrictEqual(
			await signatureHelp('{{ #invoke: a | b | c | d }}', 25),
			{
				signatures: [
					{
						...invoke,
						activeParameter: 2,
					},
				],
				activeParameter: 3,
			},
		);
	});
	it('PAGENAME', async () => {
		assert.deepStrictEqual(
			await signatureHelp('{{ PAGENAME: }}', 2),
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
			await signatureHelp('{{ PAGESIZE: a | R }}', 13),
			{
				signatures: pagesize,
				activeParameter: 0,
			},
		);
		assert.deepStrictEqual(
			await signatureHelp('{{ PAGESIZE: a | R }}', 17),
			{
				signatures: pagesize,
				activeParameter: 1,
			},
		);
	});
});
