import {Range as TextRange, CompletionItemKind} from 'vscode-languageserver/node';
import Parser from 'wikilint';
import {commonHtmlAttrs, htmlAttrs, extAttrs} from 'wikilint/dist/util/sharable';
import {getText, elementFromIndex} from './util';
import {docs, parse} from './tasks';
import type {Position, CompletionItem} from 'vscode-languageserver/node';
import type {CompletionParams} from 'vscode-languageserver/node';
import type {Token, AttributeToken, ParameterToken} from 'wikilint';

const {nsid, ext, html, parserFunction, doubleUnderscore, protocol, img} = Parser.getConfig(),
	re = new RegExp(
		'(?:' // eslint-disable-line prefer-template
		+ String.raw`<\/?(\w+)` // tag
		+ '|'
		+ String.raw`(\{{2,4}|\[\[)\s*([^|{}<>[\]\s][^|{}<>[\]#]*)` // braces and brackets
		+ '|'
		+ String.raw`(__(?:(?!__)[\p{L}\d_])+)` // behavior switch
		+ '|'
		+ String.raw`(?<!\[)\[([a-z:/]+)` // protocol
		+ '|'
		+ String.raw`\[\[\s*(?:${
			Object.entries(nsid).filter(([, v]) => v === 6).map(([k]) => k).join('|')
		})\s*:[^[\]{}<>]+\|([^[\]{}<>|=]+)` // image parameter
		+ '|'
		+ String.raw`<(\w+)(?:\s(?:[^<>{}|=\s]+(?:\s*=\s*(?:[^\s"']\S*|(["']).*?\8))?(?=\s))*)?\s(\w+)` // attribute key
		+ ')$',
		'iu',
	);

if (doubleUnderscore[0].length === 0 && doubleUnderscore[2]) {
	doubleUnderscore[0] = Object.keys(doubleUnderscore[2]);
}

const tags = new Set([ext, html].flat(2)),
	allTags = [...tags, 'onlyinclude', 'includeonly', 'noinclude'],
	functions = [Object.keys(parserFunction[0]), parserFunction.slice(1) as string[][]].flat(2),
	switches = (doubleUnderscore.slice(0, 2) as string[][]).flat().map(w => `__${w}__`),
	protocols = protocol.split('|'),
	params = Object.keys(img).filter(k => k.endsWith('$1') || !k.includes('$1')).map(k => k.replace(/\$1$/u, ''));

const getCompletion = (
	words: Iterable<string>,
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
		doc = docs.get(uri)!,
		mt = re.exec(getText(doc, line, 0, line, character));
	let root: Token | undefined,
		token: Token | undefined,
		offset: number | undefined;
	if (!mt) {
		offset = doc.offsetAt(position);
		root = await parse(uri);
		token = elementFromIndex(root, offset);
	}
	const {type: t, parentNode: parent} = token ?? {};
	if (mt?.[1]) { // tag
		return getCompletion(allTags, CompletionItemKind.Class, mt[1], position);
	} else if (mt?.[2] === '{{{') { // argument
		return getCompletion(
			(await parse(uri)).querySelectorAll('arg').map(({name}) => name!),
			CompletionItemKind.Variable,
			mt[3]!,
			position,
		);
	} else if (mt?.[3]) { // parser function, template or link
		const colon = mt[3].startsWith(':');
		if (mt[2] === '[[') {
			return getCompletion(
				(await parse(uri)).querySelectorAll('link,file,category').map(({name}) => name!),
				CompletionItemKind.Folder,
				colon ? mt[3].slice(1).trimStart() : mt[3],
				position,
			);
		}
		return [
			...getCompletion(functions, CompletionItemKind.Function, mt[3], position),
			...mt[3].startsWith('#')
				? []
				: getCompletion(
					(await parse(uri)).querySelectorAll('template')
						.map(({name}) => colon ? name! : name!.replace(/^Template:/u, '')),
					CompletionItemKind.Folder,
					colon ? mt[3].slice(1).trimStart() : mt[3],
					position,
				),
		];
	} else if (mt?.[4]) { // behavior switch
		return getCompletion(switches, CompletionItemKind.Constant, mt[4], position);
	} else if (mt?.[5]) { // protocol
		return getCompletion(protocols, CompletionItemKind.Reference, mt[5], position);
	} else if (mt?.[6]?.trim() || t === 'image-parameter') { // image parameter
		const match = mt?.[6]?.trimStart() ?? getText(doc, token!.getAbsoluteIndex(), offset!).trimStart();
		return [
			...getCompletion(params, CompletionItemKind.Property, match, position),
			...getCompletion(
				(root ?? await parse(uri)).querySelectorAll('image-parameter#width').map(width => width.text()),
				CompletionItemKind.Unit,
				match,
				position,
			),
		];
	} else if (mt?.[7] || t === 'attr-key') { // attribute key
		const tag = mt?.[7]?.toLowerCase() ?? (token!.parentNode as AttributeToken).tag;
		if (!tags.has(tag)) {
			return null;
		}
		const key = mt?.[9] ?? String(token),
			thisHtmlAttrs = htmlAttrs[tag],
			thisExtAttrs = extAttrs[tag],
			extCompletion = thisExtAttrs ? getCompletion(thisExtAttrs, CompletionItemKind.Field, key, position) : null;
		return ext.includes(tag) && !thisHtmlAttrs
			? extCompletion
			: [
				...extCompletion ?? [],
				...tag === 'meta' || tag === 'link'
					? []
					: getCompletion(commonHtmlAttrs, CompletionItemKind.Property, key, position),
				...thisHtmlAttrs
					? getCompletion(thisHtmlAttrs, CompletionItemKind.Property, key, position)
					: [],
				...getCompletion(['data-'], CompletionItemKind.Variable, key, position),
				...getCompletion(['xmlns:'], CompletionItemKind.Interface, key, position),
			];
	} else if (
		(t === 'parameter-key' || t === 'parameter-value' && (parent as ParameterToken).anon)
		&& parent!.parentNode!.type === 'template'
	) { // parameter key
		return getCompletion(
			root!.querySelectorAll<ParameterToken>('parameter').filter(
				({anon, parentNode}) => !anon && parentNode!.type === 'template'
					&& parentNode!.name === parent!.parentNode!.name,
			).map(({name}) => name),
			CompletionItemKind.Variable,
			String(token).trimStart(),
			position,
		);
	}
	return null;
};
