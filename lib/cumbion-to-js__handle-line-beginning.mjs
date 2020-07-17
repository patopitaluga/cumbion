import { helpers } from './cumbion-to-js__helpers.mjs';
import { isVariable } from './cumbion-to-js__is-variable.mjs';

/**
 * Handle the case when the first word in a line is uppercase (it's probably a variable declaration).
 *
 * @param {number} _wordIndex -
 * @param {array} _wordsNextLine -
 * @param {object} _scopeStatus -
 * @return {string} _wordsNextLine -
 */
const handleLineBeginning = (_wordIndex, _wordsCurrentLine, _wordsNextLine, _scopeStatus) => {
  const currentWord = _wordsCurrentLine[_wordIndex];
  const nextWord = _wordsCurrentLine[_wordIndex + 1];

  let jsLineAccumulator = '';

  // Followed by tomo is declaring a function
  if (isVariable && nextWord === 'tomo' || nextWord === 'toma') {
    _scopeStatus.settingFunctionParams++;
    jsLineAccumulator += ' =';
    _scopeStatus.declaredFunctions.push(helpers.slugify(currentWord));
    jsLineAccumulator += ' function(';
    jsLineAccumulator += helpers.slugify(_wordsCurrentLine[_wordIndex + 2]);
    _scopeStatus.declaredVariables.push(helpers.slugify(_wordsCurrentLine[_wordIndex + 2]));
    _wordsCurrentLine[_wordIndex + 2] = ''; // to avoid printing it as a variable name later.

    // check if next line is defining same function.
    if (_wordsNextLine[0] === currentWord && _wordsNextLine[1] === 'tomo' || _wordsNextLine[0] === currentWord && _wordsNextLine[1] === 'toma') {
      jsLineAccumulator += ', ' + helpers.slugify(_wordsNextLine[2]);
      _scopeStatus.declaredVariables.push(helpers.slugify(_wordsNextLine[2]));
      _scopeStatus.line.ignoreNextLine = true;
    }
  }

  // While
  if (currentWord.toLowerCase() === 'mientras') {
    _scopeStatus.line.openingIfOrWhileLoop = true;
    jsLineAccumulator += 'while(';
  }
  // If
  if (currentWord.toLowerCase() === 'si') {
    _scopeStatus.line.openingIfOrWhileLoop = true;
    jsLineAccumulator += 'if (';
  }
  // output
  if (currentWord.toLowerCase() === 'dice') {
    _scopeStatus.line.settingFunctionProps = true;
    jsLineAccumulator += 'console.log(';
  }

  return jsLineAccumulator;
};

export { handleLineBeginning };
