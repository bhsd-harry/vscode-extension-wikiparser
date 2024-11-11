import {
	createConnection,
	ProposedFeatures,
	TextDocuments,
	TextDocumentSyncKind,
	DocumentDiagnosticReportKind,
	CodeActionKind,
} from 'vscode-languageserver/node';
import {TextDocument} from 'vscode-languageserver-textdocument';
import {Task} from './task';
import {diagnose, quickFix} from './diagnostic';
import {completion} from './completion';
import {provideDocumentColors, provideColorPresentations} from './color';
import {referenceProvider} from './reference';
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
		codeActionProvider: {
			codeActionKinds: [CodeActionKind.QuickFix],
		},
		completionProvider: {
			resolveProvider: false,
			triggerCharacters: ['#'],
		},
		colorProvider: true,
		referencesProvider: true,
		documentHighlightProvider: true,
	},
}));

connection.languages.diagnostics.on(async ({textDocument: {uri}}) => ({
	kind: DocumentDiagnosticReportKind.Full,
	items: diagnose(await parse(uri)),
}));
connection.onCodeAction(({context: {diagnostics}, textDocument: {uri}}) => quickFix(diagnostics, docs.get(uri)!, uri));

connection.onCompletion(({textDocument: {uri}, position}) => completion(docs.get(uri)!, position));

connection.onDocumentColor(async ({textDocument: {uri}}) => provideDocumentColors(docs.get(uri)!, await parse(uri)));
connection.onColorPresentation(provideColorPresentations);

connection.onReferences(
	async ({textDocument: {uri}, position}) => referenceProvider(docs.get(uri)!, position, await parse(uri)),
);
connection.onDocumentHighlight(
	async ({textDocument: {uri}, position}) => referenceProvider(docs.get(uri)!, position, await parse(uri)),
);

docs.listen(connection);
connection.listen();
