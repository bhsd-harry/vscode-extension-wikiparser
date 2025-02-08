import Parser from 'wikilint';
import {getLSP} from './tasks';
import type {DocumentLink, TextDocumentIdentifier} from 'vscode-languageserver/node';

export default ({uri}: TextDocumentIdentifier, path: string): Promise<DocumentLink[]> => {
	Parser.getConfig();
	Object.assign(Parser.config, {articlePath: path});
	const [doc, lsp] = getLSP(uri);
	return lsp.provideLinks(doc);
};
