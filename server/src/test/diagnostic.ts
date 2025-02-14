import * as assert from 'assert';
import {CodeActionKind} from 'vscode-languageserver/node';
import {getParams, range} from './util';
import {provideDiagnostics, provideCodeAction} from '../lsp';
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
