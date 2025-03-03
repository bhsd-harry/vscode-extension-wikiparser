import {getLanguageService} from 'vscode-json-languageservice';
import {getCSSLanguageService} from 'vscode-css-languageservice';
import {docs, getLSP} from './lsp';
import type {DocumentDiagnosticParams, Diagnostic, Position} from 'vscode-languageserver/node';
import type {TextDocument} from 'vscode-languageserver-textdocument';
import type {Token, AttributeToken} from 'wikilint';

const jsonLSP = getLanguageService({}),
	cssLSP = getCSSLanguageService();

class EmbeddedDocument implements Pick<TextDocument, 'version' | 'languageId' | 'getText' | 'positionAt'> {
	declare version: number;
	declare languageId: string;
	#root;
	#content;
	#offset;
	#padding;

	constructor(version: number, id: string, root: Token, token: Token, padding = ['', '']) {
		this.version = version;
		this.languageId = id;
		this.#root = root;
		this.#content = padding[0] + String(token) + padding[1];
		this.#offset = token.getAbsoluteIndex();
		this.#padding = padding.map(({length}) => length) as [number, number];
	}

	getText(): string {
		return this.#content;
	}

	positionAt(offset: number): Position {
		const {top, left} = this.#root.posFromIndex(
			this.#offset + Math.max(Math.min(offset, this.#content.length - this.#padding[1]) - this.#padding[0], 0),
		)!;
		return {line: top, character: left};
	}
}

export const provideDiagnostics = async (
	{textDocument: {uri}}: DocumentDiagnosticParams,
	warning: boolean,
): Promise<Diagnostic[]> => {
	const doc = docs.get(uri)!,
		{version} = doc,
		[text, lsp] = getLSP(uri);
	const diagnostics = lsp.provideDiagnostics(text, warning),
		// @ts-expect-error private method
		root: Token = await lsp.queue(text),
		cssDiagnostics = root
			.querySelectorAll<AttributeToken>('ext-attr#style,html-attr#style,table-attr#style')
			.map(({lastChild, type, tag}) => [lastChild, type === 'ext-attr' ? 'div' : tag] as const)
			.filter(([{length, firstChild}]) => length === 1 && firstChild!.type === 'text')
			.reverse()
			.map(([token, tag]) => {
				const textDoc = new EmbeddedDocument(version, 'css', root, token, [`${tag}{`, '}']),
					styleSheet = cssLSP.parseStylesheet(textDoc as Partial<TextDocument> as TextDocument),
					errors = cssLSP.doValidation(textDoc as Partial<TextDocument> as TextDocument, styleSheet);
				return warning ? errors : errors.filter(({severity}) => severity === 1);
			}),
		jsonDiagnostics = root
			.querySelectorAll('ext-inner#templatedata,ext-inner#mapframe,ext-inner#maplink,ext-inner#graph')
			.reverse()
			.map(async token => {
				const textDoc = new EmbeddedDocument(version, 'json', root, token),
					jsonDoc = jsonLSP.parseJSONDocument(textDoc as Partial<TextDocument> as TextDocument),
					errors = await jsonLSP.doValidation(doc, jsonDoc);
				return warning ? errors : errors.filter(({severity}) => severity === 1);
			});
	return (await Promise.all([diagnostics, cssDiagnostics, ...jsonDiagnostics])).flat(2);
};
