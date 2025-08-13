import * as assert from 'assert';
import {CodeActionKind} from 'vscode-languageserver/node';
import {getCodeActionParams, range} from './util';
import {provideCodeAction, resolveCodeAction} from '../lsp';

const wikitext = String.raw`
[//example.com/?query=1]
{|
|-
| a || b
|}
`;

describe('Refactor', () => {
	it('=', async () => {
		assert.deepStrictEqual(
			await resolveCodeAction(
				provideCodeAction(getCodeActionParams(
					__filename,
					wikitext,
					CodeActionKind.Refactor,
					[],
					1,
					0,
					1,
					24,
				))[0]!,
			),
			{
				title: 'Escape with magic words',
				kind: CodeActionKind.RefactorRewrite,
				edit: {
					changes: {
						[__filename]: [
							{
								range: range(1, 0, 1, 24),
								newText: '[//example.com/?query{{=}}1]',
							},
						],
					},
				},
			},
		);
	});
	it('|', async () => {
		assert.deepStrictEqual(
			await resolveCodeAction(
				provideCodeAction(getCodeActionParams(
					__filename,
					wikitext,
					CodeActionKind.Refactor,
					[],
					2,
					0,
					5,
					2,
				))[0]!,
			),
			{
				title: 'Escape with magic words',
				kind: CodeActionKind.RefactorRewrite,
				edit: {
					changes: {
						[__filename]: [
							{
								range: range(2, 0, 5, 2),
								newText: `{{{!}}
{{!}}-
{{!}} a {{!!}} b
{{!}}}`,
							},
						],
					},
				},
			},
		);
	});
});
