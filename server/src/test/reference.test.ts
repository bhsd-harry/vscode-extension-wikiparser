import * as assert from 'assert';
import {Location as Loc} from 'vscode-languageserver/node';
import {getPositionParams, range, textEdit} from './util';
import {provideReferences, provideDefinition, prepareRename, provideRename} from '../lsp';
import type {Range as TextRange} from 'vscode-languageserver/node';

const location = (startLine: number, startCharacter: number, endLine: number, endCharacter: number): Loc =>
		Loc.create(__filename, range(startLine, startCharacter, endLine, endCharacter)),
	referencesTest = (title: string, text: string, character: number, locations: Loc[]): void => {
		it(title, async () => {
			assert.deepStrictEqual(
				await provideReferences(getPositionParams(__filename, text, 0, character)),
				locations.toReversed(),
			);
		});
	},
	renameTest = (title: string, text: string, character: number, ranges: TextRange[]): void => {
		it(`prepare: ${title}`, async () => {
			assert.deepStrictEqual(
				await prepareRename(getPositionParams(__filename, text, 0, character)),
				ranges[0],
			);
		});
		it(`rename: ${title}`, async () => {
			assert.deepStrictEqual(
				await provideRename({...getPositionParams(__filename, text, 0, character), newName: 'x'}),
				{
					changes: {
						[__filename]: ranges.map(r => textEdit(r, 'x')).reverse(),
					},
				},
			);
		});
	};

const headings = [
	location(0, 0, 0, 7),
	location(1, 0, 1, 7),
];

describe('referencesProvider', () => {
	referencesTest(
		'arg-name',
		`{{{ a }}}
{{{a|}}}`,
		4,
		[
			location(0, 3, 0, 6),
			location(1, 3, 1, 4),
		],
	);
	referencesTest(
		'template-name',
		`{{ b }}
{{ : template : b |b=}}`,
		4,
		[
			location(0, 2, 0, 5),
			location(1, 2, 1, 18),
		],
	);
	referencesTest(
		'magic-word-name',
		`{{ PAGENAME }}
{{PAGENAME:c}}`,
		4,
		[
			location(0, 2, 0, 12),
			location(1, 2, 1, 10),
		],
	);
	referencesTest(
		'link-target',
		`[[ file : d | thumb ]]
[[ :file:d ]]`,
		4,
		[
			location(0, 2, 0, 12),
			location(1, 2, 1, 11),
		],
	);
	referencesTest(
		'parameter-key',
		`{{ e | e = }}
{{Template:E|e=}}`,
		8,
		[
			location(0, 6, 0, 11),
			location(1, 13, 1, 15),
		],
	);
	referencesTest(
		'ext',
		`<ref group = f name = f > </ref>
<ref group = " f " extends = ' f ' />`,
		4,
		[
			location(0, 0, 0, 32),
			location(1, 0, 1, 37),
		],
	);
	referencesTest(
		'html',
		'<b ></b>',
		2,
		[
			location(0, 0, 0, 4),
			location(0, 4, 0, 8),
		],
	);
	referencesTest(
		'attr-key',
		`<ref group = f name = f > </ref>
<ref group = " f " extends = ' f ' />
<references group = f />`,
		6,
		[
			location(0, 5, 0, 10),
			location(1, 5, 1, 10),
			location(2, 12, 2, 17),
		],
	);
	referencesTest(
		'image-parameter',
		`[[ file : d | thumb ]]
[[file:g|thumbnail]]`,
		14,
		[
			location(0, 13, 0, 20),
			location(1, 9, 1, 18),
		],
	);
	for (const character of [1, 4]) {
		referencesTest(
			`heading${character === 1 ? '' : '-title'}`,
			`== h ==
== i ==`,
			character,
			headings,
		);
	}
	referencesTest(
		'attr-value#name',
		`<ref group = f name = f > </ref>
<ref group = " f " extends = ' f ' />`,
		23,
		[
			location(0, 22, 0, 23),
			location(1, 30, 1, 33),
		],
	);
	referencesTest(
		'attr-value#group',
		`<ref group = f name = f > </ref>
<ref group = " f " extends = ' f ' />
<references group = f />`,
		14,
		[
			location(0, 13, 0, 14),
			location(1, 14, 1, 17),
			location(2, 20, 2, 21),
		],
	);
});

describe('definitionProvider', () => {
	it('ref name', async () => {
		assert.deepStrictEqual(
			await provideDefinition(
				getPositionParams(
					__filename,
					`<ref group = f name = f > </ref>
<ref name = f > </ref>
<ref name = ' f ' />`,
					2,
					14,
				),
			),
			[location(1, 15, 1, 16)],
		);
	});
});

describe('renameProvider', () => {
	renameTest(
		'arg-name',
		`{{{ a }}}
{{{a|}}}`,
		4,
		[
			range(3, 6),
			range(1, 3, 1, 4),
		],
	);
	renameTest(
		'template-name',
		`{{ b }}
{{ : template : b |b=}}`,
		4,
		[
			range(2, 5),
			range(1, 2, 1, 18),
		],
	);
	renameTest(
		'link-target',
		`[[ :file:d ]]
[[ file : d | thumb ]]`,
		4,
		[range(2, 11)],
	);
	renameTest(
		'parameter-key',
		`{{ e | e = }}
{{Template:E|e=}}`,
		8,
		[
			range(6, 9),
			range(1, 13, 1, 14),
		],
	);
	renameTest(
		'attr-value#name',
		`<ref group = f name = f > </ref>
<ref group = " f " extends = ' f ' /><ref name=f/>`,
		23,
		[
			range(22, 23),
			range(1, 30, 1, 33),
		],
	);
	renameTest(
		'attr-value#group',
		`<ref group = f name = f > </ref>
<ref group = " f " extends = ' f ' /><ref name=f/>
<references group = f />`,
		14,
		[
			range(13, 14),
			range(1, 14, 1, 17),
			range(2, 20, 2, 21),
		],
	);
});
