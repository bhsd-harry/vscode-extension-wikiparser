import {FoldingRangeKind} from 'vscode-languageserver/node';
import {parse, docs} from './tasks';
import type {FoldingRangeParams, FoldingRange} from 'vscode-languageserver/node';
import type {HeadingToken, TableToken, TranscludeToken} from 'wikilint';

export const provideFolding = async ({textDocument: {uri}}: FoldingRangeParams): Promise<FoldingRange[]> => {
	const ranges: FoldingRange[] = [],
		doc = docs.get(uri)!,
		{lineCount} = doc,
		root = await parse(uri),
		levels = new Array<number | undefined>(6),
		tokens = root.querySelectorAll<HeadingToken | TableToken | TranscludeToken>(
			'heading,table,template,magic-word',
		);
	for (const token of tokens) {
		const index = token.getAbsoluteIndex(),
			{line} = doc.positionAt(index),
			lines = String(token).split('\n');
		if (token.type === 'heading') {
			const {level} = token;
			if (levels[level] !== undefined && levels[level] < line - 1) {
				ranges.push({
					startLine: levels[level],
					endLine: line - 1,
					kind: FoldingRangeKind.Region,
				});
			}
			levels[level] = line + lines.length - 1; // 从标题的最后一行开始折叠
		} else if (lines.length > 2) {
			ranges.push({
				startLine: line, // 从表格或模板的第一行开始折叠
				endLine: line + lines.length - 2,
				kind: FoldingRangeKind.Region,
			});
		}
	}
	for (const line of levels) {
		if (line !== undefined && line < lineCount) {
			ranges.push({
				startLine: line,
				endLine: lineCount - 1,
				kind: FoldingRangeKind.Region,
			});
		}
	}
	return ranges;
};
