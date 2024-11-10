import {splitColors} from '@bhsd/common';
import {Range as TextRange, TextEdit} from 'vscode-languageserver/node';
import type {ColorInformation, ColorPresentationParams, ColorPresentation} from 'vscode-languageserver/node';
import type {TextDocument} from 'vscode-languageserver-textdocument';
import type {Token, AstNodes} from 'wikilint';

/**
 * 查找颜色
 * @param doc 文档
 * @param tree 语法树
 */
const findColors = (doc: TextDocument, tree: AstNodes): ColorInformation[] => {
	const {type, childNodes} = tree;
	if (type === 'text') {
		return [];
	} else if (
		type !== 'attr-value'
		&& (type !== 'parameter-value' && type !== 'arg-default' || childNodes.length !== 1)
	) {
		return childNodes.flatMap(child => findColors(doc, child));
	}
	return childNodes.flatMap(child => {
		if (child.type !== 'text') {
			return child.childNodes.flatMap(ch => findColors(doc, ch));
		}
		const parts = splitColors(child.data).filter(([,,, isColor]) => isColor);
		if (parts.length === 0) {
			return [];
		}
		const start = child.getAbsoluteIndex();
		return parts.map(([s, from, to]): ColorInformation => {
			const range = TextRange.create(doc.positionAt(start + from), doc.positionAt(start + to));
			if (s.startsWith('#')) {
				const short = s.length < 7;
				return {
					color: {
						red: parseInt(short ? s.charAt(1).repeat(2) : s.slice(1, 3), 16) / 255,
						green: parseInt(short ? s.charAt(2).repeat(2) : s.slice(3, 5), 16) / 255,
						blue: parseInt(short ? s.charAt(3).repeat(2) : s.slice(5, 7), 16) / 255,
						alpha: parseInt((short ? s.charAt(4).repeat(2) : s.slice(7, 9)) || 'ff', 16) / 255,
					},
					range,
				};
			}
			const values = s.slice(s.indexOf('(') + 1, -1).split(/\s+(?:[,/]\s*)?|[,/]\s*/u)
				.map(v => parseFloat(v) / (v.endsWith('%') ? 100 : 1)) as [number, number, number, number?];
			return {
				color: {
					red: values[0] / 255,
					green: values[1] / 255,
					blue: values[2] / 255,
					alpha: values[3] ?? 1,
				},
				range,
			};
		});
	});
};

const numToHex = (d: number): string => Math.round(d * 255).toString(16).padStart(2, '0');

export const provideDocumentColors = (doc: TextDocument, root: Token): ColorInformation[] => findColors(doc, root);

export const provideColorPresentations = (
	{color: {red, green, blue, alpha}, range}: ColorPresentationParams,
): ColorPresentation[] => {
	const newText = `#${numToHex(red)}${numToHex(green)}${numToHex(blue)}${alpha < 1 ? numToHex(alpha) : ''}`;
	return [
		{
			label: newText,
			textEdit: TextEdit.replace(range, newText),
		},
	];
};
