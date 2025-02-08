import {CompletionItemKind} from 'vscode-languageserver/node';
import {getLSP} from './tasks';
import type {CompletionItem, CompletionParams} from 'vscode-languageserver/node';

export default async (
	{textDocument: {uri}, position}: CompletionParams,
): Promise<CompletionItem[] | undefined> => {
	const [doc, lsp] = getLSP(uri);
	return (await lsp.provideCompletionItems(doc, position))?.map(item => ({
		...item,
		kind: CompletionItemKind[item.kind as unknown as keyof typeof CompletionItemKind],
	}));
};
