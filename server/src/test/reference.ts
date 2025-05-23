import * as assert from 'assert';
import {getPositionParams, range} from './util';
import {provideReferences, provideDefinition, prepareRename, provideRename} from '../lsp';

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
<ref group = " f " name = ' f ' />
<b></b>
<references group = f />
[[file:g|thumbnail]]
== h ==
== i ==
`,
	headings = [
		{
			range: range(16, 0, 16, 7),
			uri: __filename,
		},
		{
			range: range(17, 0, 17, 7),
			uri: __filename,
		},
	].reverse();

describe('referencesProvider', () => {
	it('arg-name', async () => {
		assert.deepStrictEqual(
			await provideReferences(getPositionParams(__filename, wikitext, 1, 4)),
			[
				{
					range: range(1, 3, 1, 6),
					uri: __filename,
				},
				{
					range: range(2, 3, 2, 4),
					uri: __filename,
				},
			].reverse(),
		);
	});
	it('template-name', async () => {
		assert.deepStrictEqual(
			await provideReferences(getPositionParams(__filename, wikitext, 3, 4)),
			[
				{
					range: range(3, 2, 3, 5),
					uri: __filename,
				},
				{
					range: range(4, 2, 4, 18),
					uri: __filename,
				},
			].reverse(),
		);
	});
	it('magic-word-name', async () => {
		assert.deepStrictEqual(
			await provideReferences(getPositionParams(__filename, wikitext, 5, 4)),
			[
				{
					range: range(5, 2, 5, 12),
					uri: __filename,
				},
				{
					range: range(6, 2, 6, 10),
					uri: __filename,
				},
			].reverse(),
		);
	});
	it('link-target', async () => {
		assert.deepStrictEqual(
			await provideReferences(getPositionParams(__filename, wikitext, 7, 4)),
			[
				{
					range: range(7, 2, 7, 12),
					uri: __filename,
				},
				{
					range: range(8, 2, 8, 11),
					uri: __filename,
				},
			].reverse(),
		);
	});
	it('parameter-key', async () => {
		assert.deepStrictEqual(
			await provideReferences(getPositionParams(__filename, wikitext, 9, 8)),
			[
				{
					range: range(9, 6, 9, 11),
					uri: __filename,
				},
				{
					range: range(10, 13, 10, 15),
					uri: __filename,
				},
			].reverse(),
		);
	});
	it('ext', async () => {
		assert.deepStrictEqual(
			await provideReferences(getPositionParams(__filename, wikitext, 11, 2)),
			[
				{
					range: range(11, 0, 11, 32),
					uri: __filename,
				},
				{
					range: range(12, 0, 12, 34),
					uri: __filename,
				},
			].reverse(),
		);
	});
	it('html', async () => {
		assert.deepStrictEqual(
			await provideReferences(getPositionParams(__filename, wikitext, 13, 2)),
			[
				{
					range: range(13, 0, 13, 3),
					uri: __filename,
				},
				{
					range: range(13, 3, 13, 7),
					uri: __filename,
				},
			].reverse(),
		);
	});
	it('attr-key', async () => {
		assert.deepStrictEqual(
			await provideReferences(getPositionParams(__filename, wikitext, 11, 6)),
			[
				{
					range: range(11, 5, 11, 10),
					uri: __filename,
				},
				{
					range: range(12, 5, 12, 10),
					uri: __filename,
				},
				{
					range: range(14, 12, 14, 17),
					uri: __filename,
				},
			].reverse(),
		);
	});
	it('image-parameter', async () => {
		assert.deepStrictEqual(
			await provideReferences(getPositionParams(__filename, wikitext, 15, 10)),
			[
				{
					range: range(7, 13, 7, 20),
					uri: __filename,
				},
				{
					range: range(15, 9, 15, 18),
					uri: __filename,
				},
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
				{
					range: range(11, 22, 11, 23),
					uri: __filename,
				},
				{
					range: range(12, 27, 12, 30),
					uri: __filename,
				},
			].reverse(),
		);
	});
	it('attr-value#group', async () => {
		assert.deepStrictEqual(
			await provideReferences(getPositionParams(__filename, wikitext, 11, 14)),
			[
				{
					range: range(11, 13, 11, 14),
					uri: __filename,
				},
				{
					range: range(12, 14, 12, 17),
					uri: __filename,
				},
				{
					range: range(14, 20, 14, 21),
					uri: __filename,
				},
			].reverse(),
		);
	});
});

describe('definitionProvider', () => {
	it('ref name', async () => {
		assert.deepStrictEqual(
			await provideDefinition(getPositionParams(__filename, wikitext, 12, 28)),
			[
				{
					range: range(11, 25, 11, 26),
					uri: __filename,
				},
			],
		);
	});
});

describe('renameProvider', () => {
	it('prepare: arg-name', async () => {
		assert.deepStrictEqual(
			await prepareRename(getPositionParams(__filename, wikitext, 1, 4)),
			range(1, 3, 1, 6),
		);
	});
	it('rename: arg-name', async () => {
		assert.deepStrictEqual(
			await provideRename({...getPositionParams(__filename, wikitext, 1, 4), newName: 'x'}),
			{
				changes: {
					[__filename]: [
						{
							range: range(1, 3, 1, 6),
							newText: 'x',
						},
						{
							range: range(2, 3, 2, 4),
							newText: 'x',
						},
					].reverse(),
				},
			},
		);
	});
	it('prepare: template-name', async () => {
		assert.deepStrictEqual(
			await prepareRename(getPositionParams(__filename, wikitext, 3, 4)),
			range(3, 2, 3, 5),
		);
	});
	it('rename: template-name', async () => {
		assert.deepStrictEqual(
			await provideRename({...getPositionParams(__filename, wikitext, 3, 4), newName: 'x'}),
			{
				changes: {
					[__filename]: [
						{
							range: range(3, 2, 3, 5),
							newText: 'x',
						},
						{
							range: range(4, 2, 4, 18),
							newText: 'x',
						},
					].reverse(),
				},
			},
		);
	});
	it('prepare: link-target', async () => {
		assert.deepStrictEqual(
			await prepareRename(getPositionParams(__filename, wikitext, 8, 4)),
			range(8, 2, 8, 11),
		);
	});
	it('rename: link-target', async () => {
		assert.deepStrictEqual(
			await provideRename({...getPositionParams(__filename, wikitext, 8, 4), newName: 'x'}),
			{
				changes: {
					[__filename]: [
						{
							range: range(8, 2, 8, 11),
							newText: 'x',
						},
					],
				},
			},
		);
	});
	it('prepare: parameter-key', async () => {
		assert.deepStrictEqual(
			await prepareRename(getPositionParams(__filename, wikitext, 9, 8)),
			range(9, 6, 9, 9),
		);
	});
	it('rename: parameter-key', async () => {
		assert.deepStrictEqual(
			await provideRename({...getPositionParams(__filename, wikitext, 9, 8), newName: 'x'}),
			{
				changes: {
					[__filename]: [
						{
							range: range(9, 6, 9, 9),
							newText: 'x',
						},
						{
							range: range(10, 13, 10, 14),
							newText: 'x',
						},
					].reverse(),
				},
			},
		);
	});
	it('prepare: attr-value#name', async () => {
		assert.deepStrictEqual(
			await prepareRename(getPositionParams(__filename, wikitext, 11, 23)),
			range(11, 22, 11, 23),
		);
	});
	it('rename: attr-value#name', async () => {
		assert.deepStrictEqual(
			await provideRename({...getPositionParams(__filename, wikitext, 11, 23), newName: 'x'}),
			{
				changes: {
					[__filename]: [
						{
							range: range(11, 22, 11, 23),
							newText: 'x',
						},
						{
							range: range(12, 27, 12, 30),
							newText: 'x',
						},
					].reverse(),
				},
			},
		);
	});
	it('prepare: attr-value#group', async () => {
		assert.deepStrictEqual(
			await prepareRename(getPositionParams(__filename, wikitext, 11, 14)),
			range(11, 13, 11, 14),
		);
	});
	it('rename: attr-value#group', async () => {
		assert.deepStrictEqual(
			await provideRename({...getPositionParams(__filename, wikitext, 11, 14), newName: 'x'}),
			{
				changes: {
					[__filename]: [
						{
							range: range(11, 13, 11, 14),
							newText: 'x',
						},
						{
							range: range(12, 14, 12, 17),
							newText: 'x',
						},
						{
							range: range(14, 20, 14, 21),
							newText: 'x',
						},
					].reverse(),
				},
			},
		);
	});
});
