/* eslint-disable jsdoc/require-jsdoc */
import {Range as TextRange} from 'vscode-languageserver/node';
import type {TextDocument} from 'vscode-languageserver-textdocument';

export const createRange = (doc: TextDocument, start: number, end: number): TextRange =>
	TextRange.create(doc.positionAt(start), doc.positionAt(end));

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
