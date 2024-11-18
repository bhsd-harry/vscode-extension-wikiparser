import {splitColors, numToHex} from '@bhsd/common';
import {TextEdit} from 'vscode-languageserver/node';
import {createRange, plainTypes} from './util';
import {parse, docs} from './tasks';
import type {
	ColorInformation,
	ColorPresentationParams,
	ColorPresentation,
	DocumentColorParams,
} from 'vscode-languageserver/node';
import type {AstText} from 'wikilint';

export const provideDocumentColors = async (
	{textDocument: {uri}}: DocumentColorParams,
): Promise<ColorInformation[]> => {
	const rgba = (await import('color-rgba')).default;
	const doc = docs.get(uri)!;
	return (await parse(uri)).querySelectorAll('attr-value,parameter-value,arg-default').flatMap(token => {
		const {type, childNodes} = token;
		if (type !== 'attr-value' && !childNodes.every(({type: t}) => plainTypes.has(t))) {
			return [];
		}
		return childNodes.filter((child): child is AstText => child.type === 'text').flatMap(child => {
			const parts = splitColors(child.data).filter(([,,, isColor]) => isColor);
			if (parts.length === 0) {
				return [];
			}
			const start = child.getAbsoluteIndex();
			return parts.map(([s, from, to]): ColorInformation | false => {
				const color = rgba(s);
				return color.length === 4 && {
					color: {
						red: color[0] / 255,
						green: color[1] / 255,
						blue: color[2] / 255,
						alpha: color[3],
					},
					range: createRange(doc, start + from, start + to),
				};
			}).filter(Boolean) as ColorInformation[];
		});
	});
};

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
