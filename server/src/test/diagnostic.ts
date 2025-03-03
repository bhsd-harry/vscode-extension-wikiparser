import * as assert from 'assert';
import {CodeActionKind} from 'vscode-languageserver/node';
import {getParams, range} from './util';
import {provideCodeAction} from '../lsp';
import {provideDiagnostics} from '../diagnostics';
import type {Diagnostic, CodeAction, CodeActionParams} from 'vscode-languageserver/node';
import type {QuickFixData} from '../lsp';

const wikitext = `
http://a]
</p>
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
					title: 'Fix: left bracket',
					fix: true,
				},
			],
		},
		{
			range: range(2, 0, 2, 4),
			severity: 1,
			source: 'WikiLint',
			code: 'unmatched-tag',
			message: 'unmatched closing tag',
			data: [
				{
					range: range(2, 0, 2, 4),
					newText: '',
					title: 'Suggestion: remove',
					fix: false,
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
	actions: CodeAction[] = [
		{
			title: 'Fix: left bracket',
			kind: CodeActionKind.QuickFix,
			diagnostics: [diagnostics[0]!],
			isPreferred: true,
			edit: {
				changes: {[params.textDocument.uri]: diagnostics[0]!.data},
			},
		},
		{
			title: 'Suggestion: remove',
			kind: CodeActionKind.QuickFix,
			diagnostics: [diagnostics[1]!],
			isPreferred: false,
			edit: {
				changes: {[params.textDocument.uri]: diagnostics[1]!.data},
			},
		},
	];

describe('diagnosticProvider', () => {
	it('diagnostic', async () => {
		assert.deepStrictEqual(await provideDiagnostics(params, true), diagnostics);
	});
	it('quickFix', () => {
		assert.deepStrictEqual(
			provideCodeAction({...params, context: {diagnostics}} as unknown as CodeActionParams),
			actions,
		);
	});
	it('no warning', async () => {
		assert.deepStrictEqual(await provideDiagnostics(params, false), diagnostics.slice(0, 2));
	});
});

describe('diagnosticProvider (JSON)', () => {
	it('templatedata', async () => {
		assert.deepStrictEqual(
			await provideDiagnostics(
				getParams(__filename, '<templatedata>a</templatedata>'),
				true,
			),
			[
				{
					range: range(0, 14, 0, 15),
					severity: 1,
					source: 'json',
					code: 0,
					message: 'Expected a JSON object, array or literal.',
				},
			],
		);
	});
	it('graph', async () => {
		assert.deepStrictEqual(
			await provideDiagnostics(
				getParams(__filename, '<graph>{"a"}</graph>'),
				true,
			),
			[
				{
					range: range(0, 11, 0, 12),
					severity: 1,
					source: 'json',
					code: 515,
					message: 'Colon expected',
				},
			],
		);
	});
	it('mapframe', async () => {
		assert.deepStrictEqual(
			await provideDiagnostics(
				getParams(__filename, '<mapframe>[0,]</mapframe>'),
				true,
			),
			[
				{
					range: range(0, 12, 0, 13),
					severity: 1,
					source: 'json',
					code: 519,
					message: 'Trailing comma',
				},
			],
		);
	});
	it('maplink', async () => {
		assert.deepStrictEqual(
			await provideDiagnostics(
				getParams(__filename, '<maplink>{"a":1,"a":2}</maplink>'),
				true,
			),
			[
				{
					range: range(0, 10, 0, 13),
					severity: 2,
					source: 'json',
					code: 520,
					message: 'Duplicate object key',
				},
				{
					range: range(0, 16, 0, 19),
					severity: 2,
					source: 'json',
					code: 520,
					message: 'Duplicate object key',
				},
			].reverse(),
		);
	});
	it('no warning', async () => {
		assert.deepStrictEqual(
			await provideDiagnostics(
				getParams(__filename, '<maplink>{"a":1,"a":2}</maplink>'),
				false,
			),
			[],
		);
	});
});

describe('diagnosticProvider (CSS)', () => {
	it('ext-attr', async () => {
		assert.deepStrictEqual(
			await provideDiagnostics(
				getParams(__filename, '<poem style=""/>'),
				true,
			),
			[
				{
					range: range(0, 13, 0, 13),
					severity: 2,
					source: 'css',
					code: 'emptyRules',
					message: 'Do not use empty rulesets',
				},
			],
		);
	});
	it('html-attr', async () => {
		assert.deepStrictEqual(
			await provideDiagnostics(
				getParams(__filename, '<br style=display:inline-block;float:right>'),
				true,
			),
			[
				{
					range: range(0, 31, 0, 42),
					severity: 2,
					source: 'css',
					code: 'propertyIgnoredDueToDisplay',
					message: 'inline-block is ignored due to the float. '
						+ "If 'float' has a value other than 'none', "
						+ "the box is floated and 'display' is treated as 'block'",
				},
			],
		);
	});
	it('table-attr', async () => {
		assert.deepStrictEqual(
			await provideDiagnostics(
				getParams(__filename, '{|style=unknown:0\n|}'),
				true,
			),
			[
				{
					range: range(0, 8, 0, 15),
					severity: 2,
					source: 'css',
					code: 'unknownProperties',
					message: "Unknown property: 'unknown'",
				},
			],
		);
	});
});

describe('diagnosticProvider (mixed)', () => {
	it('templatedata', async () => {
		assert.deepStrictEqual(
			await provideDiagnostics(
				getParams(
					__filename,
					`{
<graph>[1 2]</graph>
<maplink>1,</maplink>
<pre style=x/>
<hr style="color:#01234">
{|
|-style=-webkit-user-select:none;cursor:url(hand.cur)
|}`,
				),
				true,
			),
			[
				{
					range: range(0, 0, 0, 1),
					severity: 2,
					source: 'WikiLint',
					code: 'lonely-bracket',
					message: 'lonely "{"',
					data: [],
				},
				{
					range: range(6, 8, 6, 53),
					severity: 1,
					source: 'WikiLint',
					code: 'insecure-style',
					message: 'insecure style',
					data: [],
				},
				{
					range: range(6, 8, 6, 27),
					severity: 2,
					source: 'css',
					code: 'vendorPrefix',
					message: "Also define the standard property 'user-select' for compatibility",
				},
				{
					range: range(4, 17, 4, 23),
					severity: 1,
					source: 'css',
					code: 'css-propertyvalueexpected',
					message: 'property value expected',
				},
				{
					range: range(3, 12, 3, 12),
					severity: 1,
					source: 'css',
					code: 'css-semicolonexpected',
					message: 'semi-colon expected',
				},
				{
					range: range(3, 12, 3, 12),
					severity: 1,
					source: 'css',
					code: 'css-colonexpected',
					message: 'colon expected',
				},
				{
					range: range(2, 10, 2, 11),
					severity: 1,
					source: 'json',
					code: 0,
					message: 'End of file expected.',
				},
				{
					range: range(1, 10, 1, 11),
					severity: 1,
					source: 'json',
					code: 514,
					message: 'Expected comma',
				},
			],
		);
	});
});
