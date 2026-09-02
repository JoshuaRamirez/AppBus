#!/usr/bin/env node
'use strict';

// Packs the package, installs the tarball into a throwaway consumer project,
// and loads it through both the CommonJS and ESM entry points. This exercises
// the published artifact (exports map, file list, entry sources) rather than
// the source tree, so it catches packaging mistakes that unit tests cannot.

const { execSync } = require('node:child_process');
const { mkdtempSync, writeFileSync, readdirSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');

const root = join(__dirname, '..');
const pkg = require(join(root, 'package.json'));
const work = mkdtempSync(join(tmpdir(), 'app-bus-smoke-'));

function run(cmd, cwd) {
    return execSync(cmd, { cwd, stdio: ['ignore', 'pipe', 'inherit'], shell: true }).toString().trim();
}

try {
    run(`npm pack --silent --pack-destination "${work}"`, root);
    const tarball = readdirSync(work).find(name => name.endsWith('.tgz'));
    if (!tarball) {
        throw new Error('npm pack produced no tarball');
    }

    const consumer = join(work, 'consumer');
    run(`mkdir "${consumer}"`, work);
    writeFileSync(join(consumer, 'package.json'), JSON.stringify({ name: 'consumer', private: true }));
    run(`npm install --silent --no-audit --no-fund "${join(work, tarball)}"`, consumer);

    const cjs = `
        const F = require('${pkg.name}');
        const bus = F.new();
        const got = [];
        bus.subscribe('greet', p => got.push(p));
        bus.publish('greet').with('cjs').now();
        if (got[0] !== 'cjs') throw new Error('CommonJS entry did not deliver');
        console.log('cjs ok');
    `;
    const esm = `
        import F from '${pkg.name}';
        const bus = F.new();
        const got = [];
        bus.subscribe('greet', p => got.push(p));
        bus.publish('greet').with('esm').now();
        if (got[0] !== 'esm') throw new Error('ESM entry did not deliver');
        console.log('esm ok');
    `;
    writeFileSync(join(consumer, 'smoke.cjs'), cjs);
    writeFileSync(join(consumer, 'smoke.mjs'), esm);

    console.log(run(`"${process.execPath}" smoke.cjs`, consumer));
    console.log(run(`"${process.execPath}" smoke.mjs`, consumer));
    console.log(`smoke test passed for ${tarball}`);
} finally {
    rmSync(work, { recursive: true, force: true });
}
