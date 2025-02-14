import {
	TextDocumentSyncKind,
	CodeActionKind,
	DidChangeConfigurationNotification,
	DocumentDiagnosticReportKind,
} from 'vscode-languageserver/node';
import {
	docs,
	connection,
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
import type {TextDocumentIdentifier, FullDocumentDiagnosticReport} from 'vscode-languageserver/node';

declare interface Settings {
	linter: {
		enable: boolean;
		severity: 'errors only' | 'errors and warnings';
	};
	inlay: boolean;
	completion: boolean;
	color: boolean;
	hover: boolean;
	signature: boolean;
	articlePath: string;
}

const documentSettings = new Map<string, Promise<Settings>>();

docs.onDidClose(({document}) => {
	documentSettings.delete(document.uri);
});

const getSetting = ({textDocument: {uri}}: {textDocument: TextDocumentIdentifier}): Promise<Settings> => {
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
	void connection!.client.register(DidChangeConfigurationNotification.type);
});

connection?.onDidChangeConfiguration(() => {
	documentSettings.clear();
	connection!.languages.diagnostics.refresh();
});

connection?.languages.diagnostics.on(async (params): Promise<FullDocumentDiagnosticReport> => {
	const {linter: {enable, severity}} = await getSetting(params);
	return {
		kind: DocumentDiagnosticReportKind.Full,
		items: enable ? await provideDiagnostics(params, severity === 'errors and warnings') : [],
	};
});
connection?.languages.inlayHint.on(async params => (await getSetting(params)).inlay ? provideInlayHints(params) : []);

connection?.onCodeAction(provideCodeAction);
connection?.onCompletion(async params => (await getSetting(params)).completion ? provideCompletion(params) : null);
connection?.onDocumentColor(async params => (await getSetting(params)).color ? provideDocumentColor(params) : []);
connection?.onColorPresentation(provideColorPresentation);
connection?.onReferences(provideReferences);
connection?.onDocumentHighlight(provideReferences);
connection?.onDefinition(provideDefinition);
connection?.onPrepareRename(prepareRename);
connection?.onRenameRequest(provideRename);
connection?.onDocumentLinks(async params => provideDocumentLinks(params, (await getSetting(params)).articlePath));
connection?.onFoldingRanges(provideFoldingRanges);
connection?.onDocumentSymbol(provideDocumentSymbol);
connection?.onHover(async params => (await getSetting(params)).hover ? provideHover(params) : null);
connection?.onSignatureHelp(async params => (await getSetting(params)).signature ? provideSignatureHelp(params) : null);

connection?.listen();
