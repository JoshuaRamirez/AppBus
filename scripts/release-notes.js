#!/usr/bin/env node
'use strict';

// Prints the README release-notes section for the given version (default:
// package.json version). Exits non-zero when the section is missing so the
// release workflow refuses to publish an undocumented version.

const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const root = join(__dirname, '..');
const version = process.argv[2] || require(join(root, 'package.json')).version;
const readme = readFileSync(join(root, 'README.md'), 'utf8');

const heading = `### ${version}`;
const start = readme.indexOf(`\n${heading}\n`);
if (start === -1) {
    console.error(`README.md has no "${heading}" release-notes section`);
    process.exit(1);
}

const body = readme.slice(start + heading.length + 2);
const end = body.search(/\n#{2,3} /);
const notes = (end === -1 ? body : body.slice(0, end)).trim();

if (!notes) {
    console.error(`README.md "${heading}" section is empty`);
    process.exit(1);
}

process.stdout.write(notes + '\n');
