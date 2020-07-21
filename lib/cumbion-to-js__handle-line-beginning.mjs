import { helpers } from './cumbion-to-js__helpers.mjs';
import { isVariable } from './cumbion-to-js__is-variable.mjs';
import { reservedWords } from './cumbion-to-js__reserved-words.mjs';

/**
 * Handle the first word in a line.
 *
 * @param {number} _wordIndex -
 * @param {array} _wordsCurrentLine -
 * @param {array} _wordsNextLine -
 * @param {object} _status -
 * @return {string} accumulator -
 */
const handleLineBeginning = (_wordIndex, _wordsCurrentLine, _wordsNextLine, _status) => {
  let currentWord = _wordsCurrentLine[_wordIndex];
  const prevWord = _wordsCurrentLine[_wordIndex - 1];
  const nextWord = _wordsCurrentLine[_wordIndex + 1];

  // Followed by tomo/toma is declaring a function
  if (
    nextWord &&
    isVariable(_wordIndex, _wordsCurrentLine, _status) &&
    reservedWords.FUNCTIONPARAM.includes(nextWord.toLowerCase())
  ) {
    _status.settingFunctionParams++;
    _status.declaredFunctions.push(helpers.slugify(currentWord));
    helpers.addToLine(_status, '= function(' + helpers.slugify(_wordsCurrentLine[_wordIndex + 2]), false);

    _status.declaredVariables.push(helpers.slugify(_wordsCurrentLine[_wordIndex + 2]));
    _wordsCurrentLine[_wordIndex + 2] = ''; // to avoid printing it as a variable name later.

    // check if next line is defining same function.
    if (
      _wordsNextLine[0] === currentWord &&
      reservedWords.FUNCTIONPARAM.includes(_wordsNextLine[1].toLowerCase())
    ) {
      helpers.addToPreviousWord(_status, ', ' + helpers.slugify(_wordsNextLine[2]), false);
      _status.declaredVariables.push(helpers.slugify(_wordsNextLine[2]));
      _status.line.ignoreNextLine = true;
    }
  }

  // While
  if (currentWord.toLowerCase() === 'mientras') {
    _status.line.inComparison = true;
    helpers.newLine(_status);
    helpers.addToLine(_status, 'while(', false);
  }

  // If
  if (currentWord.toLowerCase() === 'si') {
    _status.line.inComparison = true;
    helpers.newLine(_status);
    helpers.addToLine(_status, 'if (', false);
  }
  // output
  if (reservedWords.OUTPUT.includes(currentWord.toLowerCase())) {
    _status.line.printing++;
    helpers.newLine(_status);
    helpers.addToLine(_status, 'console.log(', false);
  }

  if (reservedWords.CLOSECURLYBRACKET.includes(currentWord.toLowerCase())) {
    _status.tabPos--;
    helpers.newLine(_status);
    helpers.addToLine(_status, '}', false);
    helpers.newLine(_status);
    _wordsCurrentLine[_wordIndex] = '';
  }
};

export { handleLineBeginning };
