import {getLanguageService} from 'vscode-json-languageservice';
import {docs, getLSP} from './lsp';
import type {DocumentDiagnosticParams, Diagnostic, Position} from 'vscode-languageserver/node';
import type {TextDocument} from 'vscode-languageserver-textdocument';
import type {Token} from 'wikilint';

const jsonLSP = getLanguageService({});

class EmbeddedDocument implements Pick<TextDocument, 'languageId' | 'getText' | 'positionAt'> {
	declare languageId: string;
	#doc;
	#content;
	#offset;

	constructor(id: string, doc: TextDocument, token: Token) {
		this.languageId = id;
		this.#doc = doc;
		this.#content = String(token);
		this.#offset = token.getAbsoluteIndex();
	}

	getText(): string {
		return this.#content;
	}

	positionAt(offset: number): Position {
		return this.#doc.positionAt(this.#offset + offset);
	}
}

export const provideDiagnostics = async (
	{textDocument: {uri}}: DocumentDiagnosticParams,
	warning: boolean,
): Promise<Diagnostic[]> => {
	const doc = docs.get(uri)!,
		[text, lsp] = getLSP(uri);
	const diagnostics = lsp.provideDiagnostics(text, warning),
		// @ts-expect-error private method
		jsonDiagnostics = (await lsp.queue(text) as Token)
			.querySelectorAll('ext-inner#templatedata,ext-inner#mapframe,ext-inner#maplink,ext-inner#graph')
			.reverse()
			.map(async token => {
				const textDoc: Pick<TextDocument, 'languageId' | 'getText' | 'positionAt'> = new EmbeddedDocument(
						'json',
						doc,
						token,
					),
					jsonDoc = jsonLSP.parseJSONDocument(textDoc as TextDocument),
					errors = await jsonLSP.doValidation(doc, jsonDoc);
				return warning ? errors : errors.filter(({severity}) => severity === 1);
			});
	return (await Promise.all([diagnostics, ...jsonDiagnostics])).flat();
};
