import * as assert from 'assert';
import {CompletionItemKind} from 'vscode-languageserver/node';
import {getPositionParams} from './util';
import {completion} from '../completion';

const wikitext = `
<Im
{{{ a }}}
[[ a ]]
[[ : file : b ]]
{{ #Ifexp
{{ pagenamee }}
__T
[Gi
[[ file : c | Thumbnail | 100x100px ]]
[[ file : c | 100px ]]
<poem C
<p Da
{{ c | c | CC = }}
`;

describe('completionProvider', () => {
	it('tag completion', async () => {
		assert.deepStrictEqual(
			(await completion(getPositionParams(__filename, wikitext, 1, 3)))
				?.filter(({label}) => label.startsWith('im')),
			[
				{
					label: 'imagemap',
					kind: CompletionItemKind.Class,
					textEdit: {
						range: {start: {line: 1, character: 1}, end: {line: 1, character: 3}},
						newText: 'imagemap',
					},
				},
				{
					label: 'img',
					kind: CompletionItemKind.Class,
					textEdit: {
						range: {start: {line: 1, character: 1}, end: {line: 1, character: 3}},
						newText: 'img',
					},
				},
			],
		);
	});
	it('argument completion', async () => {
		assert.deepStrictEqual(
			await completion(getPositionParams(__filename, wikitext, 2, 5)),
			[
				{
					label: 'a',
					kind: CompletionItemKind.Variable,
					textEdit: {
						range: {start: {line: 2, character: 4}, end: {line: 2, character: 5}},
						newText: 'a',
					},
				},
			],
		);
	});
	it('link completion', async () => {
		assert.deepStrictEqual(
			(await completion(getPositionParams(__filename, wikitext, 3, 4)))
				?.filter(({label}) => /^a/iu.test(label)),
			[
				{
					label: 'A',
					kind: CompletionItemKind.Folder,
					textEdit: {
						range: {start: {line: 3, character: 3}, end: {line: 3, character: 4}},
						newText: 'A',
					},
				},
			],
		);
	});
	it('file completion', async () => {
		assert.deepStrictEqual(
			(await completion(getPositionParams(__filename, wikitext, 4, 11)))
				?.filter(({label}) => /^file:/iu.test(label)),
			[
				{
					label: 'File:B',
					kind: CompletionItemKind.Folder,
					textEdit: {
						range: {start: {line: 4, character: 5}, end: {line: 4, character: 11}},
						newText: 'File:B',
					},
				},
				{
					label: 'File:C',
					kind: CompletionItemKind.Folder,
					textEdit: {
						range: {start: {line: 4, character: 5}, end: {line: 4, character: 11}},
						newText: 'File:C',
					},
				},
			],
		);
	});
	it('parser function completion', async () => {
		assert.deepStrictEqual(
			(await completion(getPositionParams(__filename, wikitext, 5, 9)))
				?.filter(({label}) => /^#ifexp/iu.test(label)),
			[
				{
					label: '#ifexpr',
					kind: CompletionItemKind.Function,
					textEdit: {
						range: {start: {line: 5, character: 3}, end: {line: 5, character: 9}},
						newText: '#ifexpr',
					},
				},
			],
		);
	});
	it('template completion', async () => {
		assert.deepStrictEqual(
			(await completion(getPositionParams(__filename, wikitext, 6, 12)))
				?.filter(({label}) => /^pagenamee/iu.test(label)),
			[
				{
					label: 'PAGENAMEE',
					kind: CompletionItemKind.Function,
					textEdit: {
						range: {start: {line: 6, character: 3}, end: {line: 6, character: 12}},
						newText: 'PAGENAMEE',
					},
				},
				{
					label: 'Pagenamee',
					kind: CompletionItemKind.Folder,
					textEdit: {
						range: {start: {line: 6, character: 3}, end: {line: 6, character: 12}},
						newText: 'Pagenamee',
					},
				},
			],
		);
	});
	it('behavior switch completion', async () => {
		assert.deepStrictEqual(
			(await completion(getPositionParams(__filename, wikitext, 7, 3)))
				?.filter(({label}) => /^__t/iu.test(label)),
			[
				{
					label: '__toc__',
					kind: CompletionItemKind.Constant,
					textEdit: {
						range: {start: {line: 7, character: 0}, end: {line: 7, character: 3}},
						newText: '__toc__',
					},
				},
			],
		);
	});
	it('protocol completion', async () => {
		assert.deepStrictEqual(
			(await completion(getPositionParams(__filename, wikitext, 8, 3)))
				?.filter(({label}) => label.startsWith('gi')),
			[
				{
					label: 'git://',
					kind: CompletionItemKind.Reference,
					textEdit: {
						range: {start: {line: 8, character: 1}, end: {line: 8, character: 3}},
						newText: 'git://',
					},
				},
			],
		);
	});
	it('image parameter completion', async () => {
		assert.deepStrictEqual(
			(await completion(getPositionParams(__filename, wikitext, 9, 20)))
				?.filter(({label}) => label.startsWith('thumbn')),
			[
				{
					label: 'thumbnail',
					kind: CompletionItemKind.Property,
					textEdit: {
						range: {start: {line: 9, character: 14}, end: {line: 9, character: 20}},
						newText: 'thumbnail',
					},
				},
				{
					label: 'thumbnail=',
					kind: CompletionItemKind.Property,
					textEdit: {
						range: {start: {line: 9, character: 14}, end: {line: 9, character: 20}},
						newText: 'thumbnail=',
					},
				},
			],
		);
	});
	it('image width completion', async () => {
		assert.deepStrictEqual(
			(await completion(getPositionParams(__filename, wikitext, 10, 15)))
				?.filter(({label}) => label.startsWith('1')),
			[
				{
					label: '100x100px',
					kind: CompletionItemKind.Unit,
					textEdit: {
						range: {start: {line: 10, character: 14}, end: {line: 10, character: 15}},
						newText: '100x100px',
					},
				},
				{
					label: '100px',
					kind: CompletionItemKind.Unit,
					textEdit: {
						range: {start: {line: 10, character: 14}, end: {line: 10, character: 15}},
						newText: '100px',
					},
				},
			],
		);
	});
	it('extension tag attribute completion', async () => {
		assert.deepStrictEqual(
			(await completion(getPositionParams(__filename, wikitext, 11, 7)))
				?.filter(({label}) => label.startsWith('c')),
			[
				{
					label: 'compact',
					kind: CompletionItemKind.Field,
					textEdit: {
						range: {start: {line: 11, character: 6}, end: {line: 11, character: 7}},
						newText: 'compact',
					},
				},
				{
					label: 'class',
					kind: CompletionItemKind.Property,
					textEdit: {
						range: {start: {line: 11, character: 6}, end: {line: 11, character: 7}},
						newText: 'class',
					},
				},
			],
		);
	});
	it('HTML tag attribute completion', async () => {
		assert.deepStrictEqual(
			(await completion(getPositionParams(__filename, wikitext, 12, 5)))
				?.filter(({label}) => label.startsWith('da')),
			[
				{
					label: 'datatype',
					kind: CompletionItemKind.Property,
					textEdit: {
						range: {start: {line: 12, character: 3}, end: {line: 12, character: 5}},
						newText: 'datatype',
					},
				},
				{
					label: 'data-',
					kind: CompletionItemKind.Variable,
					textEdit: {
						range: {start: {line: 12, character: 3}, end: {line: 12, character: 5}},
						newText: 'data-',
					},
				},
			],
		);
	});
	it('template parameter completion', async () => {
		assert.deepStrictEqual(
			(await completion(getPositionParams(__filename, wikitext, 13, 8)))
				?.filter(({label}) => /^c/iu.test(label)),
			[
				{
					label: 'CC',
					kind: CompletionItemKind.Variable,
					textEdit: {
						range: {start: {line: 13, character: 6}, end: {line: 13, character: 8}},
						newText: 'CC',
					},
				},
			],
		);
	});
});
