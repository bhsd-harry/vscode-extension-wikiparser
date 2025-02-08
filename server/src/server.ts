import {
	TextDocumentSyncKind,
	CodeActionKind,
	DidChangeConfigurationNotification,
	DocumentDiagnosticReportKind,
} from 'vscode-languageserver/node';
import {documentSettings} from './tasks';
import {connection} from './task';
import {diagnose, quickFix} from './diagnostic';
import provideCompletion from './completion';
import {provideDocumentColor, provideColorPresentation} from './color';
import {provideReferences, provideDefinition, prepareRename, provideRename} from './reference';
import provideDocumentLinks from './links';
import {provideFoldingRanges, provideDocumentSymbol} from './folding';
import {provideHover} from './hover';
import provideSignatureHelp from './signature';
import type {TextDocumentIdentifier} from 'vscode-languageserver/node';
import type {Settings} from './tasks';

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
	},
}));

connection?.onInitialized(() => {
	void connection?.client.register(DidChangeConfigurationNotification.type);
});

connection?.onDidChangeConfiguration(() => {
	documentSettings.clear();
	connection?.languages.diagnostics.refresh();
});

// diagnostic.ts
connection?.languages.diagnostics.on(async params => ({
	kind: DocumentDiagnosticReportKind.Full,
	items: (await getSettings(params.textDocument)).lint ? await diagnose(params) : [],
}));
connection?.onCodeAction(quickFix);

// completion.ts
connection?.onCompletion(provideCompletion);

// color.ts
connection?.onDocumentColor(provideDocumentColor);
connection?.onColorPresentation(provideColorPresentation);

// reference.ts
connection?.onReferences(provideReferences);
connection?.onDocumentHighlight(provideReferences);
connection?.onDefinition(provideDefinition);
connection?.onPrepareRename(prepareRename);
connection?.onRenameRequest(provideRename);

// links.ts
connection?.onDocumentLinks(
	async ({textDocument}) => provideDocumentLinks(textDocument, (await getSettings(textDocument)).articlePath),
);

// folding.ts
connection?.onFoldingRanges(provideFoldingRanges);
connection?.onDocumentSymbol(provideDocumentSymbol);

// hover.ts
connection?.onHover(provideHover);

// signature.ts
connection?.onSignatureHelp(provideSignatureHelp);

connection?.listen();
