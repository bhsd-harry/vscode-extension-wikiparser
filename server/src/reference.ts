import {getLSP} from './tasks';
import type {
	Range as TextRange,
	Location as TextLocation,
	WorkspaceEdit,
	TextDocumentPositionParams,
	RenameParams,
} from 'vscode-languageserver/node';

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
