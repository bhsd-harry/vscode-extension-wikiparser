import * as path from 'path';
import {workspace} from 'vscode';
import {LanguageClient} from 'vscode-languageclient/node';
import type {ExtensionContext} from 'vscode';
import type {ServerOptions, LanguageClientOptions} from 'vscode-languageclient/node';

let client: LanguageClient | undefined;

export const activate = (context: ExtensionContext): void => {
	if (!client) {
		const serverModule = context.asAbsolutePath(path.join('server', 'dist', 'server.js')),
			serverOptions: ServerOptions = {
				run: {module: serverModule},
				debug: {module: serverModule, args: ['--debug']},
			},
			clientOptions: LanguageClientOptions = {
				documentSelector: [{scheme: 'file', language: 'wikitext'}],
				synchronize: {
					fileEvents: workspace.createFileSystemWatcher('**/.clientrc'),
				},
			};
		client = new LanguageClient('Wikitext Language Server', serverOptions, clientOptions);
	}
	void client.start();
};

export const deactivate = (): Promise<void> | undefined => client?.stop();
