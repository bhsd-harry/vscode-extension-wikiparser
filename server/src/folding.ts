import {FoldingRangeKind, Range as TextRange, SymbolKind} from 'vscode-languageserver/node';
import {parse, docs} from './tasks';
import {getText} from './util';
import type {FoldingRangeParams, FoldingRange, DocumentSymbol} from 'vscode-languageserver/node';
import type {Token, HeadingToken} from 'wikilint';

function provide(params: FoldingRangeParams): Promise<FoldingRange[]>;
function provide(params: FoldingRangeParams, symbol: true): Promise<DocumentSymbol[]>;
async function provide(
	{textDocument: {uri}}: FoldingRangeParams,
	symbol?: true,
): Promise<FoldingRange[] | DocumentSymbol[]> {
	const ranges: FoldingRange[] = [],
		symbols: DocumentSymbol[] = [],
		names = new Set<string>(),
		doc = docs.get(uri)!,
		{lineCount} = doc,
		root = await parse(uri),
		levels = new Array<number | undefined>(6),
		sections = new Array<DocumentSymbol | undefined>(6),
		tokens = root.querySelectorAll<Token>(symbol ? 'heading-title' : 'heading-title,table,template,magic-word');
	for (const token of tokens) {
		const {top, left, height, width} = token.getBoundingClientRect();
		if (token.type === 'heading-title') {
			const {level} = token.parentNode as HeadingToken;
			if (symbol) {
				for (let i = level - 1; i < 6; i++) {
					if (sections[i]) {
						const {end} = sections[i]!.range;
						end.line = top - 1;
						end.character = getText(doc, top - 1, 0, top, 0).length - 1;
					}
					sections[i] = undefined;
				}
				const section = token.text().trim() || ' ',
					name = names.has(section)
						? new Array(names.size).fill('').map((_, i) => `${section.trim()}_${i + 2}`)
							.find(s => !names.has(s))!
						: section,
					container = sections.slice(0, level - 1).findLast(Boolean),
					range = TextRange.create(
						top,
						left - level,
						top + height - 1,
						(height === 1 ? left : 0) + width + level,
					),
					info: DocumentSymbol = {
						name,
						kind: SymbolKind.String,
						range,
						selectionRange: structuredClone(range),
					};
				names.add(name);
				sections[level - 1] = info;
				if (container) {
					container.children ??= [];
					container.children.push(info);
				} else {
					symbols.push(info);
				}
			} else {
				for (let i = level - 1; i < 6; i++) {
					const startLine = levels[i];
					if (startLine !== undefined && startLine < top - 1) {
						ranges.push({
							startLine,
							endLine: top - 1,
							kind: FoldingRangeKind.Region,
						});
					}
					levels[i] = undefined;
				}
				levels[level - 1] = top + height - 1; // 从标题的最后一行开始折叠
			}
		} else if (!symbol && height > 2) {
			ranges.push({
				startLine: top, // 从表格或模板的第一行开始折叠
				endLine: top + height - 2,
				kind: FoldingRangeKind.Region,
			});
		}
	}
	if (symbol) {
		for (const section of sections) {
			if (section) {
				const {end} = section.range;
				end.line = lineCount - 1;
				end.character = getText(doc, lineCount - 1, 0, lineCount, 0).length;
			}
		}
	} else {
		for (const line of levels) {
			if (line !== undefined && line < lineCount) {
				ranges.push({
					startLine: line,
					endLine: lineCount - 1,
					kind: FoldingRangeKind.Region,
				});
			}
		}
	}
	return symbol ? symbols : ranges;
}

export const provideFolding = (params: FoldingRangeParams): Promise<FoldingRange[]> => provide(params);
export const provideSymbol = (params: FoldingRangeParams): Promise<DocumentSymbol[]> => provide(params, true);
