import {getText, createRange} from './util';
import {parse, docs} from './tasks';
import type {Range as TextRange, TextDocumentPositionParams} from 'vscode-languageserver/node';
import type {TextDocument} from 'vscode-languageserver-textdocument';
import type {Token, TokenTypes, AstNodes} from 'wikilint';

declare interface Reference {
	range: TextRange;
	uri: string;
	kind: 1;
}

const tagTypes = new Set<string | undefined>(['ext', 'html']),
	braceTypes = new Set<string | undefined>(['arg-name', 'template-name', 'magic-word-name', 'link-target']);

/**
 * 查找引用
 * @param doc 文档
 * @param tree 语法树
 * @param target 目标名称或位置
 * @param targetType 节点类型
 */
const findRef = (
	doc: TextDocument,
	tree: AstNodes,
	target?: string | number,
	targetType?: TokenTypes,
): AstNodes[] => {
	if (target === undefined) {
		return [];
	} else if (typeof target === 'string') {
		const {childNodes, type, name} = tree,
			matches = (targetType ? type === targetType : tagTypes.has(type)) && name === target,
			nodes: AstNodes[] = matches ? [tree] : [];
		if (type !== 'text' && (!matches || !tagTypes.has(targetType))) {
			nodes.push(...childNodes.flatMap(child => findRef(doc, child, target, targetType)));
		}
		return nodes;
	}
	let offset = target,
		node = tree,
		parentNode: Token | undefined;
	while (node.type !== 'text') {
		// eslint-disable-next-line @typescript-eslint/no-loop-func
		const child = node.childNodes.find(ch => {
			const i = ch.getRelativeIndex();
			return i < offset && i + String(ch).length >= offset;
		});
		if (!child || child.type === 'text') {
			break;
		}
		parentNode = node;
		node = child;
		offset -= child.getRelativeIndex();
	}
	return braceTypes.has(node.type) ? findRef(doc, tree, parentNode?.name, parentNode?.type) : [];
};

export const provideReferences = async (
	{textDocument: {uri}, position}: TextDocumentPositionParams,
): Promise<Reference[] | null> => {
	const doc = docs.get(uri)!,
		{line} = position,
		after = getText(doc, line, position.character, line + 1, 0),
		character = position.character + /^\w*/u.exec(after)![0].length,
		before = getText(doc, line, 1, line, character),
		mt1 = /(?:<\/?(\w+)|(?:\{\{|\[\[)(?:[^|{}[\]<]|<!--)+)$/u.exec(before);
	if (!mt1) {
		return null;
	}
	const refs = findRef(doc, await parse(uri), mt1[1]?.toLowerCase() ?? doc.offsetAt(position));
	return refs.length === 0
		? null
		: refs.map((ref): Reference => {
			const j = ref.getAbsoluteIndex();
			return {
				range: createRange(doc, j, j + String(ref).length),
				uri: doc.uri,
				kind: 1,
			};
		});
};
