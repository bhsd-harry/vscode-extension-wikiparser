import path from 'path';
import {
	TextDocumentSyncKind,
	CodeActionKind,
	DidChangeConfigurationNotification,
	DocumentDiagnosticReportKind,
} from 'vscode-languageserver/node';
import {
	Parser,
	docs,
	connection,
	getLSP,
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
		lilypond: string;
		mathjax: string;
	};
	inlay: boolean;
	completion: boolean;
	color: boolean;
	hover: boolean;
	signature: boolean;
	articlePath: string;
	config: string;
}

const documentSettings = new Map<string, Promise<Settings>>();

docs.onDidOpen(({document}) => {
	void setTarget(document);
});
docs.onDidClose(({document}) => {
	documentSettings.delete(document.uri);
});

const defaultSettings: Settings = {
	linter: {
		enable: true,
		severity: 'errors only',
		lilypond: '',
		mathjax: '',
	},
	inlay: true,
	completion: true,
	color: true,
	hover: true,
	signature: true,
	articlePath: '',
	config: '',
};

const getSetting = async ({textDocument: {uri}}: {textDocument: TextDocumentIdentifier}): Promise<Settings> => {
	if (!documentSettings.has(uri)) {
		documentSettings.set(
			uri,
			connection!.workspace.getConfiguration({scopeUri: uri, section: 'wikiparser'}) as Promise<Settings>,
		);
	}
	try {
		return await documentSettings.get(uri) ?? defaultSettings;
	} catch {
		return defaultSettings;
	}
};

const setTarget = async (doc: TextDocumentIdentifier): Promise<void> => {
	const setting = await getSetting({textDocument: doc}),
		{articlePath, config} = setting,
		[, lsp] = getLSP(doc.uri);
	if (config) {
		try {
			lsp.config = Parser.getConfig(
				// eslint-disable-next-line @typescript-eslint/no-require-imports
				require(
					path.isAbsolute(config) ? config : path.join('..', '..', config),
				) as Parser.ConfigData,
			);
			return;
		} catch {}
	}
	try {
		await lsp.setTargetWikipedia(articlePath);
	} catch {
		lsp.config = Parser.getConfig();
	}
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
			triggerCharacters: [':', '：', '|'],
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
	(async () => {
		for (const doc of docs.all()) {
			await setTarget(doc);
		}
	})();
});

connection?.languages.diagnostics.on(async (params): Promise<FullDocumentDiagnosticReport> => {
	const {linter: {enable, severity, lilypond, mathjax}} = await getSetting(params);
	return {
		kind: DocumentDiagnosticReportKind.Full,
		items: enable ? await provideDiagnostics(params, severity === 'errors and warnings', lilypond, mathjax) : [],
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

connection?.onShutdown(() => {
	for (const doc of docs.all()) {
		Parser.createLanguageService(doc).destroy();
	}
});
connection?.onExit(() => {
	connection!.dispose();
});

connection?.listen();
