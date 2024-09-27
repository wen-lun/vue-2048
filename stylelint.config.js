export default {
    root: true,
    plugins: ['stylelint-order'],
    customSyntax: 'postcss-html',
    extends: ['stylelint-config-standard', 'stylelint-config-recess-order'],
    rules: {
        'selector-class-pattern': null,
        'font-family-no-missing-generic-family-keyword': null,
        'at-rule-no-unknown': null,
        'no-descending-specificity': null,
        'function-name-case': null,
        'function-no-unknown': null,
        'value-keyword-case': null,
        'import-notation': null,
    },
    ignoreFiles: ['**/*.js', '**/*.jsx', '**/*.tsx', '**/*.ts'],
    overrides: [
        {
            files: ['*.vue', '**/*.vue', '*.html', '**/*.html'],
            rules: {
                'keyframes-name-pattern': null,
                'selector-pseudo-class-no-unknown': [
                    true,
                    {
                        ignorePseudoClasses: ['deep', 'global'],
                    },
                ],
                'selector-pseudo-element-no-unknown': [
                    true,
                    {
                        ignorePseudoElements: ['v-deep', 'v-global', 'v-slotted'],
                    },
                ],
            },
        },
        {
            files: ['*.scss', '**/*.scss'],
            customSyntax: 'postcss-scss',
        },
    ],
};
