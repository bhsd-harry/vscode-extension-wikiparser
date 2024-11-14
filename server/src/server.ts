import {
	TextDocumentSyncKind,
	CodeActionKind,
	DidChangeConfigurationNotification,
	DocumentDiagnosticReportKind,
} from 'vscode-languageserver/node';
import {documentSettings, connection} from './tasks';
import {diagnose, quickFix} from './diagnostic';
import {completion} from './completion';
import {provideDocumentColors, provideColorPresentations} from './color';
import {provideReferences, provideDefinition, prepareRename, provideRename} from './reference';
import {provideLinks} from './links';
import {provideFolding} from './folding';
import type {TextDocumentIdentifier} from 'vscode-languageserver/node';
import type {Settings} from './tasks';

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
			triggerCharacters: ['#', ...new Array(10).fill(0).map((_, i) => String(i))],
		},
		colorProvider: true,
		referencesProvider: true,
		documentHighlightProvider: true,
		definitionProvider: true,
		documentLinkProvider: {
			resolveProvider: false,
		},
		renameProvider: {
			prepareProvider: true,
		},
		foldingRangeProvider: true,
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
connection.onDefinition(provideDefinition);
connection.onPrepareRename(prepareRename);
connection.onRenameRequest(provideRename);

// links.ts
connection.onDocumentLinks(
	async ({textDocument}) => provideLinks(textDocument, (await getSettings(textDocument)).articlePath),
);

// folding.ts
connection.onFoldingRanges(provideFolding);

connection.listen();
