import * as assert from 'assert';
import {FoldingRangeKind, SymbolKind} from 'vscode-languageserver/node';
import {getParams} from './util';
import {provideFolding, provideSymbol} from '../folding';
import type {FoldingRange, DocumentSymbol} from 'vscode-languageserver/node';

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

`,
	foldingRanges: FoldingRange[] = [
		{startLine: 15, endLine: 17, kind: FoldingRangeKind.Region},
		{startLine: 7, endLine: 19, kind: FoldingRangeKind.Region},
		{startLine: 11, endLine: 19, kind: FoldingRangeKind.Region},
		{startLine: 17, endLine: 19, kind: FoldingRangeKind.Region},
		{startLine: 3, endLine: 22, kind: FoldingRangeKind.Region},
		{startLine: 20, endLine: 22, kind: FoldingRangeKind.Region},
		{startLine: 25, endLine: 27, kind: FoldingRangeKind.Region},
		{startLine: 23, endLine: 30, kind: FoldingRangeKind.Region},
		{startLine: 27, endLine: 30, kind: FoldingRangeKind.Region},
	],
	symbols: DocumentSymbol[] = [
		{
			name: '1',
			kind: SymbolKind.String,
			range: {start: {line: 3, character: 3}, end: {line: 22, character: 0}},
			selectionRange: {start: {line: 3, character: 3}, end: {line: 3, character: 8}},
			children: [
				{
					name: '2',
					kind: SymbolKind.String,
					range: {start: {line: 7, character: 8}, end: {line: 19, character: 0}},
					selectionRange: {start: {line: 7, character: 8}, end: {line: 7, character: 15}},
					children: [
						{
							name: '3',
							kind: SymbolKind.String,
							range: {start: {line: 11, character: 0}, end: {line: 19, character: 0}},
							selectionRange: {start: {line: 11, character: 0}, end: {line: 11, character: 13}},
							children: [
								{
									name: '4_2',
									kind: SymbolKind.String,
									range: {start: {line: 16, character: 0}, end: {line: 19, character: 0}},
									selectionRange: {start: {line: 16, character: 0}, end: {line: 17, character: 11}},
								},
							],
						},
					],
				},
				{
					name: '4',
					kind: SymbolKind.String,
					range: {start: {line: 20, character: 0}, end: {line: 22, character: 0}},
					selectionRange: {start: {line: 20, character: 0}, end: {line: 20, character: 7}},
				},
			],
		},
		{
			name: '4_3',
			kind: SymbolKind.String,
			range: {start: {line: 23, character: 0}, end: {line: 30, character: 0}},
			selectionRange: {start: {line: 23, character: 0}, end: {line: 23, character: 5}},
			children: [
				{
					name: '4_4',
					kind: SymbolKind.String,
					range: {start: {line: 27, character: 0}, end: {line: 30, character: 0}},
					selectionRange: {start: {line: 27, character: 0}, end: {line: 27, character: 9}},
				},
			],
		},
	];

describe('foldingRangeProvider', () => {
	it('FoldingRange', async () => {
		assert.deepStrictEqual(await provideFolding(getParams(__filename, wikitext)), foldingRanges);
	});
	it('DocumentSymbol', async () => {
		assert.deepStrictEqual(await provideSymbol(getParams(__filename, wikitext)), symbols);
	});
});
