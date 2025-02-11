import {
	TextDocumentSyncKind,
	CodeActionKind,
	DidChangeConfigurationNotification,
	DocumentDiagnosticReportKind,
	createConnection,
	ProposedFeatures,
} from 'vscode-languageserver/node';
import {
	docs,
	provideDocumentColor,
	provideColorPresentation,
	provideCompletion,
	provideFoldingRanges,
	provideDocumentSymbol,
	provideDocumentLinks,
	provideReferences,
	provideDefinition,
	prepareRename,
	provideRename,
	provideDiagnostics,
	provideCodeAction,
	provideHover,
	provideSignatureHelp,
	provideInlayHints,
} from './lsp';
import type {TextDocumentIdentifier, Connection} from 'vscode-languageserver/node';

declare interface Settings {
	lint: boolean;
	articlePath: string;
}

const documentSettings = new Map<string, Promise<Settings>>();

docs.onDidClose(({document}) => {
	documentSettings.delete(document.uri);
});

let connection: Connection | undefined;

try {
	connection = createConnection(ProposedFeatures.all);
	docs.listen(connection);
} catch {}

const getSettings = ({uri}: TextDocumentIdentifier): Promise<Settings> => {
	if (!documentSettings.has(uri)) {
		documentSettings.set(
			uri,
			connection!.workspace.getConfiguration({scopeUri: uri, section: 'wikiparser'}) as Promise<Settings>,
		);
	}
	return documentSettings.get(uri)!;
};

connection?.onInitialize(() => ({
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
		documentSymbolProvider: {
			label: 'Sections',
		},
		hoverProvider: true,
		signatureHelpProvider: {
			triggerCharacters: [':', '|'],
		},
		inlayHintProvider: {
			resolveProvider: false,
		},
	},
}));

connection?.onInitialized(() => {
	void connection.client.register(DidChangeConfigurationNotification.type);
});

connection?.onDidChangeConfiguration(() => {
	documentSettings.clear();
	connection.languages.diagnostics.refresh();
});

connection?.languages.diagnostics.on(async params => ({
	kind: DocumentDiagnosticReportKind.Full,
	items: (await getSettings(params.textDocument)).lint ? await provideDiagnostics(params) : [],
}));
connection?.languages.inlayHint.on(provideInlayHints);

connection?.onCodeAction(provideCodeAction);
connection?.onCompletion(provideCompletion);
connection?.onDocumentColor(provideDocumentColor);
connection?.onColorPresentation(provideColorPresentation);
connection?.onReferences(provideReferences);
connection?.onDocumentHighlight(provideReferences);
connection?.onDefinition(provideDefinition);
connection?.onPrepareRename(prepareRename);
connection?.onRenameRequest(provideRename);
connection?.onDocumentLinks(
	async ({textDocument}) => provideDocumentLinks(textDocument, (await getSettings(textDocument)).articlePath),
);
connection?.onFoldingRanges(provideFoldingRanges);
connection?.onDocumentSymbol(provideDocumentSymbol);
connection?.onHover(provideHover);
connection?.onSignatureHelp(provideSignatureHelp);

connection?.listen();
