import { helpers } from './cumbion-to-js__helpers.mjs';
import { handleLineBeginning } from './cumbion-to-js__handle-line-beginning.mjs';
import { handleNumbers } from './cumbion-to-js__handle-numbers.mjs';
import { isReserved } from './cumbion-to-js__reserved-words.mjs';
import { isVariable } from './cumbion-to-js__is-variable.mjs';
import { reservedWords } from './cumbion-to-js__reserved-words.mjs';

const findKeywords = (_wordIndex, _wordsCurrentLine, _wordsNextLine, _scopeStatus) => {
  let jsPartAccumulator = '';
  if (_scopeStatus.line.writingStringLiteral) return '';

  const currentWord = _wordsCurrentLine[_wordIndex];
  const thisWordSlug = helpers.slugify(currentWord);
  const prevWord = _wordsCurrentLine[_wordIndex - 1];
  const nextWord = _wordsCurrentLine[_wordIndex + 1];
  const secondNextWord = _wordsCurrentLine[_wordIndex + 2];

  // Defining an array or getting the array length
  if (currentWord === 'lxs') {
    if (_wordIndex === 0 && !_scopeStatus.declaredArrays.includes(helpers.slugify(nextWord))) {
      jsPartAccumulator += 'let ' + helpers.slugify(nextWord) + ' = []\n';
      _scopeStatus.declaredArrays.push(helpers.slugify(nextWord));
    }
    _scopeStatus.line.settingVar = true;
    if (prevWord !== 'de' && !_scopeStatus.line.inComparison && !_scopeStatus.line.settingFunctionProps)
      _scopeStatus.line.settingArray++;
  }

  if (thisWordSlug === 'escucha') {
    if (nextWord === 'a') {
      jsPartAccumulator += secondNextWord + ' = window.prompt(\'\', \'\');';
    }
  }

  if (currentWord === 'más') jsPartAccumulator += ' +';
  if (currentWord === 'menos') jsPartAccumulator += ' -';
  if (currentWord === 'por') jsPartAccumulator += ' *';
  if (currentWord === 'entre') jsPartAccumulator += ' /';

  if (currentWord === '+') jsPartAccumulator += ' +';
  if (currentWord === '-') jsPartAccumulator += ' -';
  if (currentWord === '*') jsPartAccumulator += ' *';
  if (currentWord === '/') jsPartAccumulator += ' /';

  if (currentWord === 'piola') jsPartAccumulator += ' true';
  if (currentWord === 'ortiba') jsPartAccumulator += ' false';

  if (currentWord === 'misterioso') jsPartAccumulator += ' undefined';
  if (currentWord === 'misteriosa') jsPartAccumulator += ' undefined';

  // variable name
  if (isVariable(currentWord, prevWord, _scopeStatus)) {
    if (nextWord === 'de') {
      if (secondNextWord === 'lxs')
        _scopeStatus.line.referringArrayPosition = thisWordSlug;
    } else {
      if (!isReserved(currentWord.toLowerCase())) {
        if (
          (_wordIndex === 0) &&
          !_scopeStatus.declaredVariables.includes(thisWordSlug)
        ) {
          jsPartAccumulator += 'let';
          _scopeStatus.declaredVariables.push(thisWordSlug);
        }
        // if (jsPartAccumulator !== '' && jsPartAccumulator.slice(-1) !== '\n') // space only if it's not at the beggining of a line
          jsPartAccumulator += ' ';

        jsPartAccumulator += thisWordSlug; // Here it prints the variable.
        if (_scopeStatus.line.referringArrayPosition && _scopeStatus.declaredArrays.includes(thisWordSlug)) {
          jsPartAccumulator += '[' + _scopeStatus.line.referringArrayPosition + ']';
        }
        if (_scopeStatus.declaredFunctions.includes(thisWordSlug)) {
          _scopeStatus.line.settingFunctionProps++;
          jsPartAccumulator += '(';
        }

        if (prevWord === 'lxs') {
          if (
            _scopeStatus.line.settingArray > 0 &&
            _scopeStatus.line.settingFunctionProps === 0 &&
            !_scopeStatus.line.inComparison
          )
            jsPartAccumulator += '.push(';
          if (_scopeStatus.line.inComparison && !_scopeStatus.line.referringArrayPosition)
            jsPartAccumulator += '.length';
          _scopeStatus.line.referringArrayPosition = '';
        }
      }
    }

    if (nextWord && reservedWords.ISZERO.includes(nextWord.toLowerCase())) {
      jsPartAccumulator += ' = 0';
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
      jsPartAccumulator += ' =';
      _scopeStatus.line.settingVar = true;
    }
  }

  if (_wordIndex === 0) // if it's the first word of the line
    jsPartAccumulator += handleLineBeginning(_wordIndex, _wordsCurrentLine, _wordsNextLine, _scopeStatus);

  // Every word, no matter if it's the first or not in a line.
  jsPartAccumulator += handleNumbers(_wordIndex, currentWord, _wordsCurrentLine, _scopeStatus);

  // "y" as , or && according to the position.
  if (_wordIndex > 0 && currentWord.toLowerCase() === 'y') {
    if (_scopeStatus.line.settingFunctionProps > 0)
      jsPartAccumulator += ',';
    else
      jsPartAccumulator += ' &&';
  }

  if (currentWord.toLowerCase() === 'poné' || currentWord.toLowerCase() === 'pone') {
    jsPartAccumulator += helpers.slugify(_wordsCurrentLine[_wordsCurrentLine.length - 1]) + ' =';
    _wordsCurrentLine[_wordsCurrentLine.length - 1] = ''; // to avoid printint it as a variable name later.
  }

  if (currentWord.toLowerCase() === 'mandale' || currentWord.toLowerCase() === '¡mandale') {
    jsPartAccumulator += 'return';
  }

  if (currentWord.toLowerCase() === 'wuki') {
    jsPartAccumulator += 'continue';
  }

  // Comparisons < > >= <= != ==
  if (_scopeStatus.line.inComparison) {
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
    ) {
      jsPartAccumulator += ' >=';
    }
    if (currentWord + ' ' + nextWord + ' ' + secondNextWord === 'sea menor que') {
      jsPartAccumulator += ' <';
      _wordsCurrentLine[_wordIndex + 1] = '';
      _wordsCurrentLine[_wordIndex + 2] = '';
    }
    if (currentWord + ' ' + nextWord + ' ' + secondNextWord === 'sea mayor que') {
      jsPartAccumulator += ' <';
      _wordsCurrentLine[_wordIndex + 1] = '';
      _wordsCurrentLine[_wordIndex + 2] = '';
    }

    if (currentWord + ' ' + nextWord + ' ' + secondNextWord === 'es mayor que') {
      jsPartAccumulator += ' >';
      _wordsCurrentLine[_wordIndex + 1] = '';
      _wordsCurrentLine[_wordIndex + 2] = '';
    }

    if (
      currentWord + ' ' + nextWord + ' ' + secondNextWord + ' ' + _wordsCurrentLine[_wordIndex + 3] === 'es más grande que' ||
      currentWord + ' ' + nextWord + ' ' + secondNextWord + ' ' + _wordsCurrentLine[_wordIndex + 3] === 'es mas grande que'
    ) {
      jsPartAccumulator += ' >';
      _wordsCurrentLine[_wordIndex + 1] = '';
      _wordsCurrentLine[_wordIndex + 2] = '';
      _wordsCurrentLine[_wordIndex + 3] = '';
    }

    if ((currentWord === 'es' || currentWord === 'somos') && nextWord !== 'tan') {
      if (_scopeStatus.line.settingFunctionProps > 0) {
        jsPartAccumulator += ')';
        _scopeStatus.line.settingFunctionProps--;
      }
      jsPartAccumulator += ' ==';
    }
  }

  if (currentWord + ' ' + nextWord === 'no sea')
    jsPartAccumulator += ' !=';

  // Math operators
  // increment
  if (
    nextWord &&
    currentWord.toLowerCase() === 'sube' ||
    currentWord.toLowerCase() === 'crece'
  ) {
    if (isVariable(nextWord, currentWord, _scopeStatus)) {
      jsPartAccumulator += helpers.slugify(nextWord) + '++';
      _wordsCurrentLine[_wordIndex + 1] = ''; // avoid rendering later
    }
    if (secondNextWord && isVariable(secondNextWord, nextWord, _scopeStatus)) {
      jsPartAccumulator += helpers.slugify(secondNextWord) + '++';
      _wordsCurrentLine[_wordIndex + 1] = ''; // avoid rendering later
      _wordsCurrentLine[_wordIndex + 2] = ''; // avoid rendering later
    }
  }
  if (currentWord.toLowerCase() === 'baja') {
    if (isVariable(nextWord, currentWord, _scopeStatus)) {
      jsPartAccumulator += helpers.slugify(nextWord) + '--';
      _wordsCurrentLine[_wordIndex + 1] = ''; // avoid rendering later
    }
    if (isVariable(secondNextWord, nextWord, _scopeStatus)) {
      jsPartAccumulator += helpers.slugify(secondNextWord) + '--';
      _wordsCurrentLine[_wordIndex + 1] = ''; // avoid rendering later
      _wordsCurrentLine[_wordIndex + 2] = ''; // avoid rendering later
    }
  }

  return jsPartAccumulator;
}

export { findKeywords };
