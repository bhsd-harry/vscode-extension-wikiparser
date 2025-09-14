import * as assert from 'assert';
import {CompletionItemKind} from 'vscode-languageserver/node';
import {getPositionParams, range} from './util';
import {provideCompletion} from '../lsp';
import type {CompletionItem} from 'vscode-languageserver/node';

const completion = (content: string, character: number): Promise<CompletionItem[] | undefined> =>
	provideCompletion(getPositionParams(__filename, content, 0, character));

describe('CompletionItem', () => {
	it('opening tag', async () => {
		assert.deepStrictEqual(
			(await completion('<Im', 3))
				?.filter(({label}) => label.startsWith('im')),
			[
				{
					label: 'imagemap',
					kind: CompletionItemKind.Class,
					textEdit: {
						range: range(1, 3),
						newText: 'imagemap',
					},
				},
				{
					label: 'img',
					kind: CompletionItemKind.Class,
					textEdit: {
						range: range(1, 3),
						newText: 'img',
					},
				},
			],
		);
	});
	it('closing tag', async () => {
		assert.deepStrictEqual(
			(await completion('</Im', 4))
				?.filter(({label}) => label.startsWith('im')),
			[
				{
					label: 'imagemap',
					kind: CompletionItemKind.Class,
					textEdit: {
						range: range(2, 4),
						newText: 'imagemap>',
					},
				},
				{
					label: 'img',
					kind: CompletionItemKind.Class,
					textEdit: {
						range: range(2, 4),
						newText: 'img>',
					},
				},
			],
		);
	});
	it('argument completion', async () => {
		assert.deepStrictEqual(
			await completion('{{{ a }}}{{{1}}}', 5),
			[
				{
					label: '1',
					kind: CompletionItemKind.Variable,
					textEdit: {
						range: range(4, 5),
						newText: '1',
					},
				},
			],
		);
	});
	it('link completion', async () => {
		assert.deepStrictEqual(
			(await completion('[[ a ]][[:AA]]', 4))
				?.filter(({label}) => /^a/iu.test(label)),
			[
				{
					label: 'AA',
					kind: CompletionItemKind.Folder,
					textEdit: {
						range: range(3, 4),
						newText: 'AA',
					},
				},
			],
		);
	});
	it('file completion', async () => {
		assert.deepStrictEqual(
			(await completion('[[ : file : b ]][[ file : c ]]', 11))
				?.filter(({label}) => /^file:/iu.test(label)),
			[
				{
					label: 'File:C',
					kind: CompletionItemKind.Folder,
					textEdit: {
						range: range(5, 11),
						newText: 'File:C',
					},
				},
			],
		);
	});
	it('parser function completion', async () => {
		assert.deepStrictEqual(
			(await completion('{{ #Ifexp', 9))
				?.filter(({label}) => /^#ifexp/iu.test(label)),
			[
				{
					label: '#ifexpr',
					kind: CompletionItemKind.Function,
					textEdit: {
						range: range(3, 9),
						newText: '#ifexpr',
					},
					documentation: {
						kind: 'markdown',
						value: 'This function evaluates a mathematical expression and returns one of two strings '
							+ 'depending on the boolean value of the result.\n\n'
							+ 'The `expression` input is evaluated exactly as for `#expr`, '
							+ 'with the same operators being available. '
							+ 'The output is then evaluated as a boolean expression.\n\n'
							+ 'An empty input expression evaluates to `false`.\n\n'
							+ 'An empty or wrong input expression (an error message is treated as an empty string; '
							+ 'it is not equal to zero, so we get `value if true`).',
					},
				},
			],
		);
	});
	it('template completion', async () => {
		assert.deepStrictEqual(
			(await completion('{{ pagenamee }}{{PageNamee}}', 12))
				?.filter(({label}) => /^pagenamee/iu.test(label)),
			[
				{
					label: 'PAGENAMEE',
					kind: CompletionItemKind.Function,
					textEdit: {
						range: range(3, 12),
						newText: 'PAGENAMEE',
					},
					documentation: {
						kind: 'markdown',
						value: 'URL encoded page name, including all subpage levels, but without the namespace.',
					},
				},
				{
					label: 'PageNamee',
					kind: CompletionItemKind.Folder,
					textEdit: {
						range: range(3, 12),
						newText: 'PageNamee',
					},
				},
			],
		);
	});
	it('behavior switch completion', async () => {
		assert.deepStrictEqual(
			(await completion('__T', 3))
				?.filter(({label}) => /^__t/iu.test(label)),
			[
				{
					label: '__toc__',
					kind: CompletionItemKind.Constant,
					textEdit: {
						range: range(0, 3),
						newText: '__toc__',
					},
					documentation: {
						kind: 'markdown',
						value: "Places a table of contents at the word's current position (overriding `__NOTOC__`). "
							+ 'If this is used multiple times, '
							+ "the table of contents will appear at the first word's position.",
					},
				},
			],
		);
	});
	it('protocol completion', async () => {
		assert.deepStrictEqual(
			(await completion('[Gi', 3))
				?.filter(({label}) => label.startsWith('gi')),
			[
				{
					label: 'git://',
					kind: CompletionItemKind.Reference,
					textEdit: {
						range: range(1, 3),
						newText: 'git://',
					},
				},
			],
		);
	});
	it('image parameter completion', async () => {
		assert.deepStrictEqual(
			(await completion('[[ file : c | Thumbnail ]]', 20))
				?.filter(({label}) => label.startsWith('thumbn')),
			[
				{
					label: 'thumbnail',
					kind: CompletionItemKind.Property,
					textEdit: {
						range: range(14, 20),
						newText: 'thumbnail',
					},
				},
				{
					label: 'thumbnail=',
					kind: CompletionItemKind.Property,
					textEdit: {
						range: range(14, 20),
						newText: 'thumbnail=',
					},
				},
			],
		);
	});
	it('image width completion', async () => {
		assert.deepStrictEqual(
			(await completion(
				`[[ file : c | 100px ]]
[[ file : c | Thumbnail | 100x100px ]]`,
				20,
			))?.filter(({label}) => label.startsWith('1')),
			[
				{
					label: '100x100px',
					kind: CompletionItemKind.Unit,
					textEdit: {
						range: range(14, 20),
						newText: '100x100px',
					},
				},
			],
		);
	});
	it('extension tag attribute completion', async () => {
		assert.deepStrictEqual(
			(await completion('<poem C', 7))
				?.filter(({label}) => label.startsWith('c')),
			[
				{
					label: 'compact',
					kind: CompletionItemKind.Field,
					textEdit: {
						range: range(6, 7),
						newText: 'compact',
					},
				},
				{
					label: 'class',
					kind: CompletionItemKind.Property,
					textEdit: {
						range: range(6, 7),
						newText: 'class',
					},
				},
			],
		);
		assert.deepStrictEqual(
			(await completion('<ref n', 6))
				?.filter(({label}) => label.startsWith('n')),
			[
				{
					label: 'name',
					kind: CompletionItemKind.Field,
					textEdit: {
						range: range(5, 6),
						newText: 'name',
					},
				},
			],
		);
	});
	it('HTML tag attribute completion', async () => {
		assert.deepStrictEqual(
			(await completion('<p Da', 5))
				?.filter(({label}) => label.startsWith('da')),
			[
				{
					label: 'datatype',
					kind: CompletionItemKind.Property,
					textEdit: {
						range: range(3, 5),
						newText: 'datatype',
					},
				},
				{
					label: 'data-',
					kind: CompletionItemKind.Variable,
					textEdit: {
						range: range(3, 5),
						newText: 'data-',
					},
				},
			],
		);
	});
	it('template parameter completion', async () => {
		assert.deepStrictEqual(
			(await completion('{{ c | ca= | CC = }}', 8))
				?.filter(({label}) => /^c/iu.test(label)),
			[
				{
					label: 'CC',
					kind: CompletionItemKind.Variable,
					textEdit: {
						range: range(7, 8),
						newText: 'CC',
					},
				},
			],
		);
	});
	it('table attribute completion', async () => {
		assert.deepStrictEqual(
			(await completion('{| style="" dir=l', 5))
				?.filter(({label}) => label.startsWith('st')),
			[
				{
					label: 'style',
					kind: CompletionItemKind.Property,
					textEdit: {
						range: range(3, 5),
						newText: 'style',
					},
				},
			],
		);
	});
	it('HTML tag attribute value completion', async () => {
		assert.deepStrictEqual(
			(await completion('{| style="" dir=l', 17))
				?.filter(({label}) => label.startsWith('l')),
			[
				{
					label: 'ltr',
					kind: CompletionItemKind.Value,
					textEdit: {
						range: range(16, 17),
						newText: 'ltr',
					},
				},
			],
		);
	});
	it('inline CSS key completion', async () => {
		assert.deepStrictEqual(
			(await completion('<p style=user-select:none;us>', 11))
				?.filter(({label}) => label.startsWith('us'))
				.map(({label, kind, textEdit}) => ({label, kind, textEdit})),
			[
				{
					label: 'user-select',
					kind: CompletionItemKind.Property,
					textEdit: {
						range: range(9, 20),
						newText: 'user-select',
					},
				},
			],
		);
		assert.deepStrictEqual(
			(await completion('<p style=user-select:none;us>', 28))
				?.filter(({label}) => label.startsWith('us'))
				.map(({label, kind, textEdit}) => ({label, kind, textEdit})),
			[
				{
					label: 'user-select',
					kind: CompletionItemKind.Property,
					textEdit: {
						range: range(26, 28),
						newText: 'user-select:$0;',
					},
				},
			],
		);
	});
	it('inline CSS value completion', async () => {
		assert.deepStrictEqual(
			(await completion('<p style=user-select:none;us>', 21))
				?.filter(({label}) => label.startsWith('n'))
				.map(({label, kind, textEdit}) => ({label, kind, textEdit})),
			[
				{
					label: 'none',
					kind: CompletionItemKind.Value,
					textEdit: {
						range: range(21, 25),
						newText: 'none',
					},
				},
			],
		);
	});
	it('JSON schema completion', async () => {
		assert.deepStrictEqual(
			(await completion('<templatedata>{"d":""}</templatedata>', 17))
				?.filter(({label}) => label.startsWith('d'))
				.map(({label, kind, textEdit}) => ({label, kind, textEdit})),
			[
				{
					label: 'description',
					kind: CompletionItemKind.Property,
					textEdit: {
						range: range(15, 18),
						newText: '"description"',
					},
				},
			],
		);
	});
	it('score completion', async () => {
		assert.deepStrictEqual(
			(await completion(String.raw`<score>\rel</score>`, 11))
				?.filter(({label}) => /^\\rel/iu.test(label)),
			[
				{
					label: String.raw`\relative`,
					kind: CompletionItemKind.Function,
					textEdit: {
						range: range(7, 11),
						newText: String.raw`\relative`,
					},
				},
			],
		);
	});
	it('math completion', async () => {
		assert.deepStrictEqual(
			(await completion(String.raw`<math chem>\ce</math>`, 14))
				?.filter(({label}) => /^\\ce/iu.test(label)),
			[
				{
					label: String.raw`\centerdot`,
					kind: CompletionItemKind.Function,
					textEdit: {
						range: range(11, 14),
						newText: String.raw`\centerdot`,
					},
				},
				{
					label: String.raw`\ce`,
					kind: CompletionItemKind.Function,
					textEdit: {
						range: range(11, 14),
						newText: String.raw`\ce`,
					},
				},
			],
		);
	});
});
