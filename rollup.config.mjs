import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
import externals from 'rollup-plugin-node-externals';
import terser from '@rollup/plugin-terser';
import image from '@rollup/plugin-image';
import json from '@rollup/plugin-json';

/** @type {import('rollup').RollupOptions} */
const config = [
    {
        input: 'cli/src/index.ts',
        output: {
            file: 'cli/dist/index.mjs',
            format: 'es',
        },
        plugins: [typescript(), json()],
    },
    {
        input: 'lib/index.ts',
        output: {
            file: 'dist/index.min.js',
            format: 'es',
        },
        plugins: [externals(), typescript(), terser(), image()],
        external: [/^@motion-canvas\/core/, /^@motion-canvas\/2d/],
    },
    {
        input: 'lib/index.ts',
        output: {
            file: 'dist/index.js',
            format: 'es',
        },
        plugins: [externals(), typescript(), image()],
        external: [/^@motion-canvas\/core/, /^@motion-canvas\/2d/],
    },
    {
        input: 'lib/index.ts',
        output: {
            file: 'dist/index.d.ts',
            format: 'es',
        },
        plugins: [dts(), image()],
    },
];

export default config;
