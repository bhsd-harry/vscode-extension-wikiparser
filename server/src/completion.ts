import {Range as TextRange, CompletionItemKind} from 'vscode-languageserver/node';
import Parser from 'wikilint';
import {getText} from './util';
import {docs} from './tasks';
import type {Position, CompletionItem} from 'vscode-languageserver/node';
import type {TextDocumentPositionParams} from 'vscode-languageserver/node';

const config = Parser.getConfig();

const getCompletion = (
	words: string[],
	kind: keyof typeof CompletionItemKind,
	mt: string,
	{line, character}: Position,
): CompletionItem[] => words.map(w => ({
	label: w,
	kind: CompletionItemKind[kind],
	textEdit: {
		range: TextRange.create(line, character - mt.length, line, character),
		newText: w,
	},
}));

export const completion = ({textDocument: {uri}, position}: TextDocumentPositionParams): CompletionItem[] | null => {
	const before = getText(docs.get(uri)!, position.line, 1, position.line, position.character),
		mt = /(?:\{\{\s*(#[^|{}<>[\]#:]*)|(__(?:(?!__)[\p{L}\d_])+)|<\/?([a-z\d]+)|(?:^|[^[])\[([a-z:/]+))$/iu
			.exec(before);
	if (!mt) {
		return null;
	} else if (mt[1]) {
		return getCompletion(Object.keys(config.parserFunction[0]), 'Function', mt[1], position);
	} else if (mt[2]) {
		const {doubleUnderscore: [insensitive,, obj]} = config;
		if (obj && insensitive.length === 0) {
			insensitive.push(...Object.keys(obj));
		}
		return getCompletion(
			(config.doubleUnderscore.slice(0, 2) as string[][]).flat().map(w => `__${w}__`),
			'Keyword',
			mt[2],
			position,
		);
	} else if (mt[3]) {
		return getCompletion(
			[config.ext, config.html, 'onlyinclude', 'includeonly', 'noinclude'].flat(2),
			'Property',
			mt[3],
			position,
		);
	} else if (mt[4]) {
		return getCompletion(config.protocol.split('|'), 'File', mt[4], position);
	}
	throw new Error('Unknown completion type!');
};
