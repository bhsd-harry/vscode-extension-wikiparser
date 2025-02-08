import * as assert from 'assert';
import Parser from 'wikilint';
import behaviorSwitch from '../data/behaviorSwitch.json';
import parserFunctions from '../data/parserFunction.json';
import variable from '../data/variable.json';

const {doubleUnderscore, parserFunction} = Parser.getConfig(),
	doubleUnderscores = (doubleUnderscore.slice(0, 2) as string[][]).flat().map(s => s.toLowerCase()),
	magicWords = [parserFunction.slice(0, 2).map(Object.keys), parserFunction.slice(2) as string[][]].flat(2)
		.map(s => s.toLowerCase());

describe('JSON data', () => {
	it('behaviorSwitch.json', () => {
		const words = behaviorSwitch.flatMap(({aliases}) => aliases);
		assert.equal(words.length, new Set(words).size, 'Duplicate magic words');
		for (const word of words) {
			assert.ok(doubleUnderscores.includes(word), `Missing: ${word}`);
		}
	});
	it('parserFunction.json', () => {
		const words = parserFunctions.flatMap(({aliases}) => aliases);
		assert.equal(words.length, new Set(words).size, 'Duplicate magic words');
		for (const word of words) {
			assert.ok(magicWords.includes(word), `Missing: ${word}`);
		}
	});
	it('variable.json', () => {
		const words = variable.flatMap(({aliases}) => aliases);
		assert.equal(words.length, new Set(words).size, 'Duplicate magic words');
		for (const word of words) {
			assert.ok(magicWords.includes(word), `Missing: ${word}`);
		}
	});
});
