import {Range as TextRange} from 'vscode-languageserver/node';
import type {Position} from 'vscode-languageserver/node';
import type {TextDocument} from 'vscode-languageserver-textdocument';
import type {TokenTypes, Token} from 'wikilint';

export const plainTypes = new Set<TokenTypes | 'text'>(['text', 'comment', 'noinclude', 'include']);

export const positionAt = (root: Token, i: number): Position => {
	const {top, left} = root.posFromIndex(i)!;
	return {line: top, character: left};
};

export const createRange = (root: Token, start: number, end: number): TextRange => ({
	start: positionAt(root, start),
	end: positionAt(root, end),
});

export const createNodeRange = (root: Token, token: Token): TextRange => {
	const start = token.getAbsoluteIndex();
	return createRange(root, start, start + String(token).length);
};

export const getText = (
	doc: TextDocument,
	startLine: number,
	startCharacter: number,
	endLine: number,
	endCharacter: number,
): string =>
	doc.getText(TextRange.create(startLine, startCharacter, endLine, endCharacter));

export const elementFromPosition = (root: Token, {line, character}: Position): Token => {
	let offset = root.indexFromPos(line, character)!,
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
		[{length}] = /^\w*/u.exec(getText(doc, line, character, line + 1, 0))!;
	return elementFromPosition(root, {line, character: character + length});
};
