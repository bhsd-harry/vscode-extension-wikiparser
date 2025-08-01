import * as assert from 'assert';
import {execSync} from 'child_process';
import {CodeActionKind} from 'vscode-languageserver/node';
import {getParams, range} from './util';
import {provideDiagnostics, provideCodeAction} from '../lsp';
import type {Diagnostic, CodeAction, CodeActionParams} from 'vscode-languageserver/node';
import type {QuickFixData} from '../lsp';

let lilypond: string | undefined;
try {
	lilypond = execSync('which lilypond', {encoding: 'utf8'}).trim();
} catch {}
const wikitext = String.raw`
http://a]
</br>
[
`,
	params = getParams(__filename, wikitext),
	diagnostics: (Omit<Diagnostic, 'data'> & {data: QuickFixData[]})[] = [
		{
			range: range(1, 8, 1, 9),
			severity: 1,
			source: 'WikiLint',
			code: 'lonely-bracket',
			message: 'lonely "]"',
			data: [
				{
					range: range(1, 0, 1, 0),
					newText: '[',
					title: 'Suggestion: left bracket',
					fix: false,
				},
			],
		},
		{
			range: range(2, 0, 2, 5),
			severity: 2,
			source: 'WikiLint',
			code: 'unmatched-tag',
			message: 'tag that is both closing and self-closing',
			data: [
				{
					range: range(2, 1, 2, 2),
					newText: '',
					title: 'Fix: open',
					fix: true,
				},
			],
		},
		{
			range: range(3, 0, 3, 1),
			severity: 2,
			source: 'WikiLint',
			code: 'lonely-bracket',
			message: 'lonely "["',
			data: [],
		},
	],
	errors = diagnostics.slice(0, 1);

describe('Diagnostic/CodeAction', () => {
	it('diagnostic', async () => {
		assert.deepStrictEqual(await provideDiagnostics(params, true), diagnostics);
	});
	it('quickFix', () => {
		assert.deepStrictEqual(
			provideCodeAction({...params, context: {diagnostics}} as unknown as CodeActionParams),
			diagnostics.filter(({data}) => data.length > 0)
				.map((diagnostic): CodeAction => ({
					title: diagnostic.data[0]!.title,
					kind: CodeActionKind.QuickFix,
					diagnostics: [diagnostic],
					isPreferred: diagnostic.data[0]!.fix,
					edit: {
						changes: {[params.textDocument.uri]: diagnostic.data},
					},
				})),
		);
	});
	it('no warning', async () => {
		assert.deepStrictEqual(await provideDiagnostics(params, false), errors);
	});
});

const getDiagnostics = (text: string): Promise<Diagnostic[]> => provideDiagnostics(
	getParams(__filename, text),
	true,
	lilypond,
	'mathjax',
);

describe('Diagnostic (JSON)', () => {
	it('templatedata', async () => {
		assert.deepStrictEqual(
			await getDiagnostics('<templatedata>a</templatedata>'),
			[
				{
					range: range(14, 15),
					severity: 1,
					source: 'json',
					code: 0,
					message: 'Expected a JSON object, array or literal.',
				},
			],
		);
	});
	it('mapframe', async () => {
		assert.deepStrictEqual(
			await getDiagnostics(`<mapframe>[
0, // comment
]</mapframe>`),
			[
				{
					range: range(0, 10, 2, 1),
					severity: 2,
					source: 'json',
					message: 'Incorrect type. Expected "object".',
				},
			],
		);
	});
	it('maplink', async () => {
		assert.deepStrictEqual(
			await getDiagnostics(`<maplink>{
"type":"Point",
"type":"Feature"
}</maplink>`),
			[
				{
					range: range(1, 0, 1, 6),
					severity: 2,
					source: 'json',
					code: 520,
					message: 'Duplicate object key',
				},
				{
					range: range(2, 0, 2, 6),
					severity: 2,
					source: 'json',
					code: 520,
					message: 'Duplicate object key',
				},
				{
					range: range(9, 10),
					severity: 2,
					source: 'json',
					message: 'Missing property "geometry".',
				},
				{
					range: range(9, 10),
					severity: 2,
					source: 'json',
					message: 'Missing property "properties".',
				},
			].reverse(),
		);
	});
});

describe('Diagnostic (CSS)', () => {
	it('ext-attr', async () => {
		assert.deepStrictEqual(
			(await getDiagnostics('<poem style=0/>')).filter(({source}) => source !== 'Stylelint'),
			[
				{
					range: range(12, 13),
					severity: 1,
					source: 'css',
					code: 'css-rcurlyexpected',
					message: '} expected',
					data: [],
				},
			],
		);
	});
});

describe('Diagnostic (TeX)', () => {
	it('math', async () => {
		assert.deepStrictEqual(
			await getDiagnostics(String.raw`<math>#\ce</math>`),
			[
				{
					range: range(7, 10),
					severity: 2,
					source: 'MathJax',
					code: 'UnknownMacro',
					message: String.raw`Unknown macro "\ce"`,
				},
				{
					range: range(6, 10),
					severity: 1,
					source: 'MathJax',
					code: 'CantUseHash1',
					message: "You can't use 'macro parameter character #' in math mode",
				},
			],
		);
	});
});

if (lilypond) {
	describe('Diagnostic (LilyPond)', () => {
		it('score', async () => {
			assert.deepStrictEqual(
				await getDiagnostics("<score raw>{ c'4 e'5 g' }</score>"),
				[
					{
						range: range(19, 19),
						severity: 1,
						source: 'LilyPond',
						message: 'not a duration',
					},
				],
			);
			assert.deepStrictEqual(
				await getDiagnostics(String.raw`<score>\score {
	\relative c'
	}</score>`),
				[
					{
						range: range(7, 7),
						severity: 1,
						source: 'LilyPond',
						message: String.raw`Missing music in \score`,
					},
					{
						range: range(7, 7),
						severity: 1,
						source: 'LilyPond',
						message: String.raw`syntax error, unexpected \score, expecting '}'`,
					},
				],
			);
		});
	});
}
