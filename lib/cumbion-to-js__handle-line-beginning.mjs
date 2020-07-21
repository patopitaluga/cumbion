import { helpers } from './cumbion-to-js__helpers.mjs';
import { isVariable } from './cumbion-to-js__is-variable.mjs';
import { reservedWords } from './cumbion-to-js__reserved-words.mjs';

/**
 * Handle the first word in a line.
 *
 * @param {number} _wordIndex -
 * @param {array} _wordsCurrentLine -
 * @param {array} _wordsNextLine -
 * @param {object} status -
 */
const handleLineBeginning = (_wordIndex, _wordsCurrentLine, _wordsNextLine, status) => {
  const currentWord = _wordsCurrentLine[_wordIndex];
  const nextWord = _wordsCurrentLine[_wordIndex + 1];

  // Followed by tomo/toma is declaring a function
  if (
    nextWord &&
    isVariable(_wordIndex, _wordsCurrentLine, status) &&
    reservedWords.FUNCTIONPARAM.includes(nextWord.toLowerCase())
  ) {
    status.settingFunctionParams++;
    status.declaredFunctions.push(helpers.slugify(currentWord));
    status.acc.addToLine('= function(' + helpers.slugify(_wordsCurrentLine[_wordIndex + 2]), false);

    status.declaredVariables.push(helpers.slugify(_wordsCurrentLine[_wordIndex + 2]));
    _wordsCurrentLine[_wordIndex + 2] = ''; // to avoid printing it as a variable name later.

    // check if next line is defining same function.
    if (
      _wordsNextLine[0] === currentWord &&
      reservedWords.FUNCTIONPARAM.includes(_wordsNextLine[1].toLowerCase())
    ) {
      status.acc.addToLine(', ' + helpers.slugify(_wordsNextLine[2]), false);
      status.declaredVariables.push(helpers.slugify(_wordsNextLine[2]));
      status.line.ignoreNextLine = true;
    }
  }

  // While
  if (currentWord.toLowerCase() === 'mientras') {
    status.line.inComparison = true;
    status.acc.finishLine();
    status.acc.addToLine('while(', false);
  }

  // If
  if (currentWord.toLowerCase() === 'si') {
    status.line.inComparison = true;
    status.acc.finishLine();
    status.acc.addToLine('if (', false);
  }
  // output
  if (reservedWords.OUTPUT.includes(currentWord.toLowerCase())) {
    status.line.printing++;
    status.acc.finishLine();
    status.acc.addToLine('console.log(', false);
  }

  if (reservedWords.CLOSECURLYBRACKET.includes(currentWord.toLowerCase())) {
    status.tabPos--;
    status.acc.finishLine();
    status.acc.addToLine('}', false);
    status.acc.finishLine();
    _wordsCurrentLine[_wordIndex] = '';
  }
};

export { handleLineBeginning };
