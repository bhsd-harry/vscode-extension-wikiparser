import * as assert from 'assert';

declare interface PackageJson {
	engines: {
		node: string;
	};
	dependencies?: Record<string, string>;
	devDependencies?: Record<string, string>;
}

const serverPkg: PackageJson = require('../../package.json'),
	pkg: PackageJson = require('../../../package.json');

describe('package.json', () => {
	it('engines', () => {
		assert.strictEqual(serverPkg.engines.node, pkg.engines.node);
	});

	it('dependencies', () => {
		for (const [k, v] of Object.entries(serverPkg.dependencies!)) {
			assert.strictEqual(
				v,
				pkg.dependencies?.[k] ?? pkg.devDependencies?.[k],
				`Dependency ${k} has different versions in server and root package.json`,
			);
		}
	});
});
