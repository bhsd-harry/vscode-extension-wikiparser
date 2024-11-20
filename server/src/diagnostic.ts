import {CodeActionKind} from 'vscode-languageserver/node';
import {createRange} from './util';
import {parse} from './tasks';
import type {
	CodeActionParams,
	CodeAction,
	DocumentDiagnosticParams,
	Diagnostic,
	TextEdit,
} from 'vscode-languageserver/node';

export const diagnose = async ({textDocument: {uri}}: DocumentDiagnosticParams): Promise<Diagnostic[]> => {
	const root = await parse(uri);
	return root.lint().map(({startLine, startCol, endLine, endCol, severity, message, fix}) => ({
		range: {
			start: {line: startLine, character: startCol},
			end: {line: endLine, character: endCol},
		},
		severity: severity === 'error' ? 1 : 2,
		source: 'WikiLint',
		message,
		data: fix && {range: createRange(root, ...fix.range), newText: fix.text} as TextEdit,
	}));
};

export const quickFix = ({context: {diagnostics}, textDocument: {uri}}: CodeActionParams): CodeAction[] =>
	diagnostics.filter(({data}) => data).map(diagnostic => ({
		title: 'Fix',
		kind: CodeActionKind.QuickFix,
		diagnostics: [diagnostic],
		isPreferred: true,
		edit: {
			changes: {
				[uri]: [diagnostic.data as TextEdit],
			},
		},
	}));
