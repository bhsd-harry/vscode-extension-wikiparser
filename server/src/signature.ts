import {parseSignature, docs} from './tasks';
import {getText} from './util';
import {getInfo} from './hover';
import type {SignatureHelp, SignatureHelpParams, SignatureInformation} from 'vscode-languageserver/node';
import type {Info} from './hover';

export const provideSignatureHelp = async (
	{textDocument: {uri}, position: {line, character}}: SignatureHelpParams,
): Promise<SignatureHelp | null> => {
	const doc = docs.get(uri)!,
		[after] = /^[^{}<]*/u.exec(getText(doc, line, character, line + 1, 0))!,
		{lastChild} = await parseSignature(uri, `${getText(doc, line, 0, line, character)}${after}}}`),
		{type, name, childNodes, firstChild} = lastChild!;
	if (type !== 'magic-word') {
		return null;
	}
	const info: Info | undefined = getInfo(name);
	if (!info?.signatures) {
		return null;
	}
	const f = firstChild!.text().trim(),
		n = childNodes.length - 1,
		start = lastChild!.getAbsoluteIndex(),
		activeParameter = childNodes.findLastIndex(child => child.getRelativeIndex() <= character - start) - 1,
		signatures = info.signatures
			.filter(params => (params.length >= n || params.at(-1)?.rest) && params.every(({label, const: c}, i) => {
				const p = c && i < n && childNodes[i + 1]?.text().trim();
				return !p || label.startsWith(p) || label.startsWith(p.toLowerCase());
			}))
			.map((params): SignatureInformation => ({
				label: `{{${f}${params.length === 0 ? '' : ':'}${params.map(({label}) => label).join('|')}}}`,
				parameters: params.map(({label, const: c}) => ({
					label,
					...c ? {documentation: 'Predefined parameter'} : undefined,
				})),
				...params.length < n ? {activeParameter: Math.min(activeParameter, params.length - 1)} : undefined,
			}));
	return {signatures, activeParameter};
};
