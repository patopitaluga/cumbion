module.exports = {
  'extends': 'google',
  'rules': {
    'arrow-parens': ['error', 'always'],
    'block-spacing': ['error', 'always'],
    'brace-style': 0, /* some unimportant lines are better in a single line as a small unit. */
    'curly': 0,
    'indent': ['error', 2],
    'linebreak-style': 0,
    'max-len': [0, 400, 4, { 'ignoreUrls': true }], /* svgs are large and that's ok */
    'new-cap': 0,
    'no-invalid-this': 0,
    'no-multi-spaces': 0,
    'no-useless-escape': 'error',
    'no-var': 0,
    'object-curly-spacing': ['error', 'always'],
    'spaced-comment': ['error', 'always', { 'markers': ['='] }],
    'vue/html-self-closing': 0, /* self closing tags might cause problems with some libraries */
  },
  'parserOptions': {
    'ecmaVersion': 9,
    'sourceType': 'module',
  },
  'env': {
    'es6': true,
  },
};
