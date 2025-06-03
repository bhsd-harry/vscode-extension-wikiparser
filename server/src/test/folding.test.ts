import * as assert from 'assert';
import {FoldingRangeKind, SymbolKind} from 'vscode-languageserver/node';
import {getParams, range} from './util';
import {provideFoldingRanges, provideDocumentSymbol} from '../lsp';
import type {FoldingRange, DocumentSymbol} from 'vscode-languageserver/node';

const foldingRange = (startLine: number, endLine: number, kind = FoldingRangeKind.Region): FoldingRange => ({
	startLine,
	endLine,
	kind,
});

const wikitext = `
<!--

-->= 1 =

<!-- -->

<!-- -->== 2 ==



===== 3 ===== <!--

--> 

x {{a|
====== 4_<!--
-->2 ====== 
y }} z

== 4 ==


= 4 =

 : {|
|
=== 4 ===
 |} x

`;
const symbols: DocumentSymbol[] = [
	{
		name: '1',
		kind: SymbolKind.String,
		range: range(3, 3, 22, 0),
		selectionRange: range(3, 3, 3, 8),
		children: [
			{
				name: '2',
				kind: SymbolKind.String,
				range: range(7, 8, 19, 0),
				selectionRange: range(7, 8, 7, 15),
				children: [
					{
						name: '3',
						kind: SymbolKind.String,
						range: range(11, 0, 19, 0),
						selectionRange: range(11, 0, 11, 13),
						children: [
							{
								name: '4_2',
								kind: SymbolKind.String,
								range: range(16, 0, 19, 0),
								selectionRange: range(16, 0, 17, 11),
							},
						],
					},
				],
			},
			{
				name: '4',
				kind: SymbolKind.String,
				range: range(20, 0, 22, 0),
				selectionRange: range(20, 0, 20, 7),
			},
		],
	},
	{
		name: '4_3',
		kind: SymbolKind.String,
		range: range(23, 0, 30, 0),
		selectionRange: range(23, 0, 23, 5),
		children: [
			{
				name: '4_4',
				kind: SymbolKind.String,
				range: range(27, 0, 30, 0),
				selectionRange: range(27, 0, 27, 9),
			},
		],
	},
];

describe('FoldingRange/DocumentSymbol', () => {
	const params = getParams(__filename, wikitext);
	it('FoldingRange', async () => {
		assert.deepStrictEqual(
			await provideFoldingRanges(params),
			[
				foldingRange(15, 17),
				foldingRange(7, 19),
				foldingRange(11, 19),
				foldingRange(17, 19),
				foldingRange(3, 22),
				foldingRange(20, 22),
				foldingRange(25, 27),
				foldingRange(23, 30),
				foldingRange(27, 30),
			],
		);
	});
	it('DocumentSymbol', async () => {
		assert.deepStrictEqual(await provideDocumentSymbol(params), symbols);
	});
});

describe('FoldingRange (JSON)', () => {
	it('FoldingRange', async () => {
		assert.deepStrictEqual(
			await provideFoldingRanges(
				getParams(
					__filename,
					`
<templatedata>{
	"paramOrder": [
		"a",
		"b"
	]
}</templatedata>`,
				),
			),
			[
				foldingRange(2, 4, 'array'),
				foldingRange(1, 5, 'object'),
			],
		);
	});
});
