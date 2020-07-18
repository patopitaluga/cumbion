import { helpers } from './cumbion-to-js__helpers.mjs';
import { handleLineBeginning } from './cumbion-to-js__handle-line-beginning.mjs';
import { handleNumbers } from './cumbion-to-js__handle-numbers.mjs';
import { isVariable } from './cumbion-to-js__is-variable.mjs';
import { isReserved } from './cumbion-to-js__reserved-words.mjs';
import { normalize } from './cumbion-to-js__normalize.mjs';
import { reservedWords } from './cumbion-to-js__reserved-words.mjs';

const uppercaseLetters = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';

/**
 * Reads Cumbion code, returns javascript.
 *
 * @param {string} _cumbionCode -
 * @return {Promise<string>}
 */
const cumbionToJs = (_cumbionCode) => {
  if (typeof _cumbionCode !== 'string') throw new Error('Param in cumbionToJs must be a string.');

  return new Promise((resolve, reject) => {
    const scopeStatus = {
      line: { // will hold the status of opened structures, e.g. () in current line. Reseted in every loop.
      },
      settingFunctionParams: 0,
      insideFunction: 0,
      declaredFunctions: [],
      declaredVariables: [],
      declaredArrays: [],
      tabulated: 0,
    };

    _cumbionCode = normalize(_cumbionCode.trim());
    // console.log(_cumbionCode); return; // to test normalizer

    /**
     * Parse line by line and accumulate a string.
     */
    let fullJsTranspilation = '';
    _cumbionCode.split('\n').forEach((_thisCumbionLineStr, _cumbionLineIndex, _allLines) => {
      /**
       * Useful shorthands
       */
      const wordsNextLine = (_allLines[_cumbionLineIndex + 1]) ? _allLines[_cumbionLineIndex + 1].split(' ') : [];

      if (_thisCumbionLineStr.substr(0, 1) === '#' || scopeStatus.line.ignoreNextLine) { // Ignore lines starting with comment.
        scopeStatus.line.ignoreNextLine = false;
        return;
      }

      /* Reset the status of the previous line (it's opened (/[ ) */
      scopeStatus.line.ignoreNextLine = false; // reset
      scopeStatus.line.inComparison = false; // reset

      scopeStatus.line.settingFunctionProps = 0; // reset // should be scalar because a function can be an argument of another function or console.log
      scopeStatus.line.settingVar = false; // reset
      scopeStatus.line.settingArray = 0; // reset // should be scalar because an array might be an element inside an array
      scopeStatus.line.referringArrayPosition = ''; // reset
      scopeStatus.line.writingStringLiteral = false; // reset

      /**
       * Parse every word of the line.
       */
      let jsLineAccumulator = '';
      _thisCumbionLineStr.split(' ').forEach((_currentWord, _wordIndex, _wordsCurrentLine) => {
        if (_currentWord !== '') {
          const thisWordSlug = helpers.slugify(_currentWord);
          const isThisWordCapitalized = (uppercaseLetters.indexOf(_currentWord.substr(0, 1)) > -1);
          const nextWord = _wordsCurrentLine[_wordIndex + 1];
          const secondNextWord = _wordsCurrentLine[_wordIndex + 2];
          const prevWord = _wordsCurrentLine[_wordIndex - 1];

          // Defining an array or getting the array length
          if (_currentWord === 'lxs') {
            if (_wordIndex === 0 && !scopeStatus.declaredArrays.includes(helpers.slugify(nextWord))) {
              jsLineAccumulator += 'let ' + helpers.slugify(nextWord) + ' = []\n';
              scopeStatus.declaredArrays.push(helpers.slugify(nextWord));
            }
            scopeStatus.line.settingVar = true;
            if (prevWord !== 'de' && !scopeStatus.line.inComparison && !scopeStatus.line.settingFunctionProps)
              scopeStatus.line.settingArray++;
          }

          if (thisWordSlug === 'escucha') {
            if (nextWord === 'a') {
              jsLineAccumulator += secondNextWord + ' = window.prompt(\'\', \'\');';
            }
          }

          if (_currentWord === 'más') { jsLineAccumulator += ' +'; _currentWord = ''; };
          if (_currentWord === 'menos') { jsLineAccumulator += ' -'; _currentWord = ''; };
          if (_currentWord === 'por') { jsLineAccumulator += ' *'; _currentWord = ''; };
          if (_currentWord === 'entre') { jsLineAccumulator += ' /'; _currentWord = ''; };

          if (_currentWord === '+') { jsLineAccumulator += ' +'; _currentWord = ''; };
          if (_currentWord === '-') { jsLineAccumulator += ' -'; _currentWord = ''; };
          if (_currentWord === '*') { jsLineAccumulator += ' *'; _currentWord = ''; };
          if (_currentWord === '/') { jsLineAccumulator += ' /'; _currentWord = ''; };

          if (_currentWord === 'piola') { jsLineAccumulator += ' true'; _currentWord = ''; };
          if (_currentWord === 'ortiba') { jsLineAccumulator += ' false'; _currentWord = ''; };

          if (_currentWord === 'misterioso') { jsLineAccumulator += ' undefined'; _currentWord = ''; };
          if (_currentWord === 'misteriosa') { jsLineAccumulator += ' undefined'; _currentWord = ''; };

          // variable name
          if (isVariable(_currentWord, prevWord, scopeStatus)) {
            if (nextWord === 'de') {
              if (secondNextWord === 'lxs')
                scopeStatus.line.referringArrayPosition = thisWordSlug;
            } else {
              if (!isReserved(_currentWord.toLowerCase())) {
                if (
                  (_wordIndex === 0) &&
                  !scopeStatus.declaredVariables.includes(thisWordSlug)
                ) {
                  jsLineAccumulator += 'let';
                  scopeStatus.declaredVariables.push(thisWordSlug);
                }
                if (jsLineAccumulator !== '' && jsLineAccumulator.slice(-1) !== '\n') // space only if it's not at the beggining of a line
                  jsLineAccumulator += ' ';

                jsLineAccumulator += thisWordSlug; // Here it prints the variable.
                if (scopeStatus.line.referringArrayPosition && scopeStatus.declaredArrays.includes(thisWordSlug)) {
                  jsLineAccumulator += '[' + scopeStatus.line.referringArrayPosition + ']';
                }
                if (scopeStatus.declaredFunctions.includes(thisWordSlug)) {
                  scopeStatus.line.settingFunctionProps++;
                  jsLineAccumulator += '(';
                }

                if (prevWord === 'lxs') {
                  if (
                    scopeStatus.line.settingArray > 0 &&
                    scopeStatus.line.settingFunctionProps === 0 &&
                    !scopeStatus.line.inComparison
                  )
                    jsLineAccumulator += '.push(';
                  if (scopeStatus.line.inComparison && !scopeStatus.line.referringArrayPosition)
                    jsLineAccumulator += '.length';
                  scopeStatus.line.referringArrayPosition = '';
                }
              }
            }

            if (nextWord + ' ' + secondNextWord + ' ' + _wordsCurrentLine[_wordIndex + 3] === 'no es nada') {
              jsLineAccumulator += ' = 0';
            }

            // Followed by es is declaring a string / number
            if (
              reservedWords.EQUAL.includes(nextWord) &&
              secondNextWord !== 'mayor' &&
              secondNextWord !== 'más' &&
              secondNextWord !== 'menos' &&
              secondNextWord !== 'tan' &&
              prevWord !== 'y'
            ) {
              jsLineAccumulator += ' =';
              scopeStatus.line.settingVar = true;
            }
          }

          if (_wordIndex === 0) // if it's the first word of the line
            jsLineAccumulator += handleLineBeginning(_wordIndex, _wordsCurrentLine, wordsNextLine, scopeStatus);

          // Every word, no matter if it's the first or not in a line.
          jsLineAccumulator += handleNumbers(_wordIndex, _currentWord, _wordsCurrentLine, scopeStatus);

          // "y" as , or && according to the position.
          if (_wordIndex > 0 && _currentWord.toLowerCase() === 'y') {
            if (scopeStatus.line.settingFunctionProps > 0)
              jsLineAccumulator += ',';
            else
              jsLineAccumulator += ' &&';
          }

          // String delimited with ""
          if ((_currentWord.match(/"/g) || []).length % 2 !== 0) scopeStatus.line.writingStringLiteral = !scopeStatus.line.writingStringLiteral;
          if (scopeStatus.line.writingStringLiteral) {
            jsLineAccumulator += ' ' + _currentWord;
          } else {
            if (_currentWord.slice(-1) === '"')
              jsLineAccumulator += ' ' + _currentWord;
          }

          if (!scopeStatus.line.writingStringLiteral) {
            if (_currentWord.toLowerCase() === 'poné' || _currentWord.toLowerCase() === 'pone') {
              jsLineAccumulator += helpers.slugify(_wordsCurrentLine[_wordsCurrentLine.length - 1]) + ' =';
              _wordsCurrentLine[_wordsCurrentLine.length - 1] = ''; // to avoid printint it as a variable name later.
            }

            if (_currentWord.toLowerCase() === 'mandale' || _currentWord.toLowerCase() === '¡mandale') {
              jsLineAccumulator += 'return';
            }

            if (_currentWord.toLowerCase() === 'wuki') {
              jsLineAccumulator += 'continue';
            }

            // Comparisons < > >= <= != ==
            if (scopeStatus.line.inComparison) {
              if (
                _currentWord + ' ' + nextWord + ' ' + secondNextWord === 'es tan alto' ||
                _currentWord + ' ' + nextWord + ' ' + secondNextWord === 'es tan alta' ||
                _currentWord + ' ' + nextWord + ' ' + secondNextWord === 'es tan grande' ||
                _currentWord + ' ' + nextWord + ' ' + secondNextWord === 'es tan grande' ||
                _currentWord + ' ' + nextWord + ' ' + secondNextWord === 'sea tan alto' ||
                _currentWord + ' ' + nextWord + ' ' + secondNextWord === 'sea tan alta' ||
                _currentWord + ' ' + nextWord + ' ' + secondNextWord === 'sea tan grande' ||
                _currentWord + ' ' + nextWord + ' ' + secondNextWord === 'sea tan grande' ||
                _currentWord + ' ' + nextWord + ' ' + secondNextWord === 'era tan alto' ||
                _currentWord + ' ' + nextWord + ' ' + secondNextWord === 'era tan alta'
              ) {
                jsLineAccumulator += ' >=';
              }
              if (_currentWord + ' ' + nextWord + ' ' + secondNextWord === 'sea menor que') {
                jsLineAccumulator += ' <';
                _currentWord = ''; // avoid consider next
                _wordsCurrentLine[_wordIndex + 1] = '';
                _wordsCurrentLine[_wordIndex + 2] = '';
              }
              if (_currentWord + ' ' + nextWord + ' ' + secondNextWord === 'sea mayor que') {
                jsLineAccumulator += ' <';
                _currentWord = ''; // avoid consider next
                _wordsCurrentLine[_wordIndex + 1] = '';
                _wordsCurrentLine[_wordIndex + 2] = '';
              }

              if (_currentWord + ' ' + nextWord + ' ' + secondNextWord === 'es mayor que') {
                jsLineAccumulator += ' >';
                _currentWord = ''; // avoid consider next
                _wordsCurrentLine[_wordIndex + 1] = '';
                _wordsCurrentLine[_wordIndex + 2] = '';
              }

              if (
                _currentWord + ' ' + nextWord + ' ' + secondNextWord + ' ' + _wordsCurrentLine[_wordIndex + 3] === 'es más grande que' ||
                _currentWord + ' ' + nextWord + ' ' + secondNextWord + ' ' + _wordsCurrentLine[_wordIndex + 3] === 'es mas grande que'
              ) {
                jsLineAccumulator += ' >';
                _currentWord = ''; // avoid consider next
                _wordsCurrentLine[_wordIndex + 1] = '';
                _wordsCurrentLine[_wordIndex + 2] = '';
                _wordsCurrentLine[_wordIndex + 3] = '';
              }

              if ((_currentWord === 'es' || _currentWord === 'somos') && nextWord !== 'tan') {
                if (scopeStatus.line.settingFunctionProps > 0) {
                  jsLineAccumulator += ')';
                  scopeStatus.line.settingFunctionProps--;
                }
                jsLineAccumulator += ' ==';
              }
            }

            if (_currentWord + ' ' + nextWord === 'no sea')
              jsLineAccumulator += ' !=';

            // Math operators
            // increment
            if (
              nextWord &&
              _currentWord.toLowerCase() === 'sube' ||
              _currentWord.toLowerCase() === 'crece'
            ) {
              if (isVariable(nextWord, _currentWord, scopeStatus)) {
                jsLineAccumulator += helpers.slugify(nextWord) + '++';
                _wordsCurrentLine[_wordIndex + 1] = ''; // avoid rendering later
              }
              if (secondNextWord && isVariable(secondNextWord, nextWord, scopeStatus)) {
                jsLineAccumulator += helpers.slugify(secondNextWord) + '++';
                _wordsCurrentLine[_wordIndex + 1] = ''; // avoid rendering later
                _wordsCurrentLine[_wordIndex + 2] = ''; // avoid rendering later
              }
            }
            if (_currentWord.toLowerCase() === 'baja') {
              if (isVariable(nextWord, _currentWord, scopeStatus)) {
                jsLineAccumulator += helpers.slugify(nextWord) + '--';
                _wordsCurrentLine[_wordIndex + 1] = ''; // avoid rendering later
              }
              if (isVariable(secondNextWord, nextWord, scopeStatus)) {
                jsLineAccumulator += helpers.slugify(secondNextWord) + '--';
                _wordsCurrentLine[_wordIndex + 1] = ''; // avoid rendering later
                _wordsCurrentLine[_wordIndex + 2] = ''; // avoid rendering later
              }
            }
          }
        }
      }); // End parse words of each line

      /**
       * Before ending the line check if a ( is open because is setting a if/while loop or a function declaration.
       */
      while (scopeStatus.line.settingFunctionProps > 0) {
        jsLineAccumulator += ')';
        scopeStatus.line.settingFunctionProps--;
      }
      while (scopeStatus.line.settingArray > 0) {
        jsLineAccumulator += ')';
        scopeStatus.line.settingArray--;
      }
      if (scopeStatus.line.inComparison) {
        jsLineAccumulator += ') {';
      }
      // If the line is empty, should close the if/while loop {}
      if (scopeStatus.tabulated > 0) {
        if (
          _thisCumbionLineStr === '' ||
          _cumbionLineIndex === _allLines.length - 1 // if it's the last line should close the opened {
        ) {
          jsLineAccumulator += '}';
          scopeStatus.tabulated--;
        }
      }

      // Then intention was just to leave an empty line.
      if (scopeStatus.tabulated === 0 && _thisCumbionLineStr === '') {
        jsLineAccumulator += ' ';
      }

      if (scopeStatus.settingFunctionParams > 0) {
        jsLineAccumulator += ') {\n';
      }

      // Tabulation
      jsLineAccumulator = '\t'.repeat(scopeStatus.tabulated) + jsLineAccumulator;

      // The scopeStatus.tabulated should be incremented after setting the tabulation for current line because otherwise will indent   while(
      if (scopeStatus.line.inComparison) {
        scopeStatus.tabulated++;
      }
      if (scopeStatus.settingFunctionParams > 0) {
        scopeStatus.settingFunctionParams--;
        scopeStatus.tabulated++;
      }

      // ?
      if (scopeStatus.tabulated > 0 && _cumbionLineIndex === _allLines.length - 1)
        jsLineAccumulator += '}';

      // Now the the line is ready, add it to the accumulator string.
      fullJsTranspilation += jsLineAccumulator + ((jsLineAccumulator !== '' && !scopeStatus.line.ignoreNextLine) ? '\n' : '');
    }); // Ends the line foreach

    fullJsTranspilation = fullJsTranspilation.replace(RegExp('—', 'g'), ' ');

    // Linter and prettify
    fullJsTranspilation = fullJsTranspilation.replace(RegExp('\\( ', 'g'), '('); // remove the space after the (, set by the variable render.
    fullJsTranspilation = fullJsTranspilation.replace(RegExp('=([0-9])', 'g'), "= $1");
    fullJsTranspilation = fullJsTranspilation.replace(/  +/g, ' '); // remove duplicated spaces (not tab)
    fullJsTranspilation = fullJsTranspilation.replace(RegExp('\t', 'g'), '  '); // replace tabs with sapaces
    fullJsTranspilation = fullJsTranspilation.trim();
    fullJsTranspilation = fullJsTranspilation + '\n';

    resolve(fullJsTranspilation);
  });
};

export { cumbionToJs }; // function.
