module.exports = {
  root: true,
  env: {
    browser: true, // 浏览器环境中的全局变量
    commonjs: true, // 支持 commonjs 语法
    node: true, // 支持 node
    es6: true // 支持 es6 语法
  },
  extends: [
    'plugin:vue/recommended',
    '@vue/typescript/recommended',
    '@vue/prettier',
    '@vue/prettier/@typescript-eslint'
  ],
  parserOptions: {
    ecmaVersion: '2021'
  },
  rules: {
    'comma-dangle': 'off',
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    indent: 'off',
    // 函数圆括号之前有一个空格，关闭 eslint 规则，交由 prettier 自行处理
    'space-before-function-paren': 0,
    'block-spacing': ['error', 'always'],
    'key-spacing': 'error',
    quotes: ['error', 'single'],
    'vue/array-bracket-spacing': 'error',
    'vue/arrow-spacing': 'error',
    'vue/block-spacing': 'error',
    'vue/brace-style': 'error',
    'vue/camelcase': 'error',
    'vue/comma-dangle': 'off',
    'vue/component-name-in-template-casing': 'error',
    'vue/eqeqeq': 'error',
    'vue/key-spacing': 'error',
    'vue/match-component-file-name': 'error',
    'vue/object-curly-spacing': ['error', 'always'],
    'vue/singleline-html-element-content-newline': 'off',
    'vue/max-attributes-per-line': 'off',
    'vue/multi-word-component-names': 'off',
    'vue/html-self-closing': 'off',
    'keyword-spacing': 'off',
    '@typescript-eslint/keyword-spacing': ['error'],
    '@typescript-eslint/no-unused-vars': ['error'],
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/type-annotation-spacing': [
      'error',
      {
        before: false,
        after: true,
        overrides: { arrow: { before: true, after: true } }
      }
    ],
    'space-infix-ops': 'off',
    '@typescript-eslint/space-infix-ops': ['error', { int32Hint: false }],
    'comma-spacing': 'off',
    '@typescript-eslint/comma-spacing': ['error', { before: false, after: true }],
    'object-curly-spacing': ['error', 'always'],
    '@typescript-eslint/object-curly-spacing': ['error', 'always'],
    semi: 'off',
    '@typescript-eslint/semi': ['error', 'never'],
    'no-undef': 'off',
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    'prettier/prettier': ['error', { endOfLine: 'auto' }]
  }
}
