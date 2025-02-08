import {TextDocument} from 'vscode-languageserver-textdocument';
import {docs} from '../tasks';
import type {Position} from 'vscode-languageserver/node';

const testDocs = new Map<string, TextDocument>();

Object.defineProperty(docs, 'get', {
	value(uri: string) {
		return testDocs.get(uri);
	},
});

export const getParams = (file: string, content: string): {textDocument: TextDocument} => {
	const textDocument = TextDocument.create(file, 'wikitext', 0, content);
	testDocs.set(file, textDocument);
	return {textDocument};
};

export const getPositionParams = (
	file: string,
	content: string,
	line: number,
	character: number,
): {textDocument: TextDocument, position: Position} => ({
	...getParams(file, content),
	position: {line, character},
});
