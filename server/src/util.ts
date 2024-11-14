import {Range as TextRange} from 'vscode-languageserver/node';
import type {Position} from 'vscode-languageserver/node';
import type {TextDocument} from 'vscode-languageserver-textdocument';
import type {TokenTypes, Token} from 'wikilint';

export const plainTypes = new Set<TokenTypes | 'text'>(['text', 'comment', 'noinclude', 'include']);

export const createRange = (doc: TextDocument, start: number, end: number): TextRange =>
	TextRange.create(doc.positionAt(start), doc.positionAt(end));

export const createNodeRange = (doc: TextDocument, token: Token): TextRange => {
	const start = token.getAbsoluteIndex();
	return createRange(doc, start, start + String(token).length);
};

export function getText(
	doc: TextDocument,
	startLine: number,
	startCharacter: number,
	endLine: number,
	endCharacter: number,
): string;
export function getText(doc: TextDocument, start: number, end: number): string;
export function getText(
	doc: TextDocument,
	startOrStartLine: number,
	endOrStartCharacter: number,
	endLine?: number,
	endCharacter?: number,
): string {
	return doc.getText(
		endLine === undefined || endCharacter === undefined
			? createRange(doc, startOrStartLine, endOrStartCharacter)
			: TextRange.create(startOrStartLine, endOrStartCharacter, endLine, endCharacter),
	);
}

export const elementFromIndex = (root: Token, index: number): Token => {
	let offset = index,
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
	return node;
};

export const elementFromWord = (doc: TextDocument, root: Token, pos: Position): Token => {
	const {line, character} = pos,
		offset = doc.offsetAt(pos) + /^\w*/u.exec(getText(doc, line, character, line + 1, 0))![0].length;
	return elementFromIndex(root, offset);
};
