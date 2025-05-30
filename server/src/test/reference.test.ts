import * as assert from 'assert';
import {Location as Loc} from 'vscode-languageserver/node';
import {getPositionParams, range, textEdit} from './util';
import {provideReferences, provideDefinition, prepareRename, provideRename} from '../lsp';
import type {Range as TextRange} from 'vscode-languageserver/node';

const location = (startLine: number, startCharacter: number, endLine: number, endCharacter: number): Loc =>
		Loc.create(__filename, range(startLine, startCharacter, endLine, endCharacter)),
	renameTest = (title: string, line: number, character: number, ranges: TextRange[]): void => {
		it(`prepare: ${title}`, async () => {
			assert.deepStrictEqual(
				await prepareRename(getPositionParams(__filename, wikitext, line, character)),
				ranges[0],
			);
		});
		it(`rename: ${title}`, async () => {
			assert.deepStrictEqual(
				await provideRename({...getPositionParams(__filename, wikitext, line, character), newName: 'x'}),
				{
					changes: {
						[__filename]: ranges.map(r => textEdit(r, 'x')).reverse(),
					},
				},
			);
		});
	};

const wikitext = `
{{{ a }}}
{{{a|}}}
{{ b }}
{{ : template : b |b=}}
{{ PAGENAME }}
{{PAGENAME:c}}
[[ file : d | thumb ]]
[[ :file:d ]]
{{ e | e = }}
{{Template:E|e=}}
<ref group = f name = f > </ref>
<ref group = " f " extends = ' f ' />
<b ></b>
<references group = f />
[[file:g|thumbnail]]
== h ==
== i ==
<ref name = f > </ref>
<ref name = ' f ' />
`,
	headings = [
		location(16, 0, 16, 7),
		location(17, 0, 17, 7),
	].reverse();

describe('referencesProvider', () => {
	it('arg-name', async () => {
		assert.deepStrictEqual(
			await provideReferences(getPositionParams(__filename, wikitext, 1, 4)),
			[
				location(1, 3, 1, 6),
				location(2, 3, 2, 4),
			].reverse(),
		);
	});
	it('template-name', async () => {
		assert.deepStrictEqual(
			await provideReferences(getPositionParams(__filename, wikitext, 3, 4)),
			[
				location(3, 2, 3, 5),
				location(4, 2, 4, 18),
			].reverse(),
		);
	});
	it('magic-word-name', async () => {
		assert.deepStrictEqual(
			await provideReferences(getPositionParams(__filename, wikitext, 5, 4)),
			[
				location(5, 2, 5, 12),
				location(6, 2, 6, 10),
			].reverse(),
		);
	});
	it('link-target', async () => {
		assert.deepStrictEqual(
			await provideReferences(getPositionParams(__filename, wikitext, 7, 4)),
			[
				location(7, 2, 7, 12),
				location(8, 2, 8, 11),
			].reverse(),
		);
	});
	it('parameter-key', async () => {
		assert.deepStrictEqual(
			await provideReferences(getPositionParams(__filename, wikitext, 9, 8)),
			[
				location(9, 6, 9, 11),
				location(10, 13, 10, 15),
			].reverse(),
		);
	});
	it('ext', async () => {
		assert.deepStrictEqual(
			await provideReferences(getPositionParams(__filename, wikitext, 11, 4)),
			[
				location(11, 0, 11, 32),
				location(12, 0, 12, 37),
				location(18, 0, 18, 22),
				location(19, 0, 19, 20),
			].reverse(),
		);
	});
	it('html', async () => {
		assert.deepStrictEqual(
			await provideReferences(getPositionParams(__filename, wikitext, 13, 2)),
			[
				location(13, 0, 13, 4),
				location(13, 4, 13, 8),
			].reverse(),
		);
	});
	it('attr-key', async () => {
		assert.deepStrictEqual(
			await provideReferences(getPositionParams(__filename, wikitext, 11, 6)),
			[
				location(11, 5, 11, 10),
				location(12, 5, 12, 10),
				location(14, 12, 14, 17),
			].reverse(),
		);
	});
	it('image-parameter', async () => {
		assert.deepStrictEqual(
			await provideReferences(getPositionParams(__filename, wikitext, 15, 10)),
			[
				location(7, 13, 7, 20),
				location(15, 9, 15, 18),
			].reverse(),
		);
	});
	it('heading-title', async () => {
		assert.deepStrictEqual(
			await provideReferences(getPositionParams(__filename, wikitext, 16, 4)),
			headings,
		);
	});
	it('heading', async () => {
		assert.deepStrictEqual(
			await provideReferences(getPositionParams(__filename, wikitext, 16, 1)),
			headings,
		);
	});
	it('attr-value#name', async () => {
		assert.deepStrictEqual(
			await provideReferences(getPositionParams(__filename, wikitext, 11, 23)),
			[
				location(11, 22, 11, 23),
				location(12, 30, 12, 33),
				location(18, 12, 18, 13),
				location(19, 13, 19, 16),
			].reverse(),
		);
	});
	it('attr-value#group', async () => {
		assert.deepStrictEqual(
			await provideReferences(getPositionParams(__filename, wikitext, 11, 14)),
			[
				location(11, 13, 11, 14),
				location(12, 14, 12, 17),
				location(14, 20, 14, 21),
			].reverse(),
		);
	});
});

describe('definitionProvider', () => {
	it('ref name', async () => {
		assert.deepStrictEqual(
			await provideDefinition(getPositionParams(__filename, wikitext, 19, 14)),
			[location(18, 15, 18, 16)],
		);
	});
});

describe('renameProvider', () => {
	renameTest('arg-name', 1, 4, [
		range(1, 3, 1, 6),
		range(2, 3, 2, 4),
	]);
	renameTest('template-name', 3, 4, [
		range(3, 2, 3, 5),
		range(4, 2, 4, 18),
	]);
	renameTest('link-target', 8, 4, [range(8, 2, 8, 11)]);
	renameTest('parameter-key', 9, 8, [
		range(9, 6, 9, 9),
		range(10, 13, 10, 14),
	]);
	renameTest('attr-value#name', 11, 23, [
		range(11, 22, 11, 23),
		range(12, 30, 12, 33),
	]);
	renameTest('attr-value#group', 11, 14, [
		range(11, 13, 11, 14),
		range(12, 14, 12, 17),
		range(14, 20, 14, 21),
	]);
});
