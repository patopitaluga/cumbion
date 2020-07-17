import { helpers } from './cumbion-to-js__helpers.mjs';
import { handleLineBeginning } from './cumbion-to-js__handle-line-beginning.mjs';
import { isVariable } from './cumbion-to-js__is-variable.mjs';

const uppercaseLetters = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';
const reservedWords = [
  'de', // sets that number as the index of an array
  'es', // =
  'escucha', // =
  'lxs', // is the let in an array definition
  'mandale', // return
  'menos', // - sign (Math)
  'mientras', // while
  'pone', // to set an already declared variable
  'para', // Pará! to close a loop without letting an empty line (if it's actually "para" might be ignores anyway)
  'si', // if
  'sube', 'crece', // ++
  'quieren', 'tienen', // is the [ in an array definition
  'wuki',
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
      _thisCumbionLineStr = ' ' + _thisCumbionLineStr.trim() + ' '; // ad space before and after to recognize articles even at the start
      _thisCumbionLineStr = _thisCumbionLineStr.replace(/,/g, '');
      _thisCumbionLineStr = _thisCumbionLineStr.replace(RegExp(' _ ', 'g'), ''); // Remove all _ because articles will be replaced by _
      _thisCumbionLineStr = _thisCumbionLineStr.replace(RegExp(' el ', 'g'), ' _ ');
      _thisCumbionLineStr = _thisCumbionLineStr.replace(RegExp(' la ', 'g'), ' _ ');
      _thisCumbionLineStr = _thisCumbionLineStr.replace(RegExp(' El ', 'g'), ' _ ');
      _thisCumbionLineStr = _thisCumbionLineStr.replace(RegExp(' La ', 'g'), ' _ ');
      _thisCumbionLineStr = _thisCumbionLineStr.replace(RegExp(' los ', 'g'), ' lxs ');
      _thisCumbionLineStr = _thisCumbionLineStr.replace(RegExp(' las ', 'g'), ' lxs ');
      _thisCumbionLineStr = _thisCumbionLineStr.replace(RegExp(' les ', 'g'), ' lxs ');
      _thisCumbionLineStr = _thisCumbionLineStr.replace(RegExp(' Los ', 'g'), ' lxs ');
      _thisCumbionLineStr = _thisCumbionLineStr.replace(RegExp(' Las ', 'g'), ' lxs ');
      _thisCumbionLineStr = _thisCumbionLineStr.replace(RegExp(' Les ', 'g'), ' lxs ');
      _thisCumbionLineStr = _thisCumbionLineStr.replace(RegExp(' mi ', 'g'), ' _ ');
      _thisCumbionLineStr = _thisCumbionLineStr.replace(RegExp(' Mi ', 'g'), ' _ ');
      _thisCumbionLineStr = _thisCumbionLineStr.replace(RegExp(' Tu ', 'g'), ' _ ');
      // _thisCumbionLineStr = _thisCumbionLineStr.replace(RegExp('¡', 'g'), ' '); // Remove all ¡ // This doesn't work because might be inside string literlas
      // _thisCumbionLineStr = _thisCumbionLineStr.replace(RegExp('!', 'g'), ' '); // Remove all !
      _thisCumbionLineStr = _thisCumbionLineStr.replace(RegExp(' nuestro ', 'g'), ' _ ');
      _thisCumbionLineStr = _thisCumbionLineStr.replace(RegExp(' Nuestro ', 'g'), ' _ ');
      _thisCumbionLineStr = _thisCumbionLineStr.replace(RegExp(' nuestra ', 'g'), ' _ ');
      _thisCumbionLineStr = _thisCumbionLineStr.replace(RegExp(' Nuestra ', 'g'), ' _ ');
      _thisCumbionLineStr = _thisCumbionLineStr.replace(RegExp(' nuestre ', 'g'), ' _ ');
      _thisCumbionLineStr = _thisCumbionLineStr.replace(RegExp(' Nuestre ', 'g'), ' _ ');
      _thisCumbionLineStr = _thisCumbionLineStr.replace(RegExp(' Y dice! ', 'g'), ' dice ');
      _thisCumbionLineStr = _thisCumbionLineStr.replace(RegExp(' y dice! ', 'g'), ' dice ');
      _thisCumbionLineStr = _thisCumbionLineStr.replace(RegExp(' Wuki Wuki ', 'g'), ' wuki ');
      _thisCumbionLineStr = _thisCumbionLineStr.replace(RegExp(' Wuki! Wuki! ', 'g'), ' wuki ');
      _thisCumbionLineStr = _thisCumbionLineStr.replace(RegExp(' ¡Wuki! ¡Wuki! ', 'g'), ' wuki ');
      _thisCumbionLineStr = _thisCumbionLineStr.replace(RegExp(' uno ', 'g'), ' 1 ');
      _thisCumbionLineStr = _thisCumbionLineStr.replace(RegExp(' dos ', 'g'), ' 2 ');
      _thisCumbionLineStr = _thisCumbionLineStr.replace(RegExp(' tres ', 'g'), ' 3 ');
      _thisCumbionLineStr = _thisCumbionLineStr.replace(RegExp(' cuatro ', 'g'), ' 4 ');
      _thisCumbionLineStr = _thisCumbionLineStr.replace(RegExp(' cinco ', 'g'), ' 5 ');
      _thisCumbionLineStr = _thisCumbionLineStr.replace(RegExp(' seis ', 'g'), ' 6 ');
      _thisCumbionLineStr = _thisCumbionLineStr.replace(RegExp(' siete ', 'g'), ' 7 ');
      _thisCumbionLineStr = _thisCumbionLineStr.replace(RegExp(' ocho ', 'g'), ' 8 ');
      _thisCumbionLineStr = _thisCumbionLineStr.replace(RegExp(' nueve ', 'g'), ' 9 ');
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
      scopeStatus.line.writingStringLiteral = ''; // reset

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
            if (prevWord === 'como' || prevWord === 'que') { // is inside a comparison
              jsLineAccumulator += ' ' + helpers.slugify(nextWord) + '.length';
              _wordsCurrentLine[_wordIndex + 1] = '';
            } else {
              if (!scopeStatus.declaredArrays.includes(helpers.slugify(nextWord))) {
                jsLineAccumulator += 'let ' + helpers.slugify(nextWord) + ' = []\n';
              }
              scopeStatus.declaredArrays.push(helpers.slugify(nextWord));
              scopeStatus.line.settingVar = true;
              if (prevWord !== 'de')
                scopeStatus.line.settingArray = true;
            }
          }

          if (_currentWord === 'Pará!' || _currentWord === '¡Pará!') {
            _currentWord = '';
            jsLineAccumulator += '}';
            scopeStatus.tabulated--;
          }

          if (thisWordSlug === 'escucha') {
            if (nextWord === 'a') {
              jsLineAccumulator += secondNextWord + ' = window.prompt(\'\', \'\');';
            }
          }

          // variable name
          if (isVariable(_currentWord, prevWord, scopeStatus, reservedWords)) {
            if (
              (
                _wordIndex === 0 ||
                (_wordIndex === 1 && prevWord === '_')
              ) &&
              !scopeStatus.declaredVariables.includes(thisWordSlug)
            ) {
              jsLineAccumulator += 'let';
              scopeStatus.declaredVariables.push(thisWordSlug);
            }
            if (jsLineAccumulator !== '' && jsLineAccumulator.slice(-1) !== '\n') // space only if it's not at the beggining of a line
              jsLineAccumulator += ' ';

            if (nextWord === 'de') {
              scopeStatus.line.referringArrayPosition = thisWordSlug;
            } else {
              jsLineAccumulator += thisWordSlug;
              if (scopeStatus.line.referringArrayPosition && scopeStatus.declaredArrays.includes(thisWordSlug)) {
                jsLineAccumulator += '[' + scopeStatus.line.referringArrayPosition + ']';
                scopeStatus.line.referringArrayPosition = '';
              }
            }

            if (scopeStatus.line.settingArray && !scopeStatus.line.settingFunctionProps)
              jsLineAccumulator += '.push(';

            if (nextWord + ' ' + secondNextWord + ' ' + _wordsCurrentLine[_wordIndex + 3] === 'no es nada') {
              jsLineAccumulator += ' = 0';
            }

            // Followed by es is declaring a string / number
            if (
              nextWord === 'es' &&
              secondNextWord !== 'mayor' &&
              secondNextWord !== 'más' &&
              secondNextWord !== 'menos' &&
              secondNextWord !== 'tan'
            ) {
              jsLineAccumulator += ' =';
              scopeStatus.line.settingVar = true;
            }
          }

          if (_wordIndex === 0) // if it's the first word of the line
            jsLineAccumulator += handleLineBeginning(_wordIndex, _wordsCurrentLine, wordsNextLine, scopeStatus);

          // Every word, no matter if it's the first or not in a line.
          // Number
          if (
            _currentWord !== '_' && // not article
            scopeStatus.line.settingVar &&
            !reservedWords.includes(thisWordSlug) &&
            !isVariable(_currentWord, prevWord, scopeStatus, reservedWords) &&
            !isThisWordCapitalized && isNaN(_currentWord) &&
            (_currentWord !== 'más' && _currentWord !== 'mas') // la más linda / el más lindo
          ) {
            jsLineAccumulator += _currentWord.length; // not using ' ' as prefix because might concatenate next word/number
          }

          // Is actually a literal number. E.g.: 100
          if (!isNaN(_currentWord))
            jsLineAccumulator += ' ' + _currentWord; // actually rendering the variable name.

          // "y" as , or && according to the position.
          if (_currentWord.toLowerCase() === 'y') {
            if (scopeStatus.line.settingFunctionProps)
              jsLineAccumulator += ',';
            else
              jsLineAccumulator += ' &&';
          }

          // String delimited with ""
          if (scopeStatus.line.writingStringLiteral) {
            jsLineAccumulator += ' ' + _currentWord
          }
          if (!scopeStatus.line.writingStringLiteral && _currentWord.substr(0, 1) === '"') {
            jsLineAccumulator += ' ' + _currentWord;
            scopeStatus.line.writingStringLiteral = true;
          }

          if (scopeStatus.line.openingIfOrWhileLoop && !reservedWords.includes(thisWordSlug)) {
            if (scopeStatus.declaredFunctions.includes(helpers.slugify(_currentWord))) {
              scopeStatus.line.settingFunctionProps = true;
              jsLineAccumulator += '(';
            }
          }

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

          if (_currentWord.toLowerCase() === 'hasta' && nextWord === 'que') {
            scopeStatus.line.openingIfOrWhileLoop = true;
            jsLineAccumulator += 'while(';
          }

          // Comparisons < > >= <= != ==
          if (scopeStatus.line.openingIfOrWhileLoop) {
            if (
              _currentWord + ' ' + nextWord + ' ' + secondNextWord === 'sea tan alto' ||
              _currentWord + ' ' + nextWord + ' ' + secondNextWord === 'sea tan alta' ||
              _currentWord + ' ' + nextWord + ' ' + secondNextWord === 'era tan alto' ||
              _currentWord + ' ' + nextWord + ' ' + secondNextWord === 'era tan alta'
            ) {
              jsLineAccumulator += ' >=';
            }
            if (_currentWord + ' ' + nextWord + ' ' + secondNextWord === 'sea menor que')
              jsLineAccumulator += ' <';

            if (
              _currentWord + ' ' + nextWord + ' ' + secondNextWord + ' ' + _wordsCurrentLine[_wordIndex + 3] === 'es más grande que' ||
              _currentWord + ' ' + nextWord + ' ' + secondNextWord + ' ' + _wordsCurrentLine[_wordIndex + 3] === 'es mas grande que' // ||
              // _currentWord + ' ' + nextWord + ' ' + secondNextWord === 'es mayor que'
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
          if (
            (
              _currentWord.toLowerCase() === 'sube' ||
              _currentWord.toLowerCase() === 'crece'
            )
          ) {
            if (isVariable(nextWord, _currentWord, scopeStatus, reservedWords)) {
              jsLineAccumulator += helpers.slugify(nextWord) + '++';
              _wordsCurrentLine[_wordIndex + 1] = ''; // avoid rendering later
            }
            if (nextWord === '_' && isVariable(secondNextWord, nextWord, scopeStatus, reservedWords)) {
              jsLineAccumulator += helpers.slugify(secondNextWord) + '++';
              _wordsCurrentLine[_wordIndex + 1] = ''; // avoid rendering later
              _wordsCurrentLine[_wordIndex + 2] = ''; // avoid rendering later
            }
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
      jsLineAccumulator = '\t'.repeat(scopeStatus.tabulated) + jsLineAccumulator;

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
    fullJsTranscription = fullJsTranscription.replace(/  +/g, ' '); // remove duplicated spaces (not tab)
    fullJsTranscription = fullJsTranscription.replace(RegExp('\t', 'g'), '  '); // replace tabs with sapaces
    fullJsTranscription = fullJsTranscription.trim();
    fullJsTranscription = fullJsTranscription + '\n';

    resolve(fullJsTranscription);
  });
};

export { cumbionToJs }; // function.
