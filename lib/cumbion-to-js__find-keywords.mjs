import { helpers } from './cumbion-to-js__helpers.mjs';
import { handleLineBeginning } from './cumbion-to-js__handle-line-beginning.mjs';
import { handleNumbers } from './cumbion-to-js__handle-numbers.mjs';
import { isReserved } from './cumbion-to-js__reserved-words.mjs';
import { isVariable } from './cumbion-to-js__is-variable.mjs';
import { reservedWords } from './cumbion-to-js__reserved-words.mjs';

/**
 * Used in the main cumbionToJs() function.
 *
 * @param {number} _wordIndex -
 * @param {array} _wordsCurrentLine -
 * @param {array} _wordsNextLine -
 * @param {object} _status -
 * @return {string}
 */
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
      _status.acc.finishLine(1);
      _status.acc.addToLine('let ' + helpers.slugify(nextWord) + ' = []', false);
      _status.acc.finishLine(2);
      _status.declaredArrays.push(helpers.slugify(nextWord));
    }
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
      // _status.acc.addToLine(secondNextWord + ' = window.prompt(\'\', \'\');');
    }
  }

  if (currentWord === 'más')   _status.acc.addToLine('+', true);
  if (currentWord === 'menos') _status.acc.addToLine('-', true);
  if (currentWord === 'por')   _status.acc.addToLine('*', true);
  if (currentWord === 'entre') _status.acc.addToLine('/', true);

  if (currentWord === '+') _status.acc.addToLine('+', true);
  if (currentWord === '-') _status.acc.addToLine('-', true);
  if (currentWord === '*') _status.acc.addToLine('*', true);
  if (currentWord === '/') _status.acc.addToLine('/', true);

  if (currentWord === 'piola')  _status.acc.addToLine('true', true);
  if (currentWord === 'ortiba') _status.acc.addToLine('false', true);

  if (currentWord === 'misterioso') _status.acc.addToLine('undefined', true);
  if (currentWord === 'misteriosa') _status.acc.addToLine('undefined', true);

  // variable name
  if (isVariable(_wordIndex, _wordsCurrentLine, _status)) {
    if (nextWord === 'de') {
      if (secondNextWord === 'lxs')
        _status.line.referringArrayPosition = thisWordSlug;
    } else {
      if (!isReserved(currentWord.toLowerCase())) {
        if (_wordIndex === 0)
          _status.acc.finishLine(3);

        if (
          (_wordIndex === 0) &&
          !_status.declaredVariables.includes(thisWordSlug)
        ) {
          _status.acc.addToLine('let', true);
          _status.declaredVariables.push(thisWordSlug);
        }

        _status.acc.addToLine(thisWordSlug, true); // Here it renders the variable name.
        if (_status.line.referringArrayPosition && _status.declaredArrays.includes(thisWordSlug)) {
          _status.acc.setPreviousPart('spaceRight', false);
          _status.acc.addToLine('[' + _status.line.referringArrayPosition + ']', true);
        }

        if (_status.declaredFunctions.includes(thisWordSlug)) {
          _status.line.settingFunctionProps++;
          _status.acc.addToLine('(', false);
        }

        if (prevWord === 'lxs') {
          if (
            _status.line.willBePushedToArray > 0 &&
            _status.line.settingFunctionProps === 0 &&
            _status.line.printing === 0 &&
            !_status.line.inComparison
          ) {
            _status.line.rightSideOfDeclaration = true; // to render numbers inside .push()
            _status.acc.setPreviousPart('spaceRight', false);
            _status.acc.addToLine('.push(', false);
          }

          if (_status.line.inComparison && !_status.line.referringArrayPosition) {
            _status.acc.setPreviousPart('spaceRight', false);
            _status.acc.addToLine('.length', true);
          }
          _status.line.referringArrayPosition = '';
        }
      }
    }

    if (nextWord && reservedWords.ISZERO.includes(nextWord.toLowerCase())) {
      _status.acc.addToLine('= 0', false);
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
      _status.acc.addToLine('=', true);
      _status.line.rightSideOfDeclaration = true;
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
      _status.acc.setPreviousPart('spaceRight', false);
      _status.acc.addToLine(',', true);
    } else {
      _status.acc.addToLine('&&', true);
    }
  }

  if (currentWord.toLowerCase() === 'poné' || currentWord.toLowerCase() === 'pone') {
    _status.acc.addToLine(helpers.slugify(_wordsCurrentLine[_wordsCurrentLine.length - 1]) + ' =', true);
    _wordsCurrentLine[_wordsCurrentLine.length - 1] = ''; // to avoid printint it as a variable name later.
  }

  if (currentWord.toLowerCase() === 'mandale' || currentWord.toLowerCase() === '¡mandale') {
    _status.acc.finishLine(4);
    _status.acc.addToLine('return', true);
  }

  if (currentWord.toLowerCase() === 'wuki') {
    _status.acc.finishLine(5);
    _status.acc.addToLine('continue', false);
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
      _status.acc.addToLine('>=', true);
    if (currentWord + ' ' + nextWord + ' ' + secondNextWord === 'sea menor que') {
      _status.acc.addToLine('<', true);
      _wordsCurrentLine[_wordIndex + 1] = '';
      _wordsCurrentLine[_wordIndex + 2] = '';
    }
    if (currentWord + ' ' + nextWord + ' ' + secondNextWord === 'sea mayor que') {
      _status.acc.addToLine('>', true);
      _wordsCurrentLine[_wordIndex + 1] = '';
      _wordsCurrentLine[_wordIndex + 2] = '';
    }

    if (currentWord + ' ' + nextWord + ' ' + secondNextWord === 'es mayor que') {
      _status.acc.addToLine('>', true);
      _wordsCurrentLine[_wordIndex + 1] = '';
      _wordsCurrentLine[_wordIndex + 2] = '';
    }

    if (
      currentWord + ' ' + nextWord + ' ' + secondNextWord + ' ' + _wordsCurrentLine[_wordIndex + 3] === 'es más grande que' ||
      currentWord + ' ' + nextWord + ' ' + secondNextWord + ' ' + _wordsCurrentLine[_wordIndex + 3] === 'es mas grande que'
    ) {
      _status.acc.addToLine('>', true);
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
        _status.acc.addToLine(')', true);
        _status.line.settingFunctionProps--;
      }
      _status.acc.addToLine('==', true);
    }
  }

  if (currentWord + ' ' + nextWord === 'no sea') {
    _status.acc.addToLine('!=', true);
  }

  // Math operators
  // increment
  if (
    nextWord &&
    currentWord.toLowerCase() === 'sube' ||
    currentWord.toLowerCase() === 'crece'
  ) {
    if (isVariable(_wordIndex + 1, _wordsCurrentLine, _status)) {
      _status.acc.finishLine(6);
      _status.acc.addToLine(helpers.slugify(nextWord) + '++', false);
      _wordsCurrentLine[_wordIndex + 1] = ''; // avoid rendering later
    }
    if (secondNextWord && isVariable(_wordIndex + 2, _wordsCurrentLine, _status)) {
      _status.acc.addToLine(helpers.slugify(nextWord) + '++', false);
      _wordsCurrentLine[_wordIndex + 1] = ''; // avoid rendering later
      _wordsCurrentLine[_wordIndex + 2] = ''; // avoid rendering later
    }
  }
  if (currentWord.toLowerCase() === 'baja') {
    if (isVariable(_wordIndex + 1, _wordsCurrentLine, _status)) {
      _status.acc.addToLine(helpers.slugify(nextWord) + '--', false);
      _status.acc.finishLine(7);
      _wordsCurrentLine[_wordIndex + 1] = ''; // avoid rendering later
    }
    if (isVariable(_wordIndex + 2, _wordsCurrentLine, _status)) {
      _status.acc.addToLine(helpers.slugify(nextWord) + '--', false);
      _status.acc.finishLine(8);
      _wordsCurrentLine[_wordIndex + 1] = ''; // avoid rendering later
      _wordsCurrentLine[_wordIndex + 2] = ''; // avoid rendering later
    }
  }
};

export { findKeywords };
