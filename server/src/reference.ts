import {getText, createRange} from './util';
import {parse, docs} from './tasks';
import type {Range as TextRange, TextDocumentPositionParams} from 'vscode-languageserver/node';
import type {Token, TokenTypes, AttributeToken, ExtToken} from 'wikilint';

declare interface Location {
	range: TextRange;
	uri: string;
	kind: 1;
}

const types = new Set<TokenTypes>([
		'ext',
		'html',
		'attr-key',
		'arg-name',
		'template-name',
		'magic-word-name',
		'link-target',
	]),
	refAttrs = new Set<string | undefined>(['name', 'extends', 'follow']),
	re = /<ref(?:\s[^>]*)?\s(?:name|extends|follow)\s*=\s*(?:(["'])(?:(?!\1|>).)+|[^\s>"'][^\s>]*)$/iu;

const getName = ({type, name, parentNode}: Token): string | undefined =>
	type === 'ext' || type === 'html' ? name : parentNode!.name;

const getRefName = (token: Token): string | number => {
	const {type, parentNode} = token,
		{name, tag} = parentNode as AttributeToken;
	return type === 'attr-value' && tag === 'ref' && refAttrs.has(name) ? String(token).trim() : NaN;
};

const getRefGroup = (token: Token): string | number => {
	const {type, parentNode} = token,
		{name, tag} = parentNode as AttributeToken;
	return type === 'attr-value' && name === 'group' && (tag === 'ref' || tag === 'references')
		? String(token).trim()
		: NaN;
};

const provide = async (
	{textDocument: {uri}, position}: TextDocumentPositionParams,
	definition?: boolean,
): Promise<Location[] | null> => {
	const doc = docs.get(uri)!,
		{line, character} = position,
		[word] = /^\w*/u.exec(getText(doc, line, character, line + 1, 0))!;
	if (definition && !re.test(getText(doc, line, 0, line, character) + word)) {
		return null;
	}
	const root = await parse(uri);
	let offset = doc.offsetAt(position) + word.length,
		node = root;
	while (true) { // eslint-disable-line no-constant-condition
		// eslint-disable-next-line @typescript-eslint/no-loop-func
		const child = node.childNodes.find(ch => {
			const i = ch.getRelativeIndex();
			if (i < offset && i + String(ch).length >= offset) {
				offset -= i;
				return true;
			}
			return false;
		});
		if (!child || child.type === 'text') {
			break;
		}
		node = child;
	}
	const {type} = node,
		refName = getRefName(node),
		refGroup = getRefGroup(node);
	if (!refName && (definition || !refGroup && !types.has(type))) {
		return null;
	}
	const name = getName(node),
		refs = root.querySelectorAll(type).filter(token => {
			if (definition) {
				const parent = token.parentNode as AttributeToken;
				return parent.tag === 'ref' && parent.name === 'name'
					&& !(parent.parentNode!.parentNode as ExtToken).selfClosing
					&& getRefName(token) === refName;
			}
			return type === 'attr-value'
				? getRefName(token) === refName || getRefGroup(token) === refGroup
				: getName(token) === name;
		});
	return refs.length === 0
		? null
		: refs.map((ref): Location => {
			const j = ref.getAbsoluteIndex();
			return {
				range: createRange(doc, j, j + String(ref).length),
				uri: doc.uri,
				kind: 1,
			};
		});
};

export const provideReferences = (params: TextDocumentPositionParams): Promise<Location[] | null> => provide(params);
export const provideDef = (params: TextDocumentPositionParams): Promise<Location[] | null> => provide(params, true);
