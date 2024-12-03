import * as assert from 'assert';
import {getParams} from './util';
import {provideLinks} from '../links';
import type {DocumentLink} from 'vscode-languageserver/node';

const wikitext = `
[[ : help : a ]]
{{ b }}
{{ #invoke: c | c }}
RFC 1
PMID 1
ISBN 1-2-3-4-5-6-7-8-9-0
[//d d]
News:e
<templatestyles src = f />
<q cite = "HTTPS://G/G">
`,
	results: DocumentLink[] = [
		{
			range: {
				start: {line: 1, character: 2},
				end: {line: 1, character: 14},
			},
			target: 'https://mediawiki.org/wiki/Help%3AA',
		},
		{
			range: {
				start: {line: 2, character: 2},
				end: {line: 2, character: 5},
			},
			target: 'https://mediawiki.org/wiki/Template%3AB',
		},
		{
			range: {
				start: {line: 3, character: 11},
				end: {line: 3, character: 14},
			},
			target: 'https://mediawiki.org/wiki/Module%3AC',
		},
		{
			range: {
				start: {line: 4, character: 0},
				end: {line: 4, character: 5},
			},
			target: 'https://tools.ietf.org/html/rfc1',
		},
		{
			range: {
				start: {line: 5, character: 0},
				end: {line: 5, character: 6},
			},
			target: 'https://pubmed.ncbi.nlm.nih.gov/1',
		},
		{
			range: {
				start: {line: 6, character: 0},
				end: {line: 6, character: 24},
			},
			target: 'https://mediawiki.org/wiki/Special%3ABooksources%2F1234567890',
		},
		{
			range: {
				start: {line: 7, character: 1},
				end: {line: 7, character: 4},
			},
			target: 'https://d/',
		},
		{
			range: {
				start: {line: 8, character: 0},
				end: {line: 8, character: 6},
			},
			target: 'news:e',
		},
		{
			range: {
				start: {line: 9, character: 22},
				end: {line: 9, character: 23},
			},
			target: 'https://mediawiki.org/wiki/Template%3AF',
		},
		{
			range: {
				start: {line: 10, character: 11},
				end: {line: 10, character: 22},
			},
			target: 'https://g/G',
		},
	];

describe('documentLinkProvider', () => {
	it('https://mediawiki.org/wiki/$1', async () => {
		assert.deepStrictEqual(
			await provideLinks(getParams(__filename, wikitext).textDocument, 'https://mediawiki.org/wiki/$1'),
			results,
		);
	});
	it('https://mediawiki.org/wiki/', async () => {
		assert.deepStrictEqual(
			await provideLinks(getParams(__filename, wikitext).textDocument, 'https://mediawiki.org/wiki/'),
			results,
		);
	});
	it('https://mediawiki.org/wiki', async () => {
		assert.deepStrictEqual(
			await provideLinks(getParams(__filename, wikitext).textDocument, 'https://mediawiki.org/wiki'),
			results,
		);
	});
});
