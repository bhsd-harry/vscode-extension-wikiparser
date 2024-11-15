import {CodeActionKind} from 'vscode-languageserver/node';
import {createRange} from './util';
import {parse, docs} from './tasks';
import type {LintError} from 'wikilint';
import type {
	CodeActionParams,
	CodeAction,
	DocumentDiagnosticParams,
	Diagnostic,
} from 'vscode-languageserver/node';

export const diagnose = async ({textDocument: {uri}}: DocumentDiagnosticParams): Promise<Diagnostic[]> =>
	(await parse(uri)).lint().map(({startLine, startCol, endLine, endCol, severity, message, fix}) => ({
		range: {
			start: {line: startLine, character: startCol},
			end: {line: endLine, character: endCol},
		},
		severity: severity === 'error' ? 1 : 2,
		source: 'WikiLint',
		message,
		data: fix,
	}));

export const quickFix = ({context: {diagnostics}, textDocument: {uri}}: CodeActionParams): CodeAction[] => {
	const doc = docs.get(uri)!;
	return diagnostics.filter(({data}) => data).map(diagnostic => {
		const {range, text} = diagnostic.data as LintError.Fix;
		return {
			title: 'Fix',
			kind: CodeActionKind.QuickFix,
			diagnostics: [diagnostic],
			isPreferred: true,
			edit: {
				changes: {
					[uri]: [{range: createRange(doc, ...range), newText: text}],
				},
			},
		};
	});
};
