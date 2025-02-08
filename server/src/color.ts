import {getLSP} from './tasks';
import type {
	ColorInformation,
	DocumentColorParams,
	ColorPresentation,
	ColorPresentationParams,
} from 'vscode-languageserver/node';

export const provideDocumentColor = async (
	{textDocument: {uri}}: DocumentColorParams,
): Promise<ColorInformation[]> => {
	const [doc, lsp] = getLSP(uri);
	return lsp.provideDocumentColors((await import('color-rgba')).default, doc);
};

export const provideColorPresentation = (param: ColorPresentationParams): ColorPresentation[] =>
	getLSP(param.textDocument.uri)[1].provideColorPresentations(param);
