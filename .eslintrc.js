module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    node: true,
    'jest/globals': true,
  },
  extends: ['airbnb-base'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
  },
  plugins: ['@typescript-eslint', 'jest'],
  rules: {
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    'object-curly-newline': 'off',
    'implicit-arrow-linebreak': 'off',
    'operator-linebreak': 'off',
    'import/prefer-default-export': 'off',
    'class-methods-use-this': 'off',
    'no-useless-constructor': 'off',
    '@typescript-eslint/no-useless-constructor': 'warn',
    'no-empty-function': 'off',
    '@typescript-eslint/no-empty-function': 'error',
    'lines-between-class-members': 'off',
    indent: 'off',
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
};
