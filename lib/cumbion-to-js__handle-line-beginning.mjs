import { helpers } from './cumbion-to-js__helpers.mjs';
import { isVariable } from './cumbion-to-js__is-variable.mjs';
import { reservedWords } from './cumbion-to-js__reserved-words.mjs';

/**
 * Handle the first word in a line.
 *
 * @param {number} _wordIndex -
 * @param {array} _wordsCurrentLine -
 * @param {array} _wordsNextLine -
 * @param {object} _scopeStatus -
 * @return {string} accumulator -
 */
const handleLineBeginning = (_wordIndex, _wordsCurrentLine, _wordsNextLine, _scopeStatus) => {
  let currentWord = _wordsCurrentLine[_wordIndex];
  const prevWord = _wordsCurrentLine[_wordIndex - 1];
  const nextWord = _wordsCurrentLine[_wordIndex + 1];

  let jsLineAccumulator = '';

  // Followed by tomo/toma is declaring a function
  if (
    nextWord &&
    isVariable(currentWord, prevWord, _scopeStatus) &&
    reservedWords.FUNCTIONPARAM.includes(nextWord.toLowerCase())
  ) {
    _scopeStatus.settingFunctionParams++;
    jsLineAccumulator += ' =';
    _scopeStatus.declaredFunctions.push(helpers.slugify(currentWord));
    jsLineAccumulator += ' function(';
    jsLineAccumulator += helpers.slugify(_wordsCurrentLine[_wordIndex + 2]);
    _scopeStatus.declaredVariables.push(helpers.slugify(_wordsCurrentLine[_wordIndex + 2]));
    _wordsCurrentLine[_wordIndex + 2] = ''; // to avoid printing it as a variable name later.

    // check if next line is defining same function.
    if (
      _wordsNextLine[0] === currentWord &&
      reservedWords.FUNCTIONPARAM.includes(_wordsNextLine[1].toLowerCase())
    ) {
      jsLineAccumulator += ', ' + helpers.slugify(_wordsNextLine[2]);
      _scopeStatus.declaredVariables.push(helpers.slugify(_wordsNextLine[2]));
      _scopeStatus.line.ignoreNextLine = true;
    }
  }

  // While
  if (currentWord.toLowerCase() === 'mientras') {
    _scopeStatus.line.inComparison = true;
    jsLineAccumulator += 'while(';
  }
  /* if (_currentWord.toLowerCase() === 'hasta' && nextWord === 'que') {
    scopeStatus.line.inComparison = true;
    jsLineAccumulator += 'while(';
  }*/

  // If
  if (currentWord.toLowerCase() === 'si') {
    _scopeStatus.line.inComparison = true;
    jsLineAccumulator += 'if (';
  }
  // output
  if (reservedWords.OUTPUT.includes(currentWord.toLowerCase())) {
    _scopeStatus.line.settingFunctionProps++;
    jsLineAccumulator += 'console.log(';
  }

  if (reservedWords.CLOSECURLYBRACKET.includes(currentWord.toLowerCase())) {
    jsLineAccumulator += '}';
    _scopeStatus.tabulated--;
    _wordsCurrentLine[_wordIndex] = '';
  }

  return jsLineAccumulator;
};

export { handleLineBeginning };
