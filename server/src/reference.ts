import {getText, createRange} from './util';
import {parse, docs} from './tasks';
import type {
	Range as TextRange,
	TextDocumentPositionParams,
	RenameParams,
	WorkspaceEdit,
} from 'vscode-languageserver/node';
import type {TextDocument} from 'vscode-languageserver-textdocument';
import type {Token, TokenTypes, AttributeToken, ExtToken} from 'wikilint';

declare interface Location {
	range: TextRange;
	uri: string;
	kind: 1;
}

const renameTypes = new Set<TokenTypes>(['arg-name', 'template-name', 'magic-word-name', 'link-target']),
	types = new Set<TokenTypes>(['ext', 'html', 'attr-key', ...renameTypes]),
	refAttrs = new Set<string | undefined>(['name', 'extends', 'follow']),
	re = /<ref(?:\s[^>]*)?\s(?:name|extends|follow)\s*=\s*(?:(["'])(?:(?!\1|>).)+|[^\s>"'][^\s>]*)$/iu;

const getName = ({type, name, parentNode}: Token): string | undefined =>
	type === 'ext' || type === 'html' ? name : parentNode!.name;

const getRefName = (token: Token): string | number => {
	const {type, parentNode = {}} = token,
		{name, tag} = parentNode as AttributeToken;
	return type === 'attr-value' && tag === 'ref' && refAttrs.has(name) ? String(token).trim() : NaN;
};

const getRefGroup = (token: Token): string | number => {
	const {type, parentNode = {}} = token,
		{name, tag} = parentNode as AttributeToken;
	return type === 'attr-value' && name === 'group' && (tag === 'ref' || tag === 'references')
		? String(token).trim()
		: NaN;
};

const createNodeRange = (doc: TextDocument, token: Token): TextRange => {
	const start = token.getAbsoluteIndex();
	return createRange(doc, start, start + String(token).length);
};

// @ts-expect-error function overload
async function provide(params: TextDocumentPositionParams, definition?: boolean): Promise<Location[] | null>;
async function provide(params: TextDocumentPositionParams, definition: false, prepare: true): Promise<TextRange | null>;
async function provide(
	params: RenameParams,
	definition: false,
	prepare: false,
	rename: true,
): Promise<WorkspaceEdit | null>;
async function provide(
	{textDocument: {uri}, position, newName}: RenameParams,
	definition?: boolean,
	prepare?: true,
	rename?: true,
): Promise<Location[] | TextRange | WorkspaceEdit | null> {
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
	if (!refName && (definition || !refGroup && !(prepare || rename ? renameTypes : types).has(type))) {
		return null;
	} else if (prepare) {
		return createNodeRange(doc, node);
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
	if (refs.length === 0) {
		return null;
	}
	return rename
		? {
			changes: {
				[uri]: refs.map(ref => ({
					range: createNodeRange(doc, ref),
					newText: newName,
				})),
			},
		}
		: refs.map((ref): Location => ({
			range: createNodeRange(doc, ref),
			uri: doc.uri,
			kind: 1,
		}));
}

export const provideReferences = (params: TextDocumentPositionParams): Promise<Location[] | null> => provide(params);
export const provideDefinition = (params: TextDocumentPositionParams): Promise<Location[] | null> =>
	provide(params, true);
export const prepareRename = (params: TextDocumentPositionParams): Promise<TextRange | null> =>
	provide(params, false, true);
export const provideRename = (params: RenameParams): Promise<WorkspaceEdit | null> =>
	provide(params, false, false, true);
