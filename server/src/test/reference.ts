import * as assert from 'assert';
import {getPositionParams} from './util';
import {provideReferences, provideDefinition, prepareRename, provideRename} from '../reference';

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
<b></b>
<references group = f />
[[file:g|thumbnail]]
== h ==
== i ==
`;

describe('referencesProvider', () => {
	it('arg-name', async () => {
		assert.deepStrictEqual(
			await provideReferences(getPositionParams(__filename, wikitext, 1, 4)),
			[
				{
					range: {start: {line: 1, character: 3}, end: {line: 1, character: 6}},
					uri: __filename,
				},
				{
					range: {start: {line: 2, character: 3}, end: {line: 2, character: 4}},
					uri: __filename,
				},
			],
		);
	});
	it('template-name', async () => {
		assert.deepStrictEqual(
			await provideReferences(getPositionParams(__filename, wikitext, 3, 4)),
			[
				{
					range: {start: {line: 3, character: 2}, end: {line: 3, character: 5}},
					uri: __filename,
				},
				{
					range: {start: {line: 4, character: 2}, end: {line: 4, character: 18}},
					uri: __filename,
				},
			],
		);
	});
	it('magic-word-name', async () => {
		assert.deepStrictEqual(
			await provideReferences(getPositionParams(__filename, wikitext, 5, 4)),
			[
				{
					range: {start: {line: 5, character: 2}, end: {line: 5, character: 12}},
					uri: __filename,
				},
				{
					range: {start: {line: 6, character: 2}, end: {line: 6, character: 10}},
					uri: __filename,
				},
			],
		);
	});
	it('link-target', async () => {
		assert.deepStrictEqual(
			await provideReferences(getPositionParams(__filename, wikitext, 7, 4)),
			[
				{
					range: {start: {line: 7, character: 2}, end: {line: 7, character: 12}},
					uri: __filename,
				},
				{
					range: {start: {line: 8, character: 2}, end: {line: 8, character: 11}},
					uri: __filename,
				},
			],
		);
	});
	it('parameter-key', async () => {
		assert.deepStrictEqual(
			await provideReferences(getPositionParams(__filename, wikitext, 9, 8)),
			[
				{
					range: {start: {line: 9, character: 6}, end: {line: 9, character: 11}},
					uri: __filename,
				},
				{
					range: {start: {line: 10, character: 13}, end: {line: 10, character: 15}},
					uri: __filename,
				},
			],
		);
	});
	it('ext', async () => {
		assert.deepStrictEqual(
			await provideReferences(getPositionParams(__filename, wikitext, 11, 2)),
			[
				{
					range: {start: {line: 11, character: 0}, end: {line: 11, character: 32}},
					uri: __filename,
				},
				{
					range: {start: {line: 12, character: 0}, end: {line: 12, character: 37}},
					uri: __filename,
				},
			],
		);
	});
	it('html', async () => {
		assert.deepStrictEqual(
			await provideReferences(getPositionParams(__filename, wikitext, 13, 2)),
			[
				{
					range: {start: {line: 13, character: 0}, end: {line: 13, character: 3}},
					uri: __filename,
				},
				{
					range: {start: {line: 13, character: 3}, end: {line: 13, character: 7}},
					uri: __filename,
				},
			],
		);
	});
	it('attr-key', async () => {
		assert.deepStrictEqual(
			await provideReferences(getPositionParams(__filename, wikitext, 11, 6)),
			[
				{
					range: {start: {line: 11, character: 5}, end: {line: 11, character: 10}},
					uri: __filename,
				},
				{
					range: {start: {line: 12, character: 5}, end: {line: 12, character: 10}},
					uri: __filename,
				},
				{
					range: {start: {line: 14, character: 12}, end: {line: 14, character: 17}},
					uri: __filename,
				},
			],
		);
	});
	it('image-parameter', async () => {
		assert.deepStrictEqual(
			await provideReferences(getPositionParams(__filename, wikitext, 15, 10)),
			[
				{
					range: {start: {line: 7, character: 13}, end: {line: 7, character: 20}},
					uri: __filename,
				},
				{
					range: {start: {line: 15, character: 9}, end: {line: 15, character: 18}},
					uri: __filename,
				},
			],
		);
	});
	it('heading-title', async () => {
		assert.deepStrictEqual(
			await provideReferences(getPositionParams(__filename, wikitext, 16, 4)),
			[
				{
					range: {start: {line: 16, character: 0}, end: {line: 16, character: 7}},
					uri: __filename,
				},
				{
					range: {start: {line: 17, character: 0}, end: {line: 17, character: 7}},
					uri: __filename,
				},
			],
		);
	});
	it('heading', async () => {
		assert.deepStrictEqual(
			await provideReferences(getPositionParams(__filename, wikitext, 16, 1)),
			[
				{
					range: {start: {line: 16, character: 0}, end: {line: 16, character: 7}},
					uri: __filename,
				},
				{
					range: {start: {line: 17, character: 0}, end: {line: 17, character: 7}},
					uri: __filename,
				},
			],
		);
	});
	it('attr-value#name', async () => {
		assert.deepStrictEqual(
			await provideReferences(getPositionParams(__filename, wikitext, 11, 23)),
			[
				{
					range: {start: {line: 11, character: 22}, end: {line: 11, character: 23}},
					uri: __filename,
				},
				{
					range: {start: {line: 12, character: 30}, end: {line: 12, character: 33}},
					uri: __filename,
				},
			],
		);
	});
	it('attr-value#group', async () => {
		assert.deepStrictEqual(
			await provideReferences(getPositionParams(__filename, wikitext, 11, 14)),
			[
				{
					range: {start: {line: 11, character: 13}, end: {line: 11, character: 14}},
					uri: __filename,
				},
				{
					range: {start: {line: 12, character: 14}, end: {line: 12, character: 17}},
					uri: __filename,
				},
				{
					range: {start: {line: 14, character: 20}, end: {line: 14, character: 21}},
					uri: __filename,
				},
			],
		);
	});
});

describe('definitionProvider', () => {
	it('ref name', async () => {
		assert.deepStrictEqual(
			await provideDefinition(getPositionParams(__filename, wikitext, 12, 32)),
			[
				{
					range: {start: {line: 11, character: 22}, end: {line: 11, character: 23}},
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
			{start: {line: 1, character: 3}, end: {line: 1, character: 6}},
		);
	});
	it('rename: arg-name', async () => {
		assert.deepStrictEqual(
			await provideRename({...getPositionParams(__filename, wikitext, 1, 4), newName: 'x'}),
			{
				changes: {
					[__filename]: [
						{
							range: {start: {line: 1, character: 3}, end: {line: 1, character: 6}},
							newText: 'x',
						},
						{
							range: {start: {line: 2, character: 3}, end: {line: 2, character: 4}},
							newText: 'x',
						},
					],
				},
			},
		);
	});
	it('prepare: template-name', async () => {
		assert.deepStrictEqual(
			await prepareRename(getPositionParams(__filename, wikitext, 3, 4)),
			{start: {line: 3, character: 2}, end: {line: 3, character: 5}},
		);
	});
	it('rename: template-name', async () => {
		assert.deepStrictEqual(
			await provideRename({...getPositionParams(__filename, wikitext, 3, 4), newName: 'x'}),
			{
				changes: {
					[__filename]: [
						{
							range: {start: {line: 3, character: 2}, end: {line: 3, character: 5}},
							newText: 'x',
						},
						{
							range: {start: {line: 4, character: 2}, end: {line: 4, character: 18}},
							newText: 'x',
						},
					],
				},
			},
		);
	});
	it('prepare: magic-word-name', async () => {
		assert.deepStrictEqual(
			await prepareRename(getPositionParams(__filename, wikitext, 5, 4)),
			{start: {line: 5, character: 2}, end: {line: 5, character: 12}},
		);
	});
	it('rename: magic-word-name', async () => {
		assert.deepStrictEqual(
			await provideRename({...getPositionParams(__filename, wikitext, 5, 4), newName: 'PAGENAMEE'}),
			{
				changes: {
					[__filename]: [
						{
							range: {start: {line: 5, character: 2}, end: {line: 5, character: 12}},
							newText: 'PAGENAMEE',
						},
						{
							range: {start: {line: 6, character: 2}, end: {line: 6, character: 10}},
							newText: 'PAGENAMEE',
						},
					],
				},
			},
		);
	});
	it('prepare: link-target', async () => {
		assert.deepStrictEqual(
			await prepareRename(getPositionParams(__filename, wikitext, 7, 4)),
			{start: {line: 7, character: 2}, end: {line: 7, character: 12}},
		);
	});
	it('rename: link-target', async () => {
		assert.deepStrictEqual(
			await provideRename({...getPositionParams(__filename, wikitext, 7, 4), newName: 'x'}),
			{
				changes: {
					[__filename]: [
						{
							range: {start: {line: 7, character: 2}, end: {line: 7, character: 12}},
							newText: 'x',
						},
						{
							range: {start: {line: 8, character: 2}, end: {line: 8, character: 11}},
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
			{start: {line: 9, character: 6}, end: {line: 9, character: 9}},
		);
	});
	it('rename: parameter-key', async () => {
		assert.deepStrictEqual(
			await provideRename({...getPositionParams(__filename, wikitext, 9, 8), newName: 'x'}),
			{
				changes: {
					[__filename]: [
						{
							range: {start: {line: 9, character: 6}, end: {line: 9, character: 9}},
							newText: 'x',
						},
						{
							range: {start: {line: 10, character: 13}, end: {line: 10, character: 14}},
							newText: 'x',
						},
					],
				},
			},
		);
	});
	it('prepare: attr-value#name', async () => {
		assert.deepStrictEqual(
			await prepareRename(getPositionParams(__filename, wikitext, 11, 23)),
			{start: {line: 11, character: 22}, end: {line: 11, character: 23}},
		);
	});
	it('rename: attr-value#name', async () => {
		assert.deepStrictEqual(
			await provideRename({...getPositionParams(__filename, wikitext, 11, 23), newName: 'x'}),
			{
				changes: {
					[__filename]: [
						{
							range: {start: {line: 11, character: 22}, end: {line: 11, character: 23}},
							newText: 'x',
						},
						{
							range: {start: {line: 12, character: 30}, end: {line: 12, character: 33}},
							newText: 'x',
						},
					],
				},
			},
		);
	});
	it('prepare: attr-value#group', async () => {
		assert.deepStrictEqual(
			await prepareRename(getPositionParams(__filename, wikitext, 11, 14)),
			{start: {line: 11, character: 13}, end: {line: 11, character: 14}},
		);
	});
	it('rename: attr-value#group', async () => {
		assert.deepStrictEqual(
			await provideRename({...getPositionParams(__filename, wikitext, 11, 14), newName: 'x'}),
			{
				changes: {
					[__filename]: [
						{
							range: {start: {line: 11, character: 13}, end: {line: 11, character: 14}},
							newText: 'x',
						},
						{
							range: {start: {line: 12, character: 14}, end: {line: 12, character: 17}},
							newText: 'x',
						},
						{
							range: {start: {line: 14, character: 20}, end: {line: 14, character: 21}},
							newText: 'x',
						},
					],
				},
			},
		);
	});
});
