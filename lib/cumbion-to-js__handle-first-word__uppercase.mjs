import { helpers } from './cumbion-to-js__helpers.mjs';

/**
 * Handle the case when the first word in a line is uppercase (it's probably a variable declaration).
 *
 * @param {number} _wordIndex -
 * @param {array} _wordsNextLine -
 * @param {object} _scopeStatus -
 * @return {string} _wordsNextLine -
 */
const handleFirstWordUppercase = (_wordIndex, _wordsCurrentLine, _wordsNextLine, _scopeStatus) => {
  let codeLine = '';
  let currentWord = _wordsCurrentLine[_wordIndex];
  let nextWord = _wordsCurrentLine[_wordIndex + 1];

  // Followed by tomo is declaring a function
  if (nextWord === 'tomo' || nextWord === 'toma') {
    _scopeStatus.settingFunctionParams++;
    codeLine += ' =';
    _scopeStatus.declaredFunctions.push(helpers.slugify(currentWord));
    codeLine += ' function(';
    codeLine += helpers.slugify(_wordsCurrentLine[_wordIndex + 2]);
    _wordsCurrentLine[_wordIndex + 2] = ''; // to avoid printing it as a variable name later.

    // check if next line is defining same function.
    if (_wordsNextLine[0] === currentWord && _wordsNextLine[1] === 'tomo' || _wordsNextLine[0] === currentWord && _wordsNextLine[1] === 'toma') {
      codeLine += ', ' + helpers.slugify(_wordsNextLine[2]);
      _scopeStatus.line.ignoreNextLine = true;
    }
  }

  // Followed by es is declaring a string / number
  if (nextWord === 'es') {
    codeLine += ' =';
    _scopeStatus.line.settingVar = true;
  }

  // Followed by es is declaring a string / number
  if (nextWord + ' ' + _wordsCurrentLine[_wordIndex + 2] + ' ' + _wordsCurrentLine[_wordIndex + 3] === 'no es nada') {
    codeLine += ' = 0';
  }

  return codeLine;
};

export { handleFirstWordUppercase };
