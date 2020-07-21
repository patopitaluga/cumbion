import { helpers } from './cumbion-to-js__helpers.mjs';
import { handleLineBeginning } from './cumbion-to-js__handle-line-beginning.mjs';
import { handleNumbers } from './cumbion-to-js__handle-numbers.mjs';
import { isReserved } from './cumbion-to-js__reserved-words.mjs';
import { isVariable } from './cumbion-to-js__is-variable.mjs';
import { reservedWords } from './cumbion-to-js__reserved-words.mjs';

const findKeywords = (_wordIndex, _wordsCurrentLine, _wordsNextLine, status) => {
  if (status.line.writingStringLiteral) return '';

  const currentWord = _wordsCurrentLine[_wordIndex];
  const thisWordSlug = helpers.slugify(currentWord);
  const prevWord = _wordsCurrentLine[_wordIndex - 1];
  const nextWord = _wordsCurrentLine[_wordIndex + 1];
  const secondNextWord = _wordsCurrentLine[_wordIndex + 2];

  // Defining an array or getting the array length
  if (currentWord === 'lxs') {
    if (_wordIndex === 0 && !status.declaredArrays.includes(helpers.slugify(nextWord))) {
      status.acc.finishLine(1);
      status.acc.addToLine('let ' + helpers.slugify(nextWord) + ' = []', false);
      status.acc.finishLine(2);
      status.declaredArrays.push(helpers.slugify(nextWord));
    }
    if (
      prevWord !== 'de' &&
      !status.line.inComparison &&
      !status.line.settingFunctionProps &&
      !status.line.printing
    ) {
      status.line.willBePushedToArray++;
    }
  }

  if (thisWordSlug === 'escucha') {
    if (nextWord === 'a') {
      // status.acc.addToLine(secondNextWord + ' = window.prompt(\'\', \'\');');
    }
  }

  if (currentWord === 'más')   status.acc.addToLine('+', true);
  if (currentWord === 'menos') status.acc.addToLine('-', true);
  if (currentWord === 'por')   status.acc.addToLine('*', true);
  if (currentWord === 'entre') status.acc.addToLine('/', true);

  if (currentWord === '+') status.acc.addToLine('+', true);
  if (currentWord === '-') status.acc.addToLine('-', true);
  if (currentWord === '*') status.acc.addToLine('*', true);
  if (currentWord === '/') status.acc.addToLine('/', true);

  if (currentWord === 'piola')  status.acc.addToLine('true', true);
  if (currentWord === 'ortiba') status.acc.addToLine('false', true);

  if (currentWord === 'misterioso') status.acc.addToLine('undefined', true);
  if (currentWord === 'misteriosa') status.acc.addToLine('undefined', true);

  // variable name
  if (isVariable(_wordIndex, _wordsCurrentLine, status)) {
    if (nextWord === 'de') {
      if (secondNextWord === 'lxs')
        status.line.referringArrayPosition = thisWordSlug;
    } else {
      if (!isReserved(currentWord.toLowerCase())) {
        if (_wordIndex === 0)
          status.acc.finishLine(3);

        if (
          (_wordIndex === 0) &&
          !status.declaredVariables.includes(thisWordSlug)
        ) {
          status.acc.addToLine('let', true);
          status.declaredVariables.push(thisWordSlug);
        }

        status.acc.addToLine(thisWordSlug, true); // Here it renders the variable name.
        if (status.line.referringArrayPosition && status.declaredArrays.includes(thisWordSlug)) {
          status.acc.setPreviousPart('spaceRight', false);
          status.acc.addToLine('[' + status.line.referringArrayPosition + ']', true);
        }

        if (status.declaredFunctions.includes(thisWordSlug)) {
          status.line.settingFunctionProps++;
          status.acc.addToLine('(', false);
        }

        if (prevWord === 'lxs') {
          if (
            status.line.willBePushedToArray > 0 &&
            status.line.settingFunctionProps === 0 &&
            status.line.printing === 0 &&
            !status.line.inComparison
          ) {
            status.line.rightSideOfDeclaration = true; // to render numbers inside .push()
            status.acc.setPreviousPart('spaceRight', false);
            status.acc.addToLine('.push(', false);
          }

          if (status.line.inComparison && !status.line.referringArrayPosition) {
            status.acc.setPreviousPart('spaceRight', false);
            status.acc.addToLine('.length', true);
          }
          status.line.referringArrayPosition = '';
        }
      }
    }

    if (nextWord && reservedWords.ISZERO.includes(nextWord.toLowerCase())) {
      status.acc.addToLine('= 0', false);
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
      status.acc.addToLine('=', true);
      status.line.rightSideOfDeclaration = true;
    }
  }

  if (_wordIndex === 0) // if it's the first word of the line
    handleLineBeginning(_wordIndex, _wordsCurrentLine, _wordsNextLine, status);

  // Every word, no matter if it's the first or not in a line.
  handleNumbers(_wordIndex, _wordsCurrentLine, status);

  // "y" as , or && according to the position.
  if (_wordIndex > 0 && currentWord.toLowerCase() === 'y') {
    if (
      status.line.settingFunctionProps > 0 ||
      status.line.printing > 0
    ) {
      status.acc.setPreviousPart('spaceRight', false);
      status.acc.addToLine(',', true);
    } else {
      status.acc.addToLine('&&', true);
    }
  }

  if (currentWord.toLowerCase() === 'poné' || currentWord.toLowerCase() === 'pone') {
    status.acc.addToLine(helpers.slugify(_wordsCurrentLine[_wordsCurrentLine.length - 1]) + ' =', true);
    _wordsCurrentLine[_wordsCurrentLine.length - 1] = ''; // to avoid printint it as a variable name later.
  }

  if (currentWord.toLowerCase() === 'mandale' || currentWord.toLowerCase() === '¡mandale') {
    status.acc.finishLine(4);
    status.acc.addToLine('return', true);
  }

  if (currentWord.toLowerCase() === 'wuki') {
    status.acc.finishLine(5);
    status.acc.addToLine('continue', false);
  }

  // Comparisons < > >= <= != ==
  if (status.line.inComparison) {
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
      status.acc.addToLine('>=', true);
    if (currentWord + ' ' + nextWord + ' ' + secondNextWord === 'sea menor que') {
      status.acc.addToLine('<', true);
      _wordsCurrentLine[_wordIndex + 1] = '';
      _wordsCurrentLine[_wordIndex + 2] = '';
    }
    if (currentWord + ' ' + nextWord + ' ' + secondNextWord === 'sea mayor que') {
      status.acc.addToLine('>', true);
      _wordsCurrentLine[_wordIndex + 1] = '';
      _wordsCurrentLine[_wordIndex + 2] = '';
    }

    if (currentWord + ' ' + nextWord + ' ' + secondNextWord === 'es mayor que') {
      status.acc.addToLine('>', true);
      _wordsCurrentLine[_wordIndex + 1] = '';
      _wordsCurrentLine[_wordIndex + 2] = '';
    }

    if (
      currentWord + ' ' + nextWord + ' ' + secondNextWord + ' ' + _wordsCurrentLine[_wordIndex + 3] === 'es más grande que' ||
      currentWord + ' ' + nextWord + ' ' + secondNextWord + ' ' + _wordsCurrentLine[_wordIndex + 3] === 'es mas grande que'
    ) {
      status.acc.addToLine('>', true);
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
      if (status.line.settingFunctionProps > 0) {
        status.acc.addToLine(')', true);
        status.line.settingFunctionProps--;
      }
      status.acc.addToLine('==', true);
    }
  }

  if (currentWord + ' ' + nextWord === 'no sea') {
    status.acc.addToLine('!=', true);
  }

  // Math operators
  // increment
  if (
    nextWord &&
    currentWord.toLowerCase() === 'sube' ||
    currentWord.toLowerCase() === 'crece'
  ) {
    if (isVariable(_wordIndex + 1, _wordsCurrentLine, status)) {
      status.acc.finishLine(6);
      status.acc.addToLine(helpers.slugify(nextWord) + '++', false);
      _wordsCurrentLine[_wordIndex + 1] = ''; // avoid rendering later
    }
    if (secondNextWord && isVariable(_wordIndex + 2, _wordsCurrentLine, status)) {
      status.acc.addToLine(helpers.slugify(nextWord) + '++', false);
      _wordsCurrentLine[_wordIndex + 1] = ''; // avoid rendering later
      _wordsCurrentLine[_wordIndex + 2] = ''; // avoid rendering later
    }
  }
  if (currentWord.toLowerCase() === 'baja') {
    if (isVariable(_wordIndex + 1, _wordsCurrentLine, status)) {
      status.acc.addToLine(helpers.slugify(nextWord) + '--', false);
      status.acc.finishLine(7);
      _wordsCurrentLine[_wordIndex + 1] = ''; // avoid rendering later
    }
    if (isVariable(_wordIndex + 2, _wordsCurrentLine, status)) {
      status.acc.addToLine(helpers.slugify(nextWord) + '--', false);
      status.acc.finishLine(8);
      _wordsCurrentLine[_wordIndex + 1] = ''; // avoid rendering later
      _wordsCurrentLine[_wordIndex + 2] = ''; // avoid rendering later
    }
  }
};

export { findKeywords };
