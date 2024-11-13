import {Range as TextRange, CompletionItemKind} from 'vscode-languageserver/node';
import Parser from 'wikilint';
import {getText} from './util';
import {docs, parse} from './tasks';
import type {Position, CompletionItem} from 'vscode-languageserver/node';
import type {CompletionParams} from 'vscode-languageserver/node';

const {nsid, ext, html, parserFunction, doubleUnderscore, protocol, img} = Parser.getConfig(),
	re = new RegExp(
		'(?:' // eslint-disable-line prefer-template
		+ String.raw`<\/?(\w+)` // tag
		+ '|'
		+ String.raw`(\{{2,3})\s*([^|{}<>[\]\s][^|{}<>[\]#]*)` // braces
		+ '|'
		+ String.raw`(__(?:(?!__)[\p{L}\d_])+)` // behavior switch
		+ '|'
		+ String.raw`(?:^|[^[])\[([a-z:/]+)` // protocol
		+ '|'
		+ String.raw`\[\[\s*(?:${
			Object.entries(nsid).filter(([, v]) => v === 6).map(([k]) => k).join('|')
		}):[^[\]]+\|\s*([^[\]|=]+)` // image parameter
		+ ')$',
		'iu',
	);

if (doubleUnderscore[0].length === 0 && doubleUnderscore[2]) {
	doubleUnderscore[0] = Object.keys(doubleUnderscore[2]);
}

const tags = [ext, html, 'onlyinclude', 'includeonly', 'noinclude'].flat(2),
	functions = [...Object.keys(parserFunction[0]), parserFunction.slice(1) as string[][]].flat(2),
	switches = (doubleUnderscore.slice(0, 2) as string[][]).flat().map(w => `__${w}__`),
	protocols = protocol.split('|'),
	params = Object.keys(img).filter(k => k.endsWith('$1') || !k.includes('$1')).map(k => k.replace(/\$1$/u, ''));

const getCompletion = (
	words: string[],
	kind: CompletionItemKind,
	mt: string,
	{line, character}: Position,
): CompletionItem[] => [...new Set(words)].map(w => ({
	label: w,
	kind,
	textEdit: {
		range: TextRange.create(line, character - mt.length, line, character),
		newText: w,
	},
}));

export const completion = async (
	{textDocument: {uri}, position}: CompletionParams,
): Promise<CompletionItem[] | null> => {
	const {line, character} = position,
		mt = re.exec(getText(docs.get(uri)!, line, 1, line, character));
	if (!mt) {
		return null;
	} else if (mt[1]) { // tag
		return getCompletion(tags, CompletionItemKind.Class, mt[1], position);
	} else if (mt[2] === '{{{') { // argument
		return getCompletion(
			(await parse(uri)).querySelectorAll('arg').map(({name}) => name!),
			CompletionItemKind.Variable,
			mt[3]!,
			position,
		);
	} else if (mt[3]) { // parser function and template
		return [
			...getCompletion(functions, CompletionItemKind.Function, mt[3], position),
			...mt[3].startsWith('#')
				? []
				: getCompletion(
					(await parse(uri)).querySelectorAll('template').map(({name}) => name!.replace(/^Template:/u, '')),
					CompletionItemKind.Folder,
					mt[3],
					position,
				),
		];
	} else if (mt[4]) { // behavior switch
		return getCompletion(switches, CompletionItemKind.Constant, mt[4], position);
	} else if (mt[5]) { // protocol
		return getCompletion(protocols, CompletionItemKind.Reference, mt[5], position);
	} else if (mt[6]) { // image parameter
		return getCompletion(params, CompletionItemKind.Property, mt[6], position);
	}
	throw new Error('Unknown completion type!');
};
