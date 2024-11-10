import {
	createConnection,
	ProposedFeatures,
	TextDocuments,
	TextDocumentSyncKind,
	DocumentDiagnosticReportKind,
} from 'vscode-languageserver/node';
import {TextDocument} from 'vscode-languageserver-textdocument';
import {Task} from './task';
import {completion} from './completion';
import type {Token} from 'wikilint';

const connection = createConnection(ProposedFeatures.all),
	docs = new TextDocuments(TextDocument),
	tasks = new Map<TextDocument, Task>();

const parse = async (uri: string): Promise<Token> => {
	const task = tasks.get(docs.get(uri)!)!,
		root = await task.queue();
	task.running = undefined;
	return root;
};

docs.onDidOpen(({document}) => {
	tasks.set(document, new Task(connection, document));
});

docs.onDidClose(({document}) => {
	tasks.delete(document);
});

connection.onInitialize(() => ({
	capabilities: {
		textDocumentSync: TextDocumentSyncKind.Full,
		diagnosticProvider: {
			interFileDependencies: false,
			workspaceDiagnostics: false,
		},
		completionProvider: {
			resolveProvider: false,
			triggerCharacters: ['#'],
		},
	},
}));

connection.languages.diagnostics.on(async ({textDocument: {uri}}) => ({
	kind: DocumentDiagnosticReportKind.Full,
	items: (await parse(uri)).lint()
		.map(({startLine, startCol, endLine, endCol, severity, message, fix, suggestions}) => ({
			range: {
				start: {line: startLine, character: startCol},
				end: {line: endLine, character: endCol},
			},
			severity: severity === 'error' ? 1 : 2,
			source: 'WikiLint',
			message,
			data: {fix, suggestions},
		})),
}));

connection.onCompletion(({textDocument: {uri}, position}) => completion(docs.get(uri)!, position));

docs.listen(connection);
connection.listen();
