import {docs, parse, getText} from './tasks';
import behaviorSwitches from './data/behaviorSwitch.json';
import variable from './data/variable.json';
import parserFunctions from './data/parserFunction.json';
import type {TextDocumentPositionParams, Hover, Position, Range as TextRange} from 'vscode-languageserver/node';
import type {TextDocument} from 'vscode-languageserver-textdocument';
import type {Token, DoubleUnderscoreToken} from 'wikilint';

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

const createNodeRange = (token: Token): TextRange => {
	const {top, left, height, width} = token.getBoundingClientRect();
	return {
		start: {line: top, character: left},
		end: {line: top + height - 1, character: (height === 1 ? left : 0) + width},
	};
};

const elementFromWord = (doc: TextDocument, root: Token, pos: Position): Token => {
	const {line, character} = pos;
	let offset = root.indexFromPos(line, character + Number(/^\w/u.test(getText(doc, line, character, line + 1, 0))))!,
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

export const getInfo = (name: string | undefined): Info | undefined => variables.find(
	({aliases}) => aliases.some(alias => alias.replace(/^#/u, '') === name),
);

export const provideHover = async (
	{textDocument: {uri}, position}: TextDocumentPositionParams,
): Promise<Hover | null> => {
	const root = await parse(uri),
		token = elementFromWord(docs.get(uri)!, root, position);
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
			range: createNodeRange(token),
		}
		: null;
};
