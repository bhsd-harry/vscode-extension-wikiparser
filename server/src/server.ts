import {
	createConnection,
	ProposedFeatures,
	TextDocumentSyncKind,
	CodeActionKind,
	DidChangeConfigurationNotification,
} from 'vscode-languageserver/node';
import {docs} from './tasks';
import {diagnose, quickFix} from './diagnostic';
import {completion} from './completion';
import {provideDocumentColors, provideColorPresentations} from './color';
import {referenceProvider} from './reference';

declare interface Settings {
	lint: boolean;
}

const connection = createConnection(ProposedFeatures.all);

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

connection.onInitialized(() => {
	void connection.client.register(DidChangeConfigurationNotification.type);
});

connection.languages.diagnostics.on(diagnose);
connection.onCodeAction(quickFix);

connection.onCompletion(completion);

connection.onDocumentColor(provideDocumentColors);
connection.onColorPresentation(provideColorPresentations);

connection.onReferences(referenceProvider);
connection.onDocumentHighlight(referenceProvider);

docs.listen(connection);
connection.listen();
