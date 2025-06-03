import * as assert from 'assert';
import {getParams, range} from './util';
import {provideDocumentLinks, getLSP} from '../lsp';
import type {DocumentLink} from 'vscode-languageserver/node';

const wikitext = `
[[ : help : a#a ]]
{{ b }}
{{ #invoke: c | c }}
RFC 1
PMID 1
ISBN 1-2-3-4-5-6-7-8-9-0
[//d d]
News:e
<templatestyles src = f />
<q cite = "HTTPS://G/G">
[[file:a|link=a]]
[[file:a|link=//a]]
{{filepath: h }}
`,
	results: DocumentLink[] = [
		{
			range: range(1, 2, 1, 16),
			target: 'https://mediawiki.org/wiki/Help%3AA#a',
		},
		{
			range: range(2, 2, 2, 5),
			target: 'https://mediawiki.org/wiki/Template%3AB',
		},
		{
			range: range(3, 11, 3, 14),
			target: 'https://mediawiki.org/wiki/Module%3AC',
		},
		{
			range: range(4, 0, 4, 5),
			target: 'https://tools.ietf.org/html/rfc1',
		},
		{
			range: range(5, 0, 5, 6),
			target: 'https://pubmed.ncbi.nlm.nih.gov/1',
		},
		{
			range: range(6, 0, 6, 24),
			target: 'https://mediawiki.org/wiki/Special%3ABookSources%2F1234567890',
		},
		{
			range: range(7, 1, 7, 4),
			target: 'https://d/',
		},
		{
			range: range(8, 0, 8, 6),
			target: 'news:e',
		},
		{
			range: range(9, 22, 9, 23),
			target: 'https://mediawiki.org/wiki/Template%3AF',
		},
		{
			range: range(10, 11, 10, 22),
			target: 'https://g/G',
		},
		{
			range: range(11, 2, 11, 8),
			target: 'https://mediawiki.org/wiki/File%3AA',
		},
		{
			range: range(11, 14, 11, 15),
			target: 'https://mediawiki.org/wiki/A',
		},
		{
			range: range(12, 2, 12, 8),
			target: 'https://mediawiki.org/wiki/File%3AA',
		},
		{
			range: range(12, 14, 12, 17),
			target: 'https://a/',
		},
		{
			range: range(13, 11, 13, 14),
			target: 'https://mediawiki.org/wiki/File%3AH',
		},
	].reverse();

describe('DocumentLink', () => {
	const paths = [
		'https://mediawiki.org/wiki/$1',
		'https://mediawiki.org/wiki/',
		'https://mediawiki.org/wiki',
		'//mediawiki.org/wiki/$1',
	];
	for (const articlePath of paths) {
		it(articlePath, async () => {
			const links = await provideDocumentLinks(getParams(articlePath, wikitext), articlePath);
			assert.strictEqual(getLSP(articlePath)[1].config?.articlePath, articlePath);
			assert.deepStrictEqual(links, results);
		});
	}
});
