import {docs, parse} from './tasks';
import {elementFromWord, createNodeRange} from './util';
import behaviorSwitches from './data/behaviorSwitch.json';
import variable from './data/variable.json';
import type {TextDocumentPositionParams, Hover} from 'vscode-languageserver/node';
import type {DoubleUnderscoreToken} from 'wikilint';

declare interface Parameter {
	label: string;
	const?: boolean;
}
declare interface Info {
	aliases: string[];
	description: string;
	signatures?: Parameter[][];
}

export const provideHover = async (
	{textDocument: {uri}, position}: TextDocumentPositionParams,
): Promise<Hover | null> => {
	const doc = docs.get(uri)!,
		token = elementFromWord(doc, await parse(uri), position);
	let info: Info | undefined,
		f: string | undefined;
	if (token.type === 'double-underscore') {
		info = behaviorSwitches.find(
			({aliases}) => aliases.includes((token as DoubleUnderscoreToken).innerText.toLowerCase()),
		);
	} else if (token.type === 'magic-word-name') {
		info = variable.find(({aliases}) => aliases.includes(token.parentNode!.name!));
		f = token.text().trim();
	}
	return info
		? {
			contents: {
				kind: 'markdown',
				value: (
					info.signatures
						? `${
							info.signatures.map(
								params => `- **{{ ${f}${params.length === 0 ? '**' : ':** '}${
									params.map(({label, const: c}) => c ? label : `*${label}*`).join(' **|** ')
								} **}}**`,
							).join('\n')
						}\n\n`
						: ''
				)
				+ info.description,
			},
			range: createNodeRange(doc, token),
		}
		: null;
};
