import {TextDocument} from 'vscode-languageserver-textdocument';
import {tasks, signatureTasks, docs} from '../tasks';
import {Task} from '../task';
import type {Position} from 'vscode-languageserver/node';

const testDocs = new Map<string, TextDocument>();

Object.defineProperty(docs, 'get', {
	value(uri: string) {
		return testDocs.get(uri);
	},
});

export const getParams = (file: string, content: string, signature?: boolean): {textDocument: TextDocument} => {
	const textDocument = TextDocument.create(file, 'wikitext', 0, content);
	testDocs.set(file, textDocument);
	(signature ? signatureTasks : tasks).set(textDocument, new Task(textDocument));
	return {textDocument};
};

export const getPositionParams = (
	file: string,
	content: string,
	line: number,
	character: number,
	signature?: boolean,
): {textDocument: TextDocument, position: Position} => ({
	...getParams(file, content, signature),
	position: {line, character},
});
