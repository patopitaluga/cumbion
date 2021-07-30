const newLine = JSON.stringify({
  ignoreNextLine: false,
  inComparison: false,
  printing: 0,
  referringArrayPosition: '',
  rightSideOfDeclaration: false,
  parts: [],
  settingFunctionProps: 0, // should be scalar because a function can be an argument of another function or console.log
  // should be scalar because an array might be an element inside an array
  // can't be the same as settingFunctionProps because will check this to render the actually ".push("
  willBePushedToArray: 0,
  writingStringLiteral: false,
});

export { newLine };
