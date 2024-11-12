import {Range as TextRange} from 'vscode-languageserver/node';
import Parser from 'wikilint';
import {docs, parse} from './tasks';
import type {TokenTypes, Token, AstNodes} from 'wikilint';
import type {DocumentLink, TextDocumentIdentifier} from 'vscode-languageserver/node';
import type {TextDocument} from 'vscode-languageserver-textdocument';

declare type Title = ReturnType<typeof Parser.normalizeTitle>;

const linkTypes = new Set<TokenTypes | 'text'>([
	'link-target',
	'template-name',
	'invoke-module',
	'magic-link',
	'ext-link-url',
	'free-ext-link',
]);

const getUrl = (path: string, {title, fragment}: Title): string => {
	const encoded = encodeURIComponent(title) + (fragment === undefined ? '' : `#${encodeURIComponent(fragment)}`);
	return path.includes('$1') ? path.replace('$1', encoded) : path + (path.endsWith('/') ? '' : '/') + encoded;
};

/**
 * 解析MagicLink
 * @param path 条目路径
 * @param link 原链接文本
 */
const parseMagicLink = (path: string, link: string): string => {
	if (link.startsWith('RFC')) {
		return `https://tools.ietf.org/html/rfc${link.slice(3).trim()}`;
	}
	return link.startsWith('PMID')
		? `https://pubmed.ncbi.nlm.nih.gov/${link.slice(4).trim()}`
		: getUrl(
			path,
			Parser.normalizeTitle(`Special:Booksources/${link.slice(4).replace(/[\p{Zs}\t-]/gu, '')}`),
		);
};

/**
 * 生成链接
 * @param doc 文档
 * @param path 条目路径
 * @param tree 语法树
 * @param parent 父节点
 * @param grandparent 祖父节点
 */
const generateLinks = (
	doc: TextDocument,
	path: string,
	tree: AstNodes,
	parent?: Token,
	grandparent?: Token,
): DocumentLink[] => {
	const {type, childNodes} = tree;
	if (
		linkTypes.has(type)
		|| type === 'attr-value' && grandparent?.name === 'templatestyles' && parent?.name === 'src'
	) {
		const str = String(tree);
		let target = str.replace(/<!--.*?-->/gsu, '').trim();
		if (/[<>[\]|{}]/u.test(target)) {
			return [];
		}
		try {
			if (type === 'magic-link') {
				target = parseMagicLink(path, target);
			} else if (target.startsWith('/')) {
				return [];
			} else if (type !== 'ext-link-url' && type !== 'free-ext-link') {
				let ns = 0;
				if (type === 'template-name' || type === 'attr-value') {
					ns = 10;
				} else if (type === 'invoke-module') {
					ns = 828;
				}
				target = getUrl(path, Parser.normalizeTitle(target, ns));
			}
			if (target.startsWith('//')) {
				target = `https:${target}`;
			} else if (target.startsWith('/')) {
				return [];
			}
			const from = tree.getAbsoluteIndex();
			return [{range: TextRange.create(doc.positionAt(from), doc.positionAt(from + str.length)), target}];
		} catch {
			console.debug(`Unable to parse title: ${target}`);
			return [];
		}
	}
	return type === 'text' ? [] : childNodes.flatMap(node => generateLinks(doc, path, node, tree, parent));
};

export const provideLinks = async ({uri}: TextDocumentIdentifier, path: string): Promise<DocumentLink[]> =>
	generateLinks(docs.get(uri)!, path, await parse(uri));
