import {
	createConnection,
	TextDocuments,
	ProposedFeatures,
	DidChangeConfigurationNotification,
	DocumentDiagnosticReportKind,
} from 'vscode-languageserver/node';
import {TextDocument} from 'vscode-languageserver-textdocument';
import Parser from 'wikilint';
import type {Diagnostic} from 'vscode-languageserver/node';

declare interface Settings {
	lint: boolean;
}

const connection = createConnection(ProposedFeatures.all),
	docs = new TextDocuments(TextDocument),
	defaultSettings: Settings = {lint: true},
	trees = new Map<TextDocument, [string, Parser.Token]>();
let globalSettings: Settings = defaultSettings;

const validate = (doc: TextDocument): Diagnostic[] => {
	const tree = trees.get(doc),
		text = doc.getText(),
		root = tree?.[0] === text ? tree[1] : Parser.parse(text, true);
	return root.lint().map(({startLine, startCol, endLine, endCol, severity, message, fix, suggestions}) => ({
		range: {start: {line: startLine, character: startCol}, end: {line: endLine, character: endCol}},
		severity: severity === 'error' ? 1 : 2,
		source: 'WikiLint',
		message,
		data: {fix, suggestions},
	}));
};

connection.onInitialize(() => ({
	capabilities: {
		diagnosticProvider: {
			interFileDependencies: false,
			workspaceDiagnostics: false,
		},
	},
}));

connection.onInitialized(() => {
	void connection.client.register(DidChangeConfigurationNotification.type);
});

connection.onDidChangeConfiguration(({settings}) => {
	const {lint} = globalSettings;
	globalSettings = (settings as Record<string, Settings>)['wikiparser'] || defaultSettings;
	if (globalSettings.lint !== lint) {
		connection.languages.diagnostics.refresh();
	}
});

connection.languages.diagnostics.on(({textDocument: {uri}}) => {
	const doc = docs.get(uri);
	return {
		kind: DocumentDiagnosticReportKind.Full,
		items: doc === undefined || !globalSettings.lint ? [] : validate(doc),
	};
});

docs.listen(connection);
connection.listen();
