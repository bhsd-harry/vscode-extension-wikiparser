import * as assert from 'assert';
import {CompletionItemKind} from 'vscode-languageserver/node';
import {getPositionParams, range} from './util';
import {provideCompletion} from '../lsp';

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
			(await provideCompletion(getPositionParams(__filename, wikitext, 1, 3)))
				?.filter(({label}) => label.startsWith('im')),
			[
				{
					label: 'imagemap',
					kind: CompletionItemKind.Class,
					textEdit: {
						range: range(1, 1, 1, 3),
						newText: 'imagemap',
					},
				},
				{
					label: 'img',
					kind: CompletionItemKind.Class,
					textEdit: {
						range: range(1, 1, 1, 3),
						newText: 'img',
					},
				},
			],
		);
	});
	it('argument completion', async () => {
		assert.deepStrictEqual(
			await provideCompletion(getPositionParams(__filename, wikitext, 2, 5)),
			[
				{
					label: 'a',
					kind: CompletionItemKind.Variable,
					textEdit: {
						range: range(2, 4, 2, 5),
						newText: 'a',
					},
				},
			],
		);
	});
	it('link completion', async () => {
		assert.deepStrictEqual(
			(await provideCompletion(getPositionParams(__filename, wikitext, 3, 4)))
				?.filter(({label}) => /^a/iu.test(label)),
			[
				{
					label: 'A',
					kind: CompletionItemKind.Folder,
					textEdit: {
						range: range(3, 3, 3, 4),
						newText: 'A',
					},
				},
			],
		);
	});
	it('file completion', async () => {
		assert.deepStrictEqual(
			(await provideCompletion(getPositionParams(__filename, wikitext, 4, 11)))
				?.filter(({label}) => /^file:/iu.test(label)),
			[
				{
					label: 'File:B',
					kind: CompletionItemKind.Folder,
					textEdit: {
						range: range(4, 5, 4, 11),
						newText: 'File:B',
					},
				},
				{
					label: 'File:C',
					kind: CompletionItemKind.Folder,
					textEdit: {
						range: range(4, 5, 4, 11),
						newText: 'File:C',
					},
				},
			],
		);
	});
	it('parser function completion', async () => {
		assert.deepStrictEqual(
			(await provideCompletion(getPositionParams(__filename, wikitext, 5, 9)))
				?.filter(({label}) => /^#ifexp/iu.test(label)),
			[
				{
					label: '#ifexpr',
					kind: CompletionItemKind.Function,
					textEdit: {
						range: range(5, 3, 5, 9),
						newText: '#ifexpr',
					},
				},
			],
		);
	});
	it('template completion', async () => {
		assert.deepStrictEqual(
			(await provideCompletion(getPositionParams(__filename, wikitext, 6, 12)))
				?.filter(({label}) => /^pagenamee/iu.test(label)),
			[
				{
					label: 'PAGENAMEE',
					kind: CompletionItemKind.Function,
					textEdit: {
						range: range(6, 3, 6, 12),
						newText: 'PAGENAMEE',
					},
				},
				{
					label: 'Pagenamee',
					kind: CompletionItemKind.Folder,
					textEdit: {
						range: range(6, 3, 6, 12),
						newText: 'Pagenamee',
					},
				},
			],
		);
	});
	it('behavior switch completion', async () => {
		assert.deepStrictEqual(
			(await provideCompletion(getPositionParams(__filename, wikitext, 7, 3)))
				?.filter(({label}) => /^__t/iu.test(label)),
			[
				{
					label: '__toc__',
					kind: CompletionItemKind.Constant,
					textEdit: {
						range: range(7, 0, 7, 3),
						newText: '__toc__',
					},
				},
			],
		);
	});
	it('protocol completion', async () => {
		assert.deepStrictEqual(
			(await provideCompletion(getPositionParams(__filename, wikitext, 8, 3)))
				?.filter(({label}) => label.startsWith('gi')),
			[
				{
					label: 'git://',
					kind: CompletionItemKind.Reference,
					textEdit: {
						range: range(8, 1, 8, 3),
						newText: 'git://',
					},
				},
			],
		);
	});
	it('image parameter completion', async () => {
		assert.deepStrictEqual(
			(await provideCompletion(getPositionParams(__filename, wikitext, 9, 20)))
				?.filter(({label}) => label.startsWith('thumbn')),
			[
				{
					label: 'thumbnail',
					kind: CompletionItemKind.Property,
					textEdit: {
						range: range(9, 14, 9, 20),
						newText: 'thumbnail',
					},
				},
				{
					label: 'thumbnail=',
					kind: CompletionItemKind.Property,
					textEdit: {
						range: range(9, 14, 9, 20),
						newText: 'thumbnail=',
					},
				},
			],
		);
	});
	it('image width completion', async () => {
		assert.deepStrictEqual(
			(await provideCompletion(getPositionParams(__filename, wikitext, 10, 15)))
				?.filter(({label}) => label.startsWith('1')),
			[
				{
					label: '100x100px',
					kind: CompletionItemKind.Unit,
					textEdit: {
						range: range(10, 14, 10, 15),
						newText: '100x100px',
					},
				},
				{
					label: '100px',
					kind: CompletionItemKind.Unit,
					textEdit: {
						range: range(10, 14, 10, 15),
						newText: '100px',
					},
				},
			],
		);
	});
	it('extension tag attribute completion', async () => {
		assert.deepStrictEqual(
			(await provideCompletion(getPositionParams(__filename, wikitext, 11, 7)))
				?.filter(({label}) => label.startsWith('c')),
			[
				{
					label: 'compact',
					kind: CompletionItemKind.Field,
					textEdit: {
						range: range(11, 6, 11, 7),
						newText: 'compact',
					},
				},
				{
					label: 'class',
					kind: CompletionItemKind.Property,
					textEdit: {
						range: range(11, 6, 11, 7),
						newText: 'class',
					},
				},
			],
		);
	});
	it('HTML tag attribute completion', async () => {
		assert.deepStrictEqual(
			(await provideCompletion(getPositionParams(__filename, wikitext, 12, 5)))
				?.filter(({label}) => label.startsWith('da')),
			[
				{
					label: 'datatype',
					kind: CompletionItemKind.Property,
					textEdit: {
						range: range(12, 3, 12, 5),
						newText: 'datatype',
					},
				},
				{
					label: 'data-',
					kind: CompletionItemKind.Variable,
					textEdit: {
						range: range(12, 3, 12, 5),
						newText: 'data-',
					},
				},
			],
		);
	});
	it('template parameter completion', async () => {
		assert.deepStrictEqual(
			(await provideCompletion(getPositionParams(__filename, wikitext, 13, 8)))
				?.filter(({label}) => /^c/iu.test(label)),
			[
				{
					label: 'CC',
					kind: CompletionItemKind.Variable,
					textEdit: {
						range: range(13, 6, 13, 8),
						newText: 'CC',
					},
				},
			],
		);
	});
});
