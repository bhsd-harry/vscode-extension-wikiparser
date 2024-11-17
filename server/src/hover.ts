import {docs, parse} from './tasks';
import {elementFromWord, createNodeRange} from './util';
import behaviorSwitches from './data/behaviorSwitch.json';
import variable from './data/variable.json';
import parserFunctions from './data/parserFunction.json';
import type {TextDocumentPositionParams, Hover} from 'vscode-languageserver/node';
import type {DoubleUnderscoreToken} from 'wikilint';

declare interface Parameter {
	label: string;
	const?: boolean;
	rest?: boolean;
}
export interface Info {
	aliases: string[];
	description: string;
	signatures?: Parameter[][];
}

const variables: Info[] = [...variable, ...parserFunctions];

export const getInfo = (name: string | undefined): Info | undefined => variables.find(
	({aliases}) => aliases.some(alias => alias.replace(/^#/u, '') === name),
);

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
		info = getInfo(token.parentNode!.name);
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
