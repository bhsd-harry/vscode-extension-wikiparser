import {
	createConnection,
	ProposedFeatures,
	TextDocumentSyncKind,
	CodeActionKind,
	DidChangeConfigurationNotification,
	DocumentDiagnosticReportKind,
} from 'vscode-languageserver/node';
import {docs, documentSettings} from './tasks';
import {diagnose, quickFix} from './diagnostic';
import {completion} from './completion';
import {provideDocumentColors, provideColorPresentations} from './color';
import {provideReferences} from './reference';
import {provideLinks} from './links';
import type {TextDocumentIdentifier} from 'vscode-languageserver/node';
import type {Settings} from './tasks';

const connection = createConnection(ProposedFeatures.all);

const getSettings = ({uri}: TextDocumentIdentifier): Promise<Settings> => {
	let result = documentSettings.get(uri);
	if (!result) {
		result = connection.workspace.getConfiguration({scopeUri: uri, section: 'wikiparser'});
		documentSettings.set(uri, result);
	}
	return result;
};

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
		documentLinkProvider: {
			resolveProvider: false,
		},
	},
}));

connection.onInitialized(() => {
	void connection.client.register(DidChangeConfigurationNotification.type);
});

connection.onDidChangeConfiguration(() => {
	documentSettings.clear();
	connection.languages.diagnostics.refresh();
});

// diagnostic.ts
connection.languages.diagnostics.on(async params => ({
	kind: DocumentDiagnosticReportKind.Full,
	items: (await getSettings(params.textDocument)).lint ? await diagnose(params) : [],
}));
connection.onCodeAction(quickFix);

// completion.ts
connection.onCompletion(completion);

// color.ts
connection.onDocumentColor(provideDocumentColors);
connection.onColorPresentation(provideColorPresentations);

// reference.ts
connection.onReferences(provideReferences);
connection.onDocumentHighlight(provideReferences);

// links.ts
connection.onDocumentLinks(
	async ({textDocument}) => provideLinks(textDocument, (await getSettings(textDocument)).articlePath),
);

docs.listen(connection);
connection.listen();
