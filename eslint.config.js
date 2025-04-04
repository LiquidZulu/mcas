module.exports = [
    {
        ignores: ['lib', 'node_modules', 'dist', 'cli/assets/*'],
        env: {
            browser: true,
            es2021: true,
        },
        ignorePatterns: [
            '**/*.js',
            '**/*.d.ts',
            'packages/template',
            'packages/create/template-*',
        ],
        extends: [
            'eslint:recommended',
            'plugin:@typescript-eslint/recommended',
        ],
        parser: '@typescript-eslint/parser',
        parserOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
        },
        plugins: ['@typescript-eslint', 'eslint-plugin-tsdoc'],
        rules: {
            'require-yield': 'off',
            '@typescript-eslint/explicit-member-accessibility': 'error',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/ban-ts-comment': 'off',
            '@typescript-eslint/no-non-null-assertion': 'off',
            '@typescript-eslint/no-namespace': 'off',
            'tsdoc/syntax': 'warn',
        },
    },
];
