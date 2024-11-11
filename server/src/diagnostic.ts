import {CodeActionKind} from 'vscode-languageserver/node';
import {createRange} from './util';
import type {Token, LintError} from 'wikilint';
import type {Diagnostic, CodeAction} from 'vscode-languageserver/node';
import type {TextDocument} from 'vscode-languageserver-textdocument';

export const diagnose = (root: Token): Diagnostic[] => root.lint()
	.map(({startLine, startCol, endLine, endCol, severity, message, fix}) => ({
		range: {
			start: {line: startLine, character: startCol},
			end: {line: endLine, character: endCol},
		},
		severity: severity === 'error' ? 1 : 2,
		source: 'WikiLint',
		message,
		data: fix,
	}));

export const quickFix = (diagnostics: Diagnostic[], doc: TextDocument, uri: string): CodeAction[] => diagnostics
	.filter(({data}) => data).map(diagnostic => {
		const fix = diagnostic.data as LintError.Fix;
		return {
			title: 'Fix',
			kind: CodeActionKind.QuickFix,
			diagnostics: [diagnostic],
			isPreferred: true,
			edit: {
				changes: {
					[uri]: [{range: createRange(doc, ...fix.range), newText: fix.text}],
				},
			},
		};
	});
