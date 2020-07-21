import { helpers } from './cumbion-to-js__helpers.mjs';
import { handleLineBeginning } from './cumbion-to-js__handle-line-beginning.mjs';
import { handleNumbers } from './cumbion-to-js__handle-numbers.mjs';
import { isReserved } from './cumbion-to-js__reserved-words.mjs';
import { isVariable } from './cumbion-to-js__is-variable.mjs';
import { reservedWords } from './cumbion-to-js__reserved-words.mjs';

const findKeywords = (_wordIndex, _wordsCurrentLine, _wordsNextLine, _status) => {
  if (_status.line.writingStringLiteral) return '';

  const currentWord = _wordsCurrentLine[_wordIndex];
  const thisWordSlug = helpers.slugify(currentWord);
  const prevWord = _wordsCurrentLine[_wordIndex - 1];
  const nextWord = _wordsCurrentLine[_wordIndex + 1];
  const secondNextWord = _wordsCurrentLine[_wordIndex + 2];

  // Defining an array or getting the array length
  if (currentWord === 'lxs') {
    if (_wordIndex === 0 && !_status.declaredArrays.includes(helpers.slugify(nextWord))) {
      helpers.addToLine(_status, 'let ' + helpers.slugify(nextWord) + ' = []\n');
      _status.declaredArrays.push(helpers.slugify(nextWord));
    }
    _status.line.settingVar = true;
    if (
      prevWord !== 'de' &&
      !_status.line.inComparison &&
      !_status.line.settingFunctionProps &&
      !_status.line.printing
    ) {
      _status.line.willBePushedToArray++;
    }
  }

  if (thisWordSlug === 'escucha') {
    if (nextWord === 'a') {
      //helpers.addToLine(_status, secondNextWord + ' = window.prompt(\'\', \'\');');
    }
  }

  if (currentWord === 'más')   helpers.addToLine(_status, '+', true);
  if (currentWord === 'menos') helpers.addToLine(_status, '-', true);
  if (currentWord === 'por')   helpers.addToLine(_status, '*', true);
  if (currentWord === 'entre') helpers.addToLine(_status, '/', true);

  if (currentWord === '+') helpers.addToLine(_status, '+', true);
  if (currentWord === '-') helpers.addToLine(_status, '-', true);
  if (currentWord === '*') helpers.addToLine(_status, '*', true);
  if (currentWord === '/') helpers.addToLine(_status, '/', true);

  if (currentWord === 'piola')  helpers.addToLine(_status, 'true', true);
  if (currentWord === 'ortiba') helpers.addToLine(_status, 'false', true);

  if (currentWord === 'misterioso') helpers.addToLine(_status, 'undefined', true);
  if (currentWord === 'misteriosa') helpers.addToLine(_status, 'undefined', true);

  // variable name
  if (isVariable(_wordIndex, _wordsCurrentLine, _status)) {
    if (nextWord === 'de') {
      if (secondNextWord === 'lxs')
        _status.line.referringArrayPosition = thisWordSlug;
    } else {
      if (!isReserved(currentWord.toLowerCase())) {
        if (
          (_wordIndex === 0)
        )
          helpers.newLine(_status);

        if (
          (_wordIndex === 0) &&
          !_status.declaredVariables.includes(thisWordSlug)
        ) {
          helpers.addToLine(_status, 'let', true);
          _status.declaredVariables.push(thisWordSlug);
        }

        helpers.addToLine(_status, thisWordSlug, true);
        if (_status.line.referringArrayPosition && _status.declaredArrays.includes(thisWordSlug))
          helpers.addToLine(_status, '[' + _status.line.referringArrayPosition + ']', true);

        if (_status.declaredFunctions.includes(thisWordSlug)) {
          _status.line.settingFunctionProps++;
          helpers.addToLine(_status, '(', false);
        }

        if (prevWord === 'lxs') {
          if (
            _status.line.willBePushedToArray > 0 &&
            _status.line.settingFunctionProps === 0 &&
            _status.line.printing === 0 &&
            !_status.line.inComparison
          )
            helpers.addToLine(_status, '.push(', false);

          if (_status.line.inComparison && !_status.line.referringArrayPosition) {
            helpers.addToLine(_status, '.length', true);
          }
          _status.line.referringArrayPosition = '';
        }
      }
    }

    if (nextWord && reservedWords.ISZERO.includes(nextWord.toLowerCase())) {
      helpers.addToLine(_status, '= 0', false);
    }

    // Followed by es is declaring a string / number
    if (
      nextWord &&
      reservedWords.EQUAL.includes(nextWord.toLowerCase()) &&
      secondNextWord !== 'mayor' &&
      secondNextWord !== 'más' &&
      secondNextWord !== 'menos' &&
      secondNextWord !== 'tan' &&
      prevWord !== 'y'
    ) {
      helpers.addToLine(_status, '=', true);
      _status.line.settingVar = true;
    }
  }

  if (_wordIndex === 0) // if it's the first word of the line
    handleLineBeginning(_wordIndex, _wordsCurrentLine, _wordsNextLine, _status);

  // Every word, no matter if it's the first or not in a line.
  handleNumbers(_wordIndex, _wordsCurrentLine, _status);

  // "y" as , or && according to the position.
  if (_wordIndex > 0 && currentWord.toLowerCase() === 'y') {
    if (
      _status.line.settingFunctionProps > 0 ||
      _status.line.printing > 0
    ) {
      _status.accumulator[_status.accumulator.length -1].parts[_status.accumulator[_status.accumulator.length -1].parts.length - 1].spaceRight = false;
      helpers.addToLine(_status, ',', true);
    } else {
      helpers.addToLine(_status, '&&', true);
    }
  }

  if (currentWord.toLowerCase() === 'poné' || currentWord.toLowerCase() === 'pone') {
    helpers.addToLine(_status, helpers.slugify(_wordsCurrentLine[_wordsCurrentLine.length - 1]) + ' =', true);
    _wordsCurrentLine[_wordsCurrentLine.length - 1] = ''; // to avoid printint it as a variable name later.
  }

  if (currentWord.toLowerCase() === 'mandale' || currentWord.toLowerCase() === '¡mandale') {
    helpers.newLine(_status);
    helpers.addToLine(_status, 'return', true);
  }

  if (currentWord.toLowerCase() === 'wuki') {
    helpers.newLine(_status);
    helpers.addToLine(_status, 'continue', false);
    _status.tabPos--;
  }

  // Comparisons < > >= <= != ==
  if (_status.line.inComparison) {
    if (
      currentWord + ' ' + nextWord + ' ' + secondNextWord === 'es tan alto' ||
      currentWord + ' ' + nextWord + ' ' + secondNextWord === 'es tan alta' ||
      currentWord + ' ' + nextWord + ' ' + secondNextWord === 'es tan grande' ||
      currentWord + ' ' + nextWord + ' ' + secondNextWord === 'es tan grande' ||
      currentWord + ' ' + nextWord + ' ' + secondNextWord === 'sea tan alto' ||
      currentWord + ' ' + nextWord + ' ' + secondNextWord === 'sea tan alta' ||
      currentWord + ' ' + nextWord + ' ' + secondNextWord === 'sea tan grande' ||
      currentWord + ' ' + nextWord + ' ' + secondNextWord === 'sea tan grande' ||
      currentWord + ' ' + nextWord + ' ' + secondNextWord === 'era tan alto' ||
      currentWord + ' ' + nextWord + ' ' + secondNextWord === 'era tan alta'
    )
      helpers.addToLine(_status, '>=', true);
    if (currentWord + ' ' + nextWord + ' ' + secondNextWord === 'sea menor que') {
      helpers.addToLine(_status, '<', true);
      _wordsCurrentLine[_wordIndex + 1] = '';
      _wordsCurrentLine[_wordIndex + 2] = '';
    }
    if (currentWord + ' ' + nextWord + ' ' + secondNextWord === 'sea mayor que') {
      helpers.addToLine(_status, '>', true);
      _wordsCurrentLine[_wordIndex + 1] = '';
      _wordsCurrentLine[_wordIndex + 2] = '';
    }

    if (currentWord + ' ' + nextWord + ' ' + secondNextWord === 'es mayor que') {
      helpers.addToLine(_status, '>', true);
      _wordsCurrentLine[_wordIndex + 1] = '';
      _wordsCurrentLine[_wordIndex + 2] = '';
    }

    if (
      currentWord + ' ' + nextWord + ' ' + secondNextWord + ' ' + _wordsCurrentLine[_wordIndex + 3] === 'es más grande que' ||
      currentWord + ' ' + nextWord + ' ' + secondNextWord + ' ' + _wordsCurrentLine[_wordIndex + 3] === 'es mas grande que'
    ) {
      helpers.addToLine(_status, '>', true);
      _wordsCurrentLine[_wordIndex + 1] = '';
      _wordsCurrentLine[_wordIndex + 2] = '';
      _wordsCurrentLine[_wordIndex + 3] = '';
    }

    if (
      reservedWords.EQUAL.includes(currentWord.toLowerCase()) &&
      nextWord !== 'tan' &&
      nextWord !== 'menor' &&
      nextWord !== 'mayor' &&
      nextWord !== 'más' &&
      nextWord !== 'menos'
    ) {
      if (_status.line.settingFunctionProps > 0) {
        helpers.addToLine(_status, ')', true);
        _status.line.settingFunctionProps--;
      }
      helpers.addToLine(_status, '==', true);
    }
  }

  if (currentWord + ' ' + nextWord === 'no sea') {
    helpers.addToLine(_status, '!=', true);
  }

  // Math operators
  // increment
  if (
    nextWord &&
    currentWord.toLowerCase() === 'sube' ||
    currentWord.toLowerCase() === 'crece'
  ) {
    if (isVariable(_wordIndex + 1, _wordsCurrentLine, _status)) {
      helpers.newLine(_status);
      helpers.addToLine(_status, helpers.slugify(nextWord) + '++', false);
      _wordsCurrentLine[_wordIndex + 1] = ''; // avoid rendering later
    }
    if (secondNextWord && isVariable(_wordIndex + 2, _wordsCurrentLine, _status)) {
      helpers.addToLine(_status, helpers.slugify(nextWord) + '++', false);
      _wordsCurrentLine[_wordIndex + 1] = ''; // avoid rendering later
      _wordsCurrentLine[_wordIndex + 2] = ''; // avoid rendering later
    }
  }
  if (currentWord.toLowerCase() === 'baja') {
    if (isVariable(_wordIndex + 1, _wordsCurrentLine, _status)) {
      helpers.addToLine(_status, helpers.slugify(nextWord) + '--', false);
      helpers.newLine(_status);
      _wordsCurrentLine[_wordIndex + 1] = ''; // avoid rendering later
    }
    if (isVariable(_wordIndex + 2, _wordsCurrentLine, _status)) {
      helpers.addToLine(_status, helpers.slugify(nextWord) + '--', false);
      helpers.newLine(_status);
      _wordsCurrentLine[_wordIndex + 1] = ''; // avoid rendering later
      _wordsCurrentLine[_wordIndex + 2] = ''; // avoid rendering later
    }
  }
}

export { findKeywords };
