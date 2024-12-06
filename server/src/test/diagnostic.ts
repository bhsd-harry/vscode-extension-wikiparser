import * as assert from 'assert';
import {CodeActionKind} from 'vscode-languageserver/node';
import {getParams} from './util';
import {diagnose, quickFix} from '../diagnostic';
import type {Diagnostic, CodeAction, CodeActionParams} from 'vscode-languageserver/node';

const wikitext = `
http://a]
</p>
`,
	params = getParams(__filename, wikitext),
	diagnostics: Diagnostic[] = [
		{
			range: {
				start: {line: 1, character: 7},
				end: {line: 1, character: 8},
			},
			severity: 1,
			source: 'WikiLint',
			message: 'lonely "]"',
			data: [
				{
					range: {
						start: {line: 1, character: 0},
						end: {line: 1, character: 1},
					},
					newText: '[',
					title: 'Fix: left bracket',
					fix: true,
				},
			],
		},
		{
			range: {
				start: {line: 2, character: 0},
				end: {line: 2, character: 4},
			},
			severity: 2,
			source: 'WikiLint',
			message: 'unmatched closing tag',
			data: [
				{
					range: {
						start: {line: 2, character: 0},
						end: {line: 2, character: 4},
					},
					newText: '',
					title: 'Suggestion: remove',
					fix: false,
				},
			],
		},
	],
	actions: CodeAction[] = [
		{
			title: 'Fix: left bracket',
			kind: CodeActionKind.QuickFix,
			diagnostics: [diagnostics[0]!],
			isPreferred: true,
			edit: {
				changes: {[params.textDocument.uri]: [diagnostics[0]!.data]},
			},
		},
		{
			title: 'Suggestion: remove',
			kind: CodeActionKind.QuickFix,
			diagnostics: [diagnostics[1]!],
			isPreferred: false,
			edit: {
				changes: {[params.textDocument.uri]: [diagnostics[1]!.data]},
			},
		},
	];

describe('diagnosticProvider', () => {
	it('Diagnostic', async () => {
		assert.deepStrictEqual(await diagnose(params), diagnostics);
	});
	it('QuickFix', done => {
		assert.deepStrictEqual(quickFix({...params, context: {diagnostics}} as unknown as CodeActionParams), actions);
		done();
	});
});
