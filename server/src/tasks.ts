import {TextDocuments} from 'vscode-languageserver/node';
import {TextDocument} from 'vscode-languageserver-textdocument';
import {Task, connection} from './task';
import type {Token} from 'wikilint';

export interface Settings {
	lint: boolean;
	articlePath: string;
}

const tasks = new WeakMap<TextDocument, Task>();

export const docs = new TextDocuments(TextDocument),
	documentSettings = new Map<string, Promise<Settings>>();

docs.onDidOpen(({document}) => {
	tasks.set(document, new Task(document));
});

docs.onDidClose(({document}) => {
	tasks.delete(document);
	documentSettings.delete(document.uri);
});

docs.listen(connection);

export const parse = (uri: string): Promise<Token> => tasks.get(docs.get(uri)!)!.queue();
