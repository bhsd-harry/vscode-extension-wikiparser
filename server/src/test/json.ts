import * as assert from 'assert';
import Parser from 'wikilint';
import behaviorSwitch from '../data/behaviorSwitch.json';
import parserFunctions from '../data/parserFunction.json';
import variable from '../data/variable.json';

const {doubleUnderscore, parserFunction} = Parser.getConfig(),
	doubleUnderscores = (doubleUnderscore.slice(0, 2) as string[][]).flat().map(s => s.toLowerCase()),
	magicWords = [Object.keys(parserFunction[0]), parserFunction.slice(1) as string[][]].flat(2)
		.map(s => s.toLowerCase());

describe('JSON data', () => {
	it('behaviorSwitch.json', done => {
		const words = behaviorSwitch.flatMap(({aliases}) => aliases);
		assert.equal(words.length, new Set(words).size, 'Duplicate magic words');
		for (const word of words) {
			assert.ok(doubleUnderscores.includes(word), `Missing: ${word}`);
		}
		done();
	});
	it('parserFunction.json', done => {
		const words = parserFunctions.flatMap(({aliases}) => aliases);
		assert.equal(words.length, new Set(words).size, 'Duplicate magic words');
		for (const word of words) {
			assert.ok(magicWords.includes(word), `Missing: ${word}`);
		}
		done();
	});
	it('variable.json', done => {
		const words = variable.flatMap(({aliases}) => aliases);
		assert.equal(words.length, new Set(words).size, 'Duplicate magic words');
		for (const word of words) {
			assert.ok(magicWords.includes(word), `Missing: ${word}`);
		}
		done();
	});
});
