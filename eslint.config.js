'use strict';

const js = require('@eslint/js');
const tseslint = require('typescript-eslint');

module.exports = tseslint.config(
    { ignores: ['dist/**', 'node_modules/**', 'coverage/**', '.tmp/**', '.remember/**'] },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ['src/**/*.ts', 'src/**/*.cts'],
        rules: {
            '@typescript-eslint/no-namespace': 'off'
        }
    },
    {
        files: ['test/**/*.js', 'scripts/**/*.js', 'eslint.config.js'],
        languageOptions: {
            sourceType: 'commonjs',
            globals: {
                require: 'readonly',
                module: 'writable',
                __dirname: 'readonly',
                process: 'readonly',
                console: 'readonly',
                setTimeout: 'readonly',
                queueMicrotask: 'readonly',
                describe: 'readonly',
                it: 'readonly',
                before: 'readonly',
                beforeEach: 'readonly',
                after: 'readonly',
                afterEach: 'readonly'
            }
        },
        rules: {
            '@typescript-eslint/no-require-imports': 'off'
        }
    },
    {
        files: ['test/**/*.ts', 'test/**/*.cts', 'test/**/*.mts'],
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': 'off',
            '@typescript-eslint/no-require-imports': 'off'
        }
    }
);
