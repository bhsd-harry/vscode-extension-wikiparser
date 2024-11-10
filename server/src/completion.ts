import {Range as TextRange, CompletionItemKind} from 'vscode-languageserver/node';
import Parser from 'wikilint';
import type {Position, CompletionItem} from 'vscode-languageserver/node';
import type {TextDocument} from 'vscode-languageserver-textdocument';

const config = Parser.getConfig();

/**
 * 生成建议列表
 * @param words 建议词
 * @param kind 建议类型
 * @param mt 匹配的文本
 * @param pos 光标位置
 * @param pos.line 行号
 * @param pos.character 列号
 */
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

export const completion = (doc: TextDocument, pos: Position): CompletionItem[] | null => {
	const before = doc.getText(TextRange.create(pos.line, 1, pos.line, pos.character)),
		mt = /(?:\{\{\s*(#[^|{}<>[\]#:]*)|__((?:(?!__)[\p{L}\d_])+)|<\/?([a-z\d]+)|(?:^|[^[])\[([a-z:/]+))$/iu
			.exec(before);
	if (!mt) {
		return null;
	} else if (mt[1]) {
		return getCompletion(Object.keys(config.parserFunction[0]), 'Function', mt[1], pos);
	} else if (mt[2]) {
		const {doubleUnderscore: [insensitive,, obj]} = config;
		if (obj && insensitive.length === 0) {
			insensitive.push(...Object.keys(obj));
		}
		return getCompletion((config.doubleUnderscore.slice(0, 2) as string[][]).flat(), 'Keyword', mt[2], pos);
	} else if (mt[3]) {
		return getCompletion(
			[config.ext, config.html, 'onlyinclude', 'includeonly', 'noinclude'].flat(2),
			'Property',
			mt[3],
			pos,
		);
	} else if (mt[4]) {
		return getCompletion(config.protocol.split('|'), 'File', mt[4], pos);
	}
	throw new Error('Unknown completion type!');
};
