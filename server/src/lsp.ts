import Parser from 'wikilint'; // eslint-disable-line n/no-unpublished-import
import {
	CompletionItemKind,
	TextDocuments,
	createConnection,
	ProposedFeatures,
	CodeActionKind,
} from 'vscode-languageserver/node';
import {TextDocument} from 'vscode-languageserver-textdocument';
import type {
	Connection,
	ColorInformation,
	DocumentColorParams,
	ColorPresentation,
	ColorPresentationParams,
	CompletionItem,
	CompletionParams,
	FoldingRangeParams,
	FoldingRange,
	DocumentSymbol,
	DocumentLink,
	DocumentLinkParams,
	Range as TextRange,
	Location as TextLocation,
	WorkspaceEdit,
	TextDocumentPositionParams,
	RenameParams,
	DocumentDiagnosticParams,
	Diagnostic,
	CodeActionParams,
	CodeAction,
	TextEdit,
	Hover,
	SignatureHelp,
	InlayHintParams,
	InlayHint,
} from 'vscode-languageserver/node';
import type {LanguageService, Config} from 'wikilint'; // eslint-disable-line n/no-unpublished-import

export interface QuickFixData extends TextEdit {
	title: string;
	fix: boolean;
}

export {Parser};

export const docs = new TextDocuments(TextDocument),

	/** `connection?.console.debug()` 可以用于调试 */
	connection = ((): Connection | undefined => {
		try {
			return createConnection(ProposedFeatures.all);
		} catch {
			return undefined;
		}
	})();

if (connection) {
	docs.listen(connection);
}

export const getLSP = (uri: string): [string, LanguageService & {config?: Config, mathjax?: string}] => {
	const doc = docs.get(uri)!;
	return [doc.getText(), Parser.createLanguageService(doc)];
};

export const provideDocumentColor = async (
	{textDocument: {uri}}: DocumentColorParams,
): Promise<ColorInformation[]> => {
	const [doc, lsp] = getLSP(uri);
	// eslint-disable-next-line n/no-unpublished-import
	return lsp.provideDocumentColors((await import('color-rgba')).default, doc);
};

export const provideColorPresentation = (param: ColorPresentationParams): ColorPresentation[] =>
	getLSP(param.textDocument.uri)[1].provideColorPresentations(param);

// 有时 VSCode 不会触发自动补全，需要手动触发
export const provideCompletion = async (
	{textDocument: {uri}, position}: CompletionParams,
): Promise<CompletionItem[] | undefined> => {
	const [doc, lsp] = getLSP(uri);
	return (await lsp.provideCompletionItems(doc, position))?.map(
		(item): CompletionItem => item.kind
			? {
				...item,
				kind: typeof item.kind === 'string' ? CompletionItemKind[item.kind] : item.kind,
			}
			: item as CompletionItem,
	);
};

export const provideFoldingRanges = ({textDocument: {uri}}: FoldingRangeParams): Promise<FoldingRange[]> => {
	const [doc, lsp] = getLSP(uri);
	return lsp.provideFoldingRanges(doc);
};

export const provideDocumentSymbol = ({textDocument: {uri}}: FoldingRangeParams): Promise<DocumentSymbol[]> => {
	const [doc, lsp] = getLSP(uri);
	return lsp.provideDocumentSymbols(doc);
};

export const provideDocumentLinks = (
	{textDocument: {uri}}: DocumentLinkParams,
	path: string,
): Promise<DocumentLink[]> => {
	const [doc, lsp] = getLSP(uri);
	if (lsp.config?.articlePath !== path) {
		lsp.config = Object.assign(lsp.config ?? Parser.getConfig(), {
			articlePath: path,
		});
	}
	return lsp.provideLinks(doc);
};

export const provideReferences = async (
	{textDocument: {uri}, position}: TextDocumentPositionParams,
): Promise<TextLocation[] | undefined> => {
	const [doc, lsp] = getLSP(uri);
	return (await lsp.provideReferences(doc, position))?.map((location): TextLocation => ({
		...location,
		uri,
	}));
};

export const provideDefinition = async (
	{textDocument: {uri}, position}: TextDocumentPositionParams,
): Promise<TextLocation[] | undefined> => {
	const [doc, lsp] = getLSP(uri);
	return (await lsp.provideDefinition(doc, position))?.map((location): TextLocation => ({
		...location,
		uri,
	}));
};

export const prepareRename = (
	{textDocument: {uri}, position}: TextDocumentPositionParams,
): Promise<TextRange | undefined> => {
	const [doc, lsp] = getLSP(uri);
	return lsp.resolveRenameLocation(doc, position);
};

export const provideRename = async (
	{textDocument: {uri}, position, newName}: RenameParams,
): Promise<WorkspaceEdit | undefined> => {
	const [doc, lsp] = getLSP(uri),
		edit = await lsp.provideRenameEdits(doc, position, newName);
	return edit && {
		changes: {
			[uri]: edit.changes!['']!,
		},
	};
};

export const provideDiagnostics = (
	{textDocument: {uri}}: DocumentDiagnosticParams,
	warning: boolean,
	lilypond = '',
	mathjax = '',
): Promise<Diagnostic[]> => {
	const [doc, lsp] = getLSP(uri);
	lsp.lilypond = lilypond;
	lsp.mathjax = mathjax;
	return lsp.provideDiagnostics(doc, warning);
};

const getAction = (action: CodeAction, uri: string): CodeAction => ({
	...action,
	edit: {
		changes: {
			[uri]: action.edit!.changes!['']!,
		},
	},
});

export const provideCodeAction = (
	{context: {diagnostics, only}, textDocument: {uri}, range}: CodeActionParams,
): CodeAction[] => {
	const [, lsp] = getLSP(uri);
	return [
		...only?.some(kind => /^quickfix(?:$|\.)/u.test(kind)) === false
			? []
			: lsp.provideCodeAction(diagnostics).map(action => getAction(action, uri)),
		...range.start.line === range.end.line && range.start.character === range.end.character
		|| only?.some(kind => /^refactor(?:$|\.)/u.test(kind)) === false
			? []
			: [{title: 'Escape with magic words', kind: CodeActionKind.RefactorRewrite, data: {uri, range}}],
	];
};

export const resolveCodeAction = async (action: CodeAction): Promise<CodeAction> => {
	if (action.data && action.kind === CodeActionKind.RefactorRewrite) {
		const {uri, range} = action.data as {uri: string, range: TextRange},
			[doc, lsp] = getLSP(uri),
			refactor = (await lsp.provideRefactoringAction(doc, range)).find(({title}) => title === action.title);
		if (refactor) {
			return getAction(refactor, uri);
		}
	}
	return action;
};

export const provideHover = (
	{textDocument: {uri}, position}: TextDocumentPositionParams,
): Promise<Hover | undefined> => {
	const [doc, lsp] = getLSP(uri);
	return lsp.provideHover(doc, position);
};

export const provideSignatureHelp = (
	{textDocument: {uri}, position}: TextDocumentPositionParams,
): Promise<SignatureHelp | undefined> => {
	const [doc, lsp] = getLSP(uri);
	return lsp.provideSignatureHelp(doc, position);
};

export const provideInlayHints = ({textDocument: {uri}}: InlayHintParams): Promise<InlayHint[]> => {
	const [doc, lsp] = getLSP(uri);
	return lsp.provideInlayHints(doc);
};
