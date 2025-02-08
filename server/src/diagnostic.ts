import {CodeActionKind} from 'vscode-languageserver/node';
import {parse} from './tasks';
import type {
	CodeActionParams,
	CodeAction,
	DocumentDiagnosticParams,
	Diagnostic,
	TextEdit,
	Range as TextRange,
	Position,
} from 'vscode-languageserver/node';
import type {Token} from 'wikilint';

export interface QuickFixData extends TextEdit {
	title: string;
	fix: boolean;
}

const positionAt = (root: Token, i: number): Position => {
	const {top, left} = root.posFromIndex(i)!;
	return {line: top, character: left};
};

const createRange = (root: Token, start: number, end: number): TextRange => ({
	start: positionAt(root, start),
	end: positionAt(root, end),
});

export const diagnose = async ({textDocument: {uri}}: DocumentDiagnosticParams): Promise<Diagnostic[]> => {
	const root = await parse(uri);
	return root.lint().filter(({severity, rule}) => severity === 'error' && rule !== 'no-arg')
		.map(({startLine, startCol, endLine, endCol, severity, message, fix, suggestions}) => ({
			range: {
				start: {line: startLine, character: startCol},
				end: {line: endLine, character: endCol},
			},
			severity: severity === 'error' ? 1 : 2,
			source: 'WikiLint',
			message,
			data: [
				...fix
					? [
						{
							range: createRange(root, ...fix.range),
							newText: fix.text,
							title: `Fix: ${fix.desc}`,
							fix: true,
						},
					]
					: [],
				...suggestions
					? suggestions.map(({range, text, desc}) => ({
						range: createRange(root, ...range),
						newText: text,
						title: `Suggestion: ${desc}`,
						fix: false,
					}))
					: [],
			] satisfies QuickFixData[],
		}));
};

export const quickFix = ({context: {diagnostics}, textDocument: {uri}}: CodeActionParams): CodeAction[] =>
	diagnostics.filter(({data}) => data).flatMap(
		diagnostic => (diagnostic.data as QuickFixData[]).map(data => ({
			title: data.title,
			kind: CodeActionKind.QuickFix,
			diagnostics: [diagnostic],
			isPreferred: data.fix,
			edit: {
				changes: {[uri]: [data]},
			},
		})),
	);
