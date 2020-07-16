import { helpers } from './cumbion-to-js__helpers.mjs';
import { handleFirstWordUppercase } from './cumbion-to-js__handle-first-word__uppercase.mjs';

const uppercaseLetters = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';
const reservedWords = [
  'de', // sets that number as the index of an array
  'es', // =
  'lxs', // is the let in an array definition
  'Mandale', // Return
  'Mientras', // while
  'Poné', 'Pone', // to set an already declared variable
  'Si', // if
  'Sube',
  'quieren', 'tienen', // is the [ in an array definition
  'Wuki',
];

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
      line: {
      },
      settingFunctionParams: 0,
      insideFunction: 0,
      declaredFunctions: [],
      declaredVariables: [],
      declaredArrays: [],
      tabulated: 0,
    };

    /**
     * Parse line by line and accumulate a string.
     */
    let fullJsTranscription = '';
    _cumbionCode.split('\n').forEach((_thisCumbionLineStr, _cumbionLineIndex, _allLines) => {
      /**
       * Useful shorthands
       */
      const wordsNextLine = (_allLines[_cumbionLineIndex + 1]) ? _allLines[_cumbionLineIndex + 1].split(' ') : [];

      /**
       * Sanitize this Cumbion line string.
       */
      _thisCumbionLineStr = ' ' + _thisCumbionLineStr + ' '; // ad space before and after to recognize articles even at the start
      _thisCumbionLineStr = _thisCumbionLineStr.replace(/,/g, '');
      _thisCumbionLineStr = _thisCumbionLineStr.replace(RegExp(' el ', 'g'), ' ');
      _thisCumbionLineStr = _thisCumbionLineStr.replace(RegExp(' la ', 'g'), ' ');
      _thisCumbionLineStr = _thisCumbionLineStr.replace(RegExp(' El ', 'g'), ' ');
      _thisCumbionLineStr = _thisCumbionLineStr.replace(RegExp(' La ', 'g'), ' ');
      _thisCumbionLineStr = _thisCumbionLineStr.replace(RegExp(' los ', 'g'), ' lxs ');
      _thisCumbionLineStr = _thisCumbionLineStr.replace(RegExp(' las ', 'g'), ' lxs ');
      _thisCumbionLineStr = _thisCumbionLineStr.replace(RegExp(' les ', 'g'), ' lxs ');
      _thisCumbionLineStr = _thisCumbionLineStr.replace(RegExp(' Los ', 'g'), ' lxs ');
      _thisCumbionLineStr = _thisCumbionLineStr.replace(RegExp(' Las ', 'g'), ' lxs ');
      _thisCumbionLineStr = _thisCumbionLineStr.replace(RegExp(' Les ', 'g'), ' lxs ');
      _thisCumbionLineStr = _thisCumbionLineStr.replace(RegExp(' mi ', 'g'), ' ');
      _thisCumbionLineStr = _thisCumbionLineStr.replace(RegExp(' Mi ', 'g'), ' ');
      _thisCumbionLineStr = _thisCumbionLineStr.replace(RegExp(' Tu ', 'g'), ' ');
      _thisCumbionLineStr = _thisCumbionLineStr.replace(RegExp(' nuestro ', 'g'), ' ');
      _thisCumbionLineStr = _thisCumbionLineStr.replace(RegExp(' Nuestro ', 'g'), ' ');
      _thisCumbionLineStr = _thisCumbionLineStr.replace(RegExp(' nuestra ', 'g'), ' ');
      _thisCumbionLineStr = _thisCumbionLineStr.replace(RegExp(' Nuestra ', 'g'), ' ');
      _thisCumbionLineStr = _thisCumbionLineStr.replace(RegExp(' nuestre ', 'g'), ' ');
      _thisCumbionLineStr = _thisCumbionLineStr.replace(RegExp(' Nuestre ', 'g'), ' ');
      _thisCumbionLineStr = _thisCumbionLineStr.replace(RegExp(' ¡Y dice! ', 'g'), ' dice ');
      _thisCumbionLineStr = _thisCumbionLineStr.replace(RegExp(' ¡y dice! ', 'g'), ' dice ');
      _thisCumbionLineStr = _thisCumbionLineStr.replace(RegExp(' Y dice! ', 'g'), ' dice ');
      _thisCumbionLineStr = _thisCumbionLineStr.replace(RegExp(' y dice! ', 'g'), ' dice ');
      _thisCumbionLineStr = _thisCumbionLineStr.replace(RegExp(' y dice ', 'g'), ' dice ');
      _thisCumbionLineStr = _thisCumbionLineStr.replace(RegExp(' Wuki Wuki!', 'g'), ' wuki ');
      _thisCumbionLineStr = _thisCumbionLineStr.replace(RegExp(' Wuki! Wuki!', 'g'), ' wuki ');
      _thisCumbionLineStr = _thisCumbionLineStr.replace(RegExp(' ¡Wuki! ¡Wuki!', 'g'), ' wuki ');
      _thisCumbionLineStr = _thisCumbionLineStr.replace(RegExp(' Wuki Wuki', 'g'), ' wuki '); // this after the ones with ! because will ruin prevs.
      _thisCumbionLineStr = _thisCumbionLineStr.replace(RegExp('  ', 'g'), ' ');
      _thisCumbionLineStr = _thisCumbionLineStr.trim(); // trim the added spaces

      if (_thisCumbionLineStr.substr(0, 1) === '#' || scopeStatus.line.ignoreNextLine) { // Ignore lines starting with comment.
        scopeStatus.line.ignoreNextLine = false;
        return;
      }

      /* Reset the status of the previous line (it's opened (/[ ) */
      scopeStatus.line.ignoreNextLine = false; // reset
      scopeStatus.line.openingIfOrWhileLoop = false; // reset
      scopeStatus.line.settingFunctionProps = false; // reset
      scopeStatus.line.settingVar = false; // reset
      scopeStatus.line.settingArray = false; // reset
      scopeStatus.line.referringArrayPosition = ''; // reset

      /**
       * Parse every word of the line.
       */
      let jsLineAccumulator = '';
      _thisCumbionLineStr.split(' ').forEach((_currentWord, _wordIndex, _wordsCurrentLine) => {
        if (_currentWord !== '') {
          let thisWordSlug = helpers.slugify(_currentWord);
          let isThisWordCapitalized = (uppercaseLetters.indexOf(_currentWord.substr(0, 1)) > -1);
          let nextWord = _wordsCurrentLine[_wordIndex + 1];
          let previousWord = _wordsCurrentLine[_wordIndex - 1];

          // Defining an array or getting the array length
          if (_currentWord === 'lxs') {
            if (previousWord === 'como' || previousWord === 'que') {
              jsLineAccumulator += ' ' + helpers.slugify(nextWord) + '.length';
              _wordsCurrentLine[_wordIndex + 1] = '';
            } else {
              if (!scopeStatus.declaredArrays.includes(helpers.slugify(nextWord))) {
                jsLineAccumulator += 'let ' + helpers.slugify(nextWord) + ' = []\n';
              }
              scopeStatus.declaredArrays.push(helpers.slugify(nextWord));
              scopeStatus.line.settingVar = true;
              if (previousWord !== 'de')
                scopeStatus.line.settingArray = true;
            }
          }

          // variable name
          if (isThisWordCapitalized && !reservedWords.includes(_currentWord)) {
            if (_wordIndex === 0 && !scopeStatus.declaredVariables.includes(thisWordSlug)) {
              jsLineAccumulator += 'let';
              scopeStatus.declaredVariables.push(thisWordSlug);
            }
            if (jsLineAccumulator !== '' && jsLineAccumulator.slice(-1) !== '\n')
              jsLineAccumulator += ' ';

            if (nextWord === 'de') {
              scopeStatus.line.referringArrayPosition = thisWordSlug;
              // _wordsCurrentLine[_wordIndex + 1] = 'asdasdasd'; // to avoid considering as a number later.
            } else {
              jsLineAccumulator += thisWordSlug;
              if (scopeStatus.line.referringArrayPosition && scopeStatus.declaredArrays.includes(thisWordSlug)) {
                jsLineAccumulator += '[' + scopeStatus.line.referringArrayPosition + ']';
                scopeStatus.line.referringArrayPosition = '';
              }
            }

            if (scopeStatus.line.settingArray)
              jsLineAccumulator += '.push(';
          }

          if (_wordIndex === 0) { // if it's the first word of the line
            // Starting with uppercase
            if (isThisWordCapitalized)
              jsLineAccumulator += handleFirstWordUppercase(_wordIndex, _wordsCurrentLine, wordsNextLine, scopeStatus);

            // While
            if (_currentWord.toLowerCase() === 'mientras') {
              scopeStatus.line.openingIfOrWhileLoop = true;
              jsLineAccumulator += 'while(';
            }
            // If
            if (_currentWord.toLowerCase() === 'si') {
              scopeStatus.line.openingIfOrWhileLoop = true;
              jsLineAccumulator += 'if (';
            }
            // output
            if (_currentWord.toLowerCase() === 'dice') {
              scopeStatus.line.settingFunctionProps = true;
              jsLineAccumulator += 'console.log(';
            }
          }

          // Every word, no matter if it's the first or not in a line.
          if (scopeStatus.line.settingVar && !reservedWords.includes(_currentWord) && !isThisWordCapitalized && isNaN(_currentWord)) {
            jsLineAccumulator += _currentWord.length; // not using ' ' as prefix because might concatenate next word/number
          }

          // Number
          if (!isNaN(_currentWord))
            jsLineAccumulator += ' ' + _currentWord;

          // "y" as , or && according to the position.
          if (_currentWord.toLowerCase() === 'y') {
            if (scopeStatus.line.settingFunctionProps)
              jsLineAccumulator += ',';
            else
              jsLineAccumulator += ' &&';
          }

          // String delimited with ""
          if (_currentWord.substr(0, 1) === '"' && _currentWord.slice(-1) === '"')
            jsLineAccumulator += ' ' + _currentWord;

          if (scopeStatus.line.openingIfOrWhileLoop && !reservedWords.includes(_currentWord)) {
            if (scopeStatus.declaredFunctions.includes(helpers.slugify(_currentWord))) {
              scopeStatus.line.settingFunctionProps = true;
              jsLineAccumulator += '(';
            }
          }

          if (_currentWord.toLowerCase() === 'poné' || _currentWord.toLowerCase() === 'pone') {
            jsLineAccumulator += helpers.slugify(_wordsCurrentLine[_wordsCurrentLine.length - 1]) + ' =';
            _wordsCurrentLine[_wordsCurrentLine.length - 1] = ''; // to avoid printint it as a variable name later.
          }

          if (_currentWord.toLowerCase() === 'mandale') {
            jsLineAccumulator += 'return';
          }

          if (_currentWord.toLowerCase() === 'wuki') {
            jsLineAccumulator += 'continue';
          }

          if (_currentWord.toLowerCase() === 'hasta' && nextWord === 'que') {
            scopeStatus.line.openingIfOrWhileLoop = true;
            jsLineAccumulator += 'while(';
          }

          // Comparisons < > >= <= != ==
          if (scopeStatus.line.openingIfOrWhileLoop) {
            if (
              _currentWord + ' ' + nextWord + ' ' + _wordsCurrentLine[_wordIndex + 2] === 'sea tan alto' ||
              _currentWord + ' ' + nextWord + ' ' + _wordsCurrentLine[_wordIndex + 2] === 'sea tan alta' ||
              _currentWord + ' ' + nextWord + ' ' + _wordsCurrentLine[_wordIndex + 2] === 'era tan alto' ||
              _currentWord + ' ' + nextWord + ' ' + _wordsCurrentLine[_wordIndex + 2] === 'era tan alta'
            ) {
              jsLineAccumulator += ' >=';
            }
            if (_currentWord + ' ' + nextWord + ' ' + _wordsCurrentLine[_wordIndex + 2] === 'sea menor que')
              jsLineAccumulator += ' <';

            if (
              _currentWord + ' ' + nextWord + ' ' + _wordsCurrentLine[_wordIndex + 2] + ' ' + _wordsCurrentLine[_wordIndex + 3] === 'es más grande que' ||
              _currentWord + ' ' + nextWord + ' ' + _wordsCurrentLine[_wordIndex + 2] + ' ' + _wordsCurrentLine[_wordIndex + 3] === 'es mas grande que' ||
              _currentWord + ' ' + nextWord + ' ' + _wordsCurrentLine[_wordIndex + 2] === 'es mayor que'
            ) {
              jsLineAccumulator += ' >';
              _currentWord = ''; // avoid consider next
              _wordsCurrentLine[_wordIndex + 1] = '';
              _wordsCurrentLine[_wordIndex + 2] = '';
              _wordsCurrentLine[_wordIndex + 3] = '';
            }

            if ((_currentWord === 'es' || _currentWord === 'somos') && nextWord !== 'tan') {
              if (scopeStatus.line.settingFunctionProps) {
                jsLineAccumulator += ')';
                scopeStatus.line.settingFunctionProps = false;
              }
              jsLineAccumulator += ' ==';
            }
          }

          if (_currentWord + ' ' + nextWord === 'no sea')
            jsLineAccumulator += ' !=';

          // Math operators
          // increment
          if (_currentWord.toLowerCase() === 'sube' && uppercaseLetters.indexOf(nextWord.substr(0, 1)) > -1) {
            jsLineAccumulator += helpers.slugify(nextWord) + '++';
            _wordsCurrentLine[_wordIndex + 1] = ''; // avoid rendering later
          }
          // minus
          if (_currentWord === 'menos') {
            jsLineAccumulator += ' -';
          }
        }
      }); // Finish the foreach that parse words

      /**
       * Before ending the line check if a ( is open because is setting a if/while loop or a function declaration.
       */
      if (scopeStatus.line.settingFunctionProps || scopeStatus.line.settingArray) {
        jsLineAccumulator += ')';
        scopeStatus.line.settingFunctionProps = false;
      }
      if (scopeStatus.line.openingIfOrWhileLoop) {
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
      jsLineAccumulator = '  '.repeat(scopeStatus.tabulated) + jsLineAccumulator;

      // The scopeStatus.tabulated should be incremented after setting the tabulation for current line because otherwise will indent   while(
      if (scopeStatus.line.openingIfOrWhileLoop) {
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
      fullJsTranscription += jsLineAccumulator + ((jsLineAccumulator !== '' && !scopeStatus.line.ignoreNextLine) ? '\n' : '');
    }); // Ends the line foreach

    // Linter and prettify
    fullJsTranscription = fullJsTranscription.replace(RegExp('\\( ', 'g'), '('); // remove the space after the (, set by the variable render.
    fullJsTranscription = fullJsTranscription.replace(RegExp('=([0-9])', 'g'), "= $1");
    // fullJsTranscription = fullJsTranscription.replace(RegExp(' ', 'g'), ' ');

    resolve(fullJsTranscription);
  });
};

export { cumbionToJs }; // function.
