import {TextDocuments, Range as TextRange} from 'vscode-languageserver/node';
import {TextDocument} from 'vscode-languageserver-textdocument';
import Parser from 'wikilint';
import {Task, connection} from './task';
import type {Token} from 'wikilint';

export interface Settings {
	lint: boolean;
	articlePath: string;
}

const regularTasks = new WeakMap<TextDocument, Task>(),
	signatureTasks = new WeakMap<TextDocument, Task>();

export const docs = new TextDocuments(TextDocument),
	documentSettings = new Map<string, Promise<Settings>>();

docs.onDidClose(({document}) => {
	documentSettings.delete(document.uri);
});

if (connection) {
	docs.listen(connection);
}

export const parse = (uri: string, text?: string): Promise<Token> => {
	const doc = docs.get(uri)!,
		tasks = text === undefined ? regularTasks : signatureTasks;
	if (!tasks.has(doc)) {
		tasks.set(doc, new Task(doc));
	}
	return tasks.get(doc)!.queue(text);
};

export const getLSP = (uri: string): [string, ReturnType<Parser['createLanguageService']>] => {
	const doc = docs.get(uri)!;
	return [doc.getText(), Parser.createLanguageService(doc)];
};

export const getText = (
	doc: TextDocument,
	startLine: number,
	startCharacter: number,
	endLine: number,
	endCharacter: number,
): string =>
	doc.getText(TextRange.create(startLine, startCharacter, endLine, endCharacter));
