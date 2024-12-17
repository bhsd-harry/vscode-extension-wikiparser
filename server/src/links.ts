import Parser from 'wikilint';
import {plainTypes, createNodeRange, createRange} from './util';
import {parse} from './tasks';
import type {Token, AttributeToken, TokenTypes} from 'wikilint';
import type {DocumentLink, TextDocumentIdentifier} from 'vscode-languageserver/node';

const srcTags = new Set(['templatestyles', 'img']),
	citeTags = new Set(['blockquote', 'del', 'ins', 'q']),
	linkTypes = new Set<TokenTypes>(['link-target', 'template-name', 'invoke-module']),
	protocolRegex = new RegExp(`^(?:${Parser.getConfig().protocol}|//)`, 'iu');

const getUrl = (path: string, page: string, ns?: number): string => {
	const {title, fragment, valid} = Parser.normalizeTitle(page, ns);
	if (!valid) {
		throw new RangeError('Invalid page name.');
	}
	const encoded = encodeURIComponent(title) + (fragment === undefined ? '' : `#${encodeURIComponent(fragment)}`);
	return path.includes('$1') ? path.replace('$1', encoded) : path + (path.endsWith('/') ? '' : '/') + encoded;
};

const parseMagicLink = (path: string, link: string): string => {
	if (link.startsWith('ISBN')) {
		return getUrl(path, `Special:Booksources/${link.slice(4).replace(/[\p{Zs}\t-]/gu, '')}`);
	}
	return link.startsWith('RFC')
		? `https://tools.ietf.org/html/rfc${link.slice(3).trim()}`
		: `https://pubmed.ncbi.nlm.nih.gov/${link.slice(4).trim()}`;
};

export const provideLinks = async ({uri}: TextDocumentIdentifier, path: string): Promise<DocumentLink[]> => {
	const root = await parse(uri);
	return root
		.querySelectorAll(
			'link-target,template-name,invoke-module,magic-link,ext-link-url,free-ext-link,attr-value,'
			+ 'image-parameter#link',
		)
		.filter(({type, parentNode, childNodes}) => {
			const {name, tag} = parentNode as AttributeToken;
			return (type !== 'attr-value' || name === 'src' && srcTags.has(tag) || name === 'cite' && citeTags.has(tag))
				&& childNodes.every(({type: t}) => plainTypes.has(t));
		})
		.flatMap((token: Token & {toString(skip?: boolean): string}) => {
			const {type, parentNode, firstChild, lastChild} = token,
				{name, tag} = parentNode as AttributeToken;
			let target = type === 'image-parameter'
				? (Object.getPrototypeOf(token.constructor) as ObjectConstructor).prototype
					.toString.apply(token, [true] as unknown as []).trim()
				: token.toString(true).trim();
			try {
				if (type === 'magic-link') {
					target = parseMagicLink(path, target);
				} else if (
					linkTypes.has(type)
					|| type === 'attr-value' && name === 'src' && tag === 'templatestyles'
					|| type === 'image-parameter' && !protocolRegex.test(target)
				) {
					if (target.startsWith('/')) {
						return [];
					}
					let ns = 0;
					if (type === 'template-name' || type === 'attr-value') {
						ns = 10;
					} else if (type === 'invoke-module') {
						ns = 828;
					}
					target = getUrl(path, target, ns);
				}
				if (target.startsWith('//')) {
					target = `https:${target}`;
				}
				return [
					{
						range: type === 'image-parameter'
							? createRange(
								root,
								firstChild!.getAbsoluteIndex(),
								lastChild!.getAbsoluteIndex() + String(lastChild!).length,
							)
							: createNodeRange(root, token),
						target: new URL(target).href,
					},
				];
			} catch {
				return [];
			}
		});
};
