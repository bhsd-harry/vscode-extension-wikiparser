import Parser from 'wikilint';
import {CompletionItemKind, TextDocuments} from 'vscode-languageserver/node';
import {TextDocument} from 'vscode-languageserver-textdocument';
import type {
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
import type {LanguageService} from 'wikilint';

export interface QuickFixData extends TextEdit {
	title: string;
	fix: boolean;
}

export const docs = new TextDocuments(TextDocument);

const uris = new WeakMap<TextDocument, Record<never, never>>();

const getLSP = (uri: string, signature?: boolean): [string, LanguageService] => {
	const doc = docs.get(uri)!;
	if (signature && !uris.has(doc)) {
		uris.set(doc, {});
	}
	return [doc.getText(), Parser.createLanguageService(signature ? uris.get(doc)! : doc)];
};

export const provideDocumentColor = async (
	{textDocument: {uri}}: DocumentColorParams,
): Promise<ColorInformation[]> => {
	const [doc, lsp] = getLSP(uri);
	return lsp.provideDocumentColors((await import('color-rgba')).default, doc);
};

export const provideColorPresentation = (param: ColorPresentationParams): ColorPresentation[] =>
	getLSP(param.textDocument.uri)[1].provideColorPresentations(param);

export const provideCompletion = async (
	{textDocument: {uri}, position}: CompletionParams,
): Promise<CompletionItem[] | undefined> => {
	const [doc, lsp] = getLSP(uri);
	return (await lsp.provideCompletionItems(doc, position))?.map(item => ({
		...item,
		kind: CompletionItemKind[item.kind],
	}));
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
	Parser.getConfig();
	Object.assign(Parser.config, {articlePath: path});
	const [doc, lsp] = getLSP(uri);
	return lsp.provideLinks(doc);
};

export const provideReferences = async (
	{textDocument: {uri}, position}: TextDocumentPositionParams,
): Promise<TextLocation[] | undefined> => {
	const [doc, lsp] = getLSP(uri);
	return (await lsp.provideReferences(doc, position))?.map(location => ({
		...location,
		uri,
	}));
};

export const provideDefinition = async (
	{textDocument: {uri}, position}: TextDocumentPositionParams,
): Promise<TextLocation[] | undefined> => {
	const [doc, lsp] = getLSP(uri);
	return (await lsp.provideDefinition(doc, position))?.map(location => ({
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
): Promise<Diagnostic[]> => {
	const [doc, lsp] = getLSP(uri);
	return lsp.provideDiagnostics(doc, warning);
};

export const provideCodeAction = ({context: {diagnostics}, textDocument: {uri}}: CodeActionParams): CodeAction[] =>
	getLSP(uri)[1].provideCodeAction(diagnostics).map((action): CodeAction => ({
		...action,
		edit: {
			changes: {
				[uri]: action.edit!.changes!['']!,
			},
		},
	}));

export const provideHover = (
	{textDocument: {uri}, position}: TextDocumentPositionParams,
): Promise<Hover | undefined> => {
	const [doc, lsp] = getLSP(uri);
	return lsp.provideHover(doc, position);
};

export const provideSignatureHelp = (
	{textDocument: {uri}, position}: TextDocumentPositionParams,
): Promise<SignatureHelp | undefined> => {
	const [doc, lsp] = getLSP(uri, true);
	return lsp.provideSignatureHelp(doc, position);
};

export const provideInlayHints = ({textDocument: {uri}}: InlayHintParams): Promise<InlayHint[]> => {
	const [doc, lsp] = getLSP(uri);
	return lsp.provideInlayHints(doc);
};
