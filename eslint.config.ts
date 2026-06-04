import stylistic from'@stylistic/eslint-plugin-js';
import tsParser from'@typescript-eslint/parser';

export default[
    {
        files: [
            'src/**/*.ts',
            'tests/**/*.ts'
        ],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
            },
        },
        plugins: {
            '@stylistic/js': stylistic
        },
        rules: {
            // 'stroustrup' forces else/catch onto their own lines
            '@stylistic/js/brace-style': ['error', 'stroustrup', { 'allowSingleLine': false }],
            
            // Enforce single quotes
            '@stylistic/js/quotes': ['error', 'single'],
            
            // Ensure spaces as per your request
            '@stylistic/js/space-before-blocks': ['error', 'always'],
            '@stylistic/js/keyword-spacing': ['error', {
                'overrides': {
                    'if': { 'after': false },
                    'else': { 'after': true },
                    'catch': { 'after': true },
                    'from': { 'after': true }
                }
            }],
            '@stylistic/js/no-multiple-empty-lines': ['error', { 'max': 1, 'maxEOF': 0, 'maxBOF': 0 }],
        },
    },
];
