import {createNodeRange, elementFromWord} from './util';
import {parse, docs} from './tasks';
import type {
	Range as TextRange,
	TextDocumentPositionParams,
	RenameParams,
	WorkspaceEdit,
} from 'vscode-languageserver/node';
import type {Token, TokenTypes, AttributeToken, ExtToken, HeadingToken} from 'wikilint';

declare interface Location {
	range: TextRange;
	uri: string;
	kind: 1;
}

const renameTypes = new Set<TokenTypes>([
		'arg-name',
		'template-name',
		'magic-word-name',
		'link-target',
		'parameter-key',
	]),
	linkTypes = new Set<TokenTypes>(['link', 'redirect-target']),
	types = new Set<TokenTypes>([
		'ext',
		'html',
		'attr-key',
		'image-parameter',
		'heading-title',
		'heading',
		...renameTypes,
	]),
	namedTypes = new Set<TokenTypes>(['ext', 'html', 'image-parameter']),
	refAttrs = new Set<string | undefined>(['name', 'extends', 'follow']);

const getName = (token: Token): string | number | undefined => {
	const {type, name, parentNode} = token;
	switch (type) {
		case 'heading':
			return (token as HeadingToken).level;
		case 'heading-title':
			return (parentNode as HeadingToken).level;
		case 'parameter-key':
			return `${parentNode!.parentNode!.name}|${parentNode!.name}`;
		default:
			return namedTypes.has(type) ? name : parentNode!.name;
	}
};

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

// @ts-expect-error function overload
function provide(params: TextDocumentPositionParams, definition?: boolean): Promise<Location[] | null>;
function provide(params: TextDocumentPositionParams, definition: false, prepare: true): Promise<TextRange | null>;
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
	const root = await parse(uri),
		node = elementFromWord(docs.get(uri)!, root, position),
		{type} = node,
		refName = getRefName(node),
		refGroup = getRefGroup(node);
	if (
		!refName && (
			definition || !refGroup && (
				prepare || rename
					? !renameTypes.has(type) || type === 'link-target' && linkTypes.has(node.parentNode!.type)
					: !types.has(type)
			)
		)
	) {
		return null;
	}
	const name = getName(node);
	if ((prepare || rename) && type === 'parameter-key' && /^[1-9]\d*$/u.test(node.parentNode!.name!)) {
		return null;
	} else if (prepare) {
		return createNodeRange(root, node);
	}
	const refs = root.querySelectorAll(type === 'heading-title' ? 'heading' : type).filter(token => {
		if (definition) {
			const {name: n, parentNode} = token.parentNode as AttributeToken;
			return getRefName(token) === refName
				&& n === 'name' && (parentNode!.parentNode as ExtToken).innerText;
		}
		return type === 'attr-value'
			? getRefName(token) === refName || getRefGroup(token) === refGroup
			: getName(token) === name;
	}).map(token => token.type === 'parameter-key' ? token.parentNode! : token);
	if (refs.length === 0) {
		return null;
	}
	return rename
		? {
			changes: {
				[uri]: refs.map(ref => ({
					range: createNodeRange(root, ref),
					newText: newName,
				})),
			},
		}
		: refs.map((ref): Location => ({
			range: createNodeRange(root, ref),
			uri,
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
