import {TextDocuments} from 'vscode-languageserver/node';
import {TextDocument} from 'vscode-languageserver-textdocument';
import {Task} from './task';
import type {Token} from 'wikilint';

export interface Settings {
	lint: boolean;
}

const tasks = new Map<TextDocument, Task>();

export const docs = new TextDocuments(TextDocument),
	documentSettings = new Map<string, Promise<Settings>>();

docs.onDidOpen(({document}) => {
	tasks.set(document, new Task(document));
});

docs.onDidClose(({document}) => {
	tasks.delete(document);
	documentSettings.delete(document.uri);
});

export const parse = async (uri: string): Promise<Token> => {
	const task = tasks.get(docs.get(uri)!)!,
		root = await task.queue();
	task.running = undefined;
	return root;
};
