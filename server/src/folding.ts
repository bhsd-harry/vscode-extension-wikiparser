import {getLSP} from './tasks';
import type {FoldingRangeParams, FoldingRange, DocumentSymbol} from 'vscode-languageserver/node';

export const provideFoldingRanges = ({textDocument: {uri}}: FoldingRangeParams): Promise<FoldingRange[]> => {
	const [doc, lsp] = getLSP(uri);
	return lsp.provideFoldingRanges(doc);
};
export const provideDocumentSymbol = ({textDocument: {uri}}: FoldingRangeParams): Promise<DocumentSymbol[]> => {
	const [doc, lsp] = getLSP(uri);
	return lsp.provideDocumentSymbols(doc);
};
