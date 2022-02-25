module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true
  },
  extends: [
    'plugin:vue/recommended',
    'eslint:recommended',
    '@vue/standard',
    '@vue/typescript'
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: '2021',
    sourceType: 'module'
  },
  plugins: [
    'vue',
    '@typescript-eslint'
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'indent': 'off',
    '@typescript-eslint/indent': ['error', 2],
    'space-before-function-paren': [2, 'never'], // 不允许括号前面有空格
    'block-spacing': ['error', 'always'],
    'key-spacing': 'error',
    'quotes': ['error', 'single'],
    'vue/array-bracket-spacing': 'error',
    'vue/arrow-spacing': 'error',
    'vue/block-spacing': 'error',
    'vue/brace-style': 'error',
    'vue/camelcase': 'error',
    'vue/comma-dangle': 'error',
    'vue/component-name-in-template-casing': 'error',
    'vue/eqeqeq': 'error',
    'vue/key-spacing': 'error',
    'vue/match-component-file-name': 'error',
    'vue/object-curly-spacing': 'error',
    'vue/singleline-html-element-content-newline': 'off',
    'vue/max-attributes-per-line': 'off',
    'keyword-spacing': 'off',
    '@typescript-eslint/keyword-spacing': ['error'],
    '@typescript-eslint/no-unused-vars': ['error'],
    '@typescript-eslint/type-annotation-spacing': ['error', { before: false, after: true }],
    'space-infix-ops': 'off',
    '@typescript-eslint/space-infix-ops': ['error', { 'int32Hint': false }],
    'comma-spacing': 'off',
    '@typescript-eslint/comma-spacing': ['error', { 'before': false, 'after': true }],
    'object-curly-spacing': 'off',
    '@typescript-eslint/object-curly-spacing': ['error', 'always'],
    'semi': 'off',
    '@typescript-eslint/semi': ['error', 'never']
  }
}
