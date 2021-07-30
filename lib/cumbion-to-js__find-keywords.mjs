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

  if (_wordIndex === 0) // if it's the first word of the line
    handleLineBeginning(_wordsCurrentLine, _wordsNextLine, _status);
  if (_status.settingFunctionParams > 0) return;

  // Defining an array or getting the array length
  if (currentWord === 'lxs') {
    if (_wordIndex === 0 && !_status.declaredArrays.includes(helpers.slugify(nextWord))) {
      _status.finishLine();
      _status.addToModel('let ' + helpers.slugify(nextWord) + ' = []', false);
      _status.finishLine();
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
      // _status.addToModel(secondNextWord + ' = window.prompt(\'\', \'\');');
    }
  }

  if (currentWord === 'más')   _status.addToModel('+', true);
  if (currentWord === 'menos') _status.addToModel('-', true);
  if (currentWord === 'por')   _status.addToModel('*', true);
  if (currentWord === 'entre') _status.addToModel('/', true);

  if (currentWord === '+') _status.addToModel('+', true);
  if (currentWord === '-') _status.addToModel('-', true);
  if (currentWord === '*') _status.addToModel('*', true);
  if (currentWord === '/') _status.addToModel('/', true);

  if (currentWord === 'piola')  _status.addToModel('true', true);
  if (currentWord === 'ortiba') _status.addToModel('false', true);

  if (currentWord === 'misterioso') _status.addToModel('undefined', true);
  if (currentWord === 'misteriosa') _status.addToModel('undefined', true);

  // variable name
  if (isVariable(_wordIndex, _wordsCurrentLine, _status)) {
    if (nextWord === 'de') {
      if (secondNextWord === 'lxs')
        _status.line.referringArrayPosition = thisWordSlug;
    } else {
      if (isReserved(currentWord.toLowerCase())) return;
      if (_wordIndex === 0)
        _status.finishLine();

      if (
        (_wordIndex === 0) &&
        !_status.declaredVariables.includes(thisWordSlug)
      ) {
        _status.addToModel('let', true);
        _status.declaredVariables.push(thisWordSlug);
      }

      if (_status.model[_status.model.length - 1].definingFunction) return;
      _status.addToModel(thisWordSlug, true); // Here it renders the variable name.
      if (_status.line.referringArrayPosition && _status.declaredArrays.includes(thisWordSlug)) {
        _status.setPreviousPart('spaceAfter', false);
        _status.addToModel('[' + _status.line.referringArrayPosition + ']', true);
      }

      if (_status.declaredFunctions.includes(thisWordSlug) &&
        _status.settingFunctionParams === 0
      ) {
        _status.line.settingFunctionProps++;
        _status.addToModel('(', false);
      }

      if (prevWord === 'lxs') {
        if (
          _status.line.willBePushedToArray > 0 &&
          _status.line.settingFunctionProps === 0 &&
          _status.line.printing === 0 &&
          !_status.line.inComparison
        ) {
          _status.line.rightSideOfDeclaration = true; // to render numbers inside .push()
          _status.setPreviousPart('spaceAfter', false);
          _status.addToModel('.push(', false);
        }

        if (_status.line.inComparison && !_status.line.referringArrayPosition) {
          _status.setPreviousPart('spaceAfter', false);
          _status.addToModel('.length', true);
        }
        _status.line.referringArrayPosition = '';
      }
    }

    if (nextWord && reservedWords.ISZERO.includes(nextWord.toLowerCase())) {
      _status.addToModel('= 0', false);
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
      _status.addToModel('=', true);
      _status.line.rightSideOfDeclaration = true;
    }
  }

  // Every word, no matter if it's the first or not in a line.
  handleNumbers(_wordIndex, _wordsCurrentLine, _status);

  // "y" as , or && according to the position.
  if (_wordIndex > 0 && currentWord.toLowerCase() === 'y') {
    if (
      _status.line.settingFunctionProps > 0 ||
      _status.line.printing > 0
    ) {
      _status.setPreviousPart('spaceAfter', false);
      _status.addToModel(',', true);
    } else {
      _status.addToModel('&&', true);
    }
  }

  if (currentWord.toLowerCase() === 'poné' || currentWord.toLowerCase() === 'pone') {
    _status.addToModel(helpers.slugify(_wordsCurrentLine[_wordsCurrentLine.length - 1]) + ' =', true);
    _wordsCurrentLine[_wordsCurrentLine.length - 1] = ''; // to avoid printint it as a variable name later.
  }

  if (currentWord.toLowerCase() === 'mandale' || currentWord.toLowerCase() === '¡mandale') {
    _status.finishLine();
    _status.addToModel('return', true);
  }

  if (currentWord.toLowerCase() === 'wuki') {
    _status.finishLine();
    _status.addToModel('continue', false);
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
      _status.addToModel('>=', true);
    if (currentWord + ' ' + nextWord + ' ' + secondNextWord === 'sea menor que') {
      _status.addToModel('<', true);
      _wordsCurrentLine[_wordIndex + 1] = '';
      _wordsCurrentLine[_wordIndex + 2] = '';
    }
    if (currentWord + ' ' + nextWord + ' ' + secondNextWord === 'sea mayor que') {
      _status.addToModel('>', true);
      _wordsCurrentLine[_wordIndex + 1] = '';
      _wordsCurrentLine[_wordIndex + 2] = '';
    }

    if (currentWord + ' ' + nextWord + ' ' + secondNextWord === 'es mayor que') {
      _status.addToModel('>', true);
      _wordsCurrentLine[_wordIndex + 1] = '';
      _wordsCurrentLine[_wordIndex + 2] = '';
    }

    if (
      currentWord + ' ' + nextWord + ' ' + secondNextWord + ' ' + _wordsCurrentLine[_wordIndex + 3] === 'es más grande que' ||
      currentWord + ' ' + nextWord + ' ' + secondNextWord + ' ' + _wordsCurrentLine[_wordIndex + 3] === 'es mas grande que'
    ) {
      _status.addToModel('>', true);
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
        _status.addToModel(')', true);
        _status.line.settingFunctionProps--;
      }
      _status.addToModel('==', true);
    }
  }

  if (currentWord + ' ' + nextWord === 'no sea') {
    _status.addToModel('!=', true);
  }

  // Math operators
  // increment
  if (
    nextWord &&
    currentWord.toLowerCase() === 'sube' ||
    currentWord.toLowerCase() === 'crece'
  ) {
    if (isVariable(_wordIndex + 1, _wordsCurrentLine, _status)) {
      _status.finishLine();
      _status.addToModel(helpers.slugify(nextWord) + '++', false);
      _wordsCurrentLine[_wordIndex + 1] = ''; // avoid rendering later
    }
    if (secondNextWord && isVariable(_wordIndex + 2, _wordsCurrentLine, _status)) {
      _status.addToModel(helpers.slugify(nextWord) + '++', false);
      _wordsCurrentLine[_wordIndex + 1] = ''; // avoid rendering later
      _wordsCurrentLine[_wordIndex + 2] = ''; // avoid rendering later
    }
  }
  if (currentWord.toLowerCase() === 'baja') {
    if (isVariable(_wordIndex + 1, _wordsCurrentLine, _status)) {
      _status.addToModel(helpers.slugify(nextWord) + '--', false);
      _status.finishLine();
      _wordsCurrentLine[_wordIndex + 1] = ''; // avoid rendering later
    }
    if (isVariable(_wordIndex + 2, _wordsCurrentLine, _status)) {
      _status.addToModel(helpers.slugify(nextWord) + '--', false);
      _status.finishLine();
      _wordsCurrentLine[_wordIndex + 1] = ''; // avoid rendering later
      _wordsCurrentLine[_wordIndex + 2] = ''; // avoid rendering later
    }
  }
};

export { findKeywords };
