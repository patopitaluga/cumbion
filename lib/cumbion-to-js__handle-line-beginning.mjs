import { helpers } from './cumbion-to-js__helpers.mjs';
import { isVariable } from './cumbion-to-js__is-variable.mjs';
import { reservedWords } from './cumbion-to-js__reserved-words.mjs';

/**
 * Handle the first word in a line.
 *
 * @param {array} _wordsCurrentLine -
 * @param {array} _wordsNextLine -
 * @param {object} _status -
 */
const handleLineBeginning = (_wordsCurrentLine, _wordsNextLine, _status) => {
  const currentWord = _wordsCurrentLine[0];
  const nextWord = _wordsCurrentLine[1];

  // Followed by tomo/toma is declaring a function
  if (
    isVariable(0, _wordsCurrentLine, _status) && // is a variable and
    nextWord && reservedWords.FUNCTIONPARAM.includes(nextWord.toLowerCase()) // is followed by 'tomo'/'toma'
  ) {
    if (_status.getPreviousElement().definingFunction === helpers.slugify(currentWord)) {
      _status.getPreviousElement().parts.pop();
      _status.getPreviousElement().full = false;
      _status.tabLevel--;
      _status.addToModel(', ' + helpers.slugify(_wordsCurrentLine[2]), false, { definingFunction: helpers.slugify(currentWord), });
    } else {
      _status.addToModel('let ' + helpers.slugify(currentWord) + ' = function(' + helpers.slugify(_wordsCurrentLine[2]), false, { definingFunction: helpers.slugify(currentWord), });
      _status.declaredFunctions.push(helpers.slugify(currentWord));
      _status.declaredVariables.push(helpers.slugify(currentWord));
    }
    _status.declaredVariables.push(helpers.slugify(_wordsCurrentLine[2]));
    _status.settingFunctionParams++;
  }

  // While
  if (currentWord.toLowerCase() === 'mientras') {
    _status.line.inComparison = true;
    _status.finishLine();
    _status.addToModel('while(', false);
  }

  // If
  if (currentWord.toLowerCase() === 'si') {
    _status.line.inComparison = true;
    _status.finishLine();
    _status.addToModel('if (', false);
  }
  // output
  if (reservedWords.OUTPUT.includes(currentWord.toLowerCase())) {
    _status.line.printing++;
    _status.finishLine();
    _status.addToModel('console.log(', false);
  }

  // para! / ¡para! / pará! / ¡pará!
  if (reservedWords.CLOSECURLYBRACKET.includes(currentWord.toLowerCase())) {
    _status.tabLevel--;
    _status.finishLine();
    _status.addToModel('}', false);
    _status.finishLine();
    _wordsCurrentLine[0] = '';
  }
};

export { handleLineBeginning };
