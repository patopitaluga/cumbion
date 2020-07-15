import { helpers } from './cumbion-to-js__helpers.mjs';

/**
 * Reads Cumbion code, returns javascript.
 *
 * @param {string} _cumbionCode -
 * @return {Promise<string>}
 */
const cumbionToJs = (_cumbionCode) => {
  if (typeof _cumbionCode !== 'string') throw new Error('Param in cumbionToJs must be a string.');

  return new Promise((resolve, reject) => {
    let jsScript = '';
    const uppercaseLetters = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';
    const reservedWords = ['Si', 'Mientras', 'Poné', 'Pone', 'Volvé', 'Volve', 'Vuelve', 'Sube', 'Wuki'];
    let wordsNextLine = [];
    let ignoreNextLine = false;
    let openingIfOrWhileLoop = false;
    let openingFunctionDeclaration = false;
    let insideLoop = 0;
    let insideFunctionDeclaration = false;
    let settingFunctionProps = false;
    const declaredFunctions = [];

    /**
     * Parse line by line.
     */
    const lines = _cumbionCode.split('\n');
    lines.forEach((_line, _lineIndex) => {
      /**
       * Sanitize line.
       */
      _line = ' ' + _line + ' ';
      _line = _line.replace(/,/g, '');
      _line = _line.replace(RegExp(' el ', 'g'), ' ');
      _line = _line.replace(RegExp(' la ', 'g'), ' ');
      _line = _line.replace(RegExp(' los ', 'g'), ' ');
      _line = _line.replace(RegExp(' las ', 'g'), ' ');
      _line = _line.replace(RegExp(' les ', 'g'), ' ');
      _line = _line.replace(RegExp(' El ', 'g'), ' ');
      _line = _line.replace(RegExp(' La ', 'g'), ' ');
      _line = _line.replace(RegExp(' Los ', 'g'), ' ');
      _line = _line.replace(RegExp(' Las ', 'g'), ' ');
      _line = _line.replace(RegExp(' Les ', 'g'), ' ');
      _line = _line.replace(RegExp(' ¡Y dice! ', 'g'), ' dice ');
      _line = _line.replace(RegExp(' ¡y dice! ', 'g'), ' dice ');
      _line = _line.replace(RegExp(' Y dice! ', 'g'), ' dice ');
      _line = _line.replace(RegExp(' y dice! ', 'g'), ' dice ');
      _line = _line.replace(RegExp(' y dice ', 'g'), ' dice ');
      _line = _line.replace(RegExp(' Wuki Wuki ', 'g'), ' wuki ');
      _line = _line.replace(RegExp(' Wuki Wuki! ', 'g'), ' wuki ');
      _line = _line.replace(RegExp(' Wuki! Wuki! ', 'g'), ' wuki ');
      _line = _line.replace(RegExp(' ¡Wuki! ¡Wuki! ', 'g'), ' wuki ');
      _line = _line.replace(RegExp('  ', 'g'), ' ');
      _line = _line.trim();

      /**
       * Useful variables
       */
      let codeLine = '';
      wordsNextLine = (lines[_lineIndex + 1]) ? lines[_lineIndex + 1].split(' ') : [];

      if (_line.substr(0, 1) === '#' || ignoreNextLine) { ignoreNextLine = false; return; } // Ignore lines starting with comment.
      ignoreNextLine = false;
      openingIfOrWhileLoop = false;
      openingFunctionDeclaration = false;
      settingFunctionProps = false;

      const words = _line.split(' ');
      let countWordsInLine = 0;
      words.forEach((_eachWord, _wordIndex) => {
        if (_eachWord !== '') {
          // if this is the first word and starts with uppercase is declaring a function or a variable.
          if (countWordsInLine === 0) {
            // Starting with uppercase
            if (uppercaseLetters.indexOf(_eachWord.substr(0, 1)) > -1) {
              // Followed by tomo is a function
              if (words[_wordIndex + 1] === 'tomo' || words[_wordIndex + 1] === 'toma') {
                openingFunctionDeclaration = true;
                insideFunctionDeclaration = true;
                codeLine += 'let ' + helpers.slugify(_eachWord) + ' =';
                declaredFunctions.push(helpers.slugify(_eachWord));
                codeLine += ' function(';
                codeLine += helpers.slugify(words[_wordIndex + 2]);
                words[_wordIndex + 2] = ''; // to avoid printing it as a variable name later.
                // check if previous line is defining same variable/function.
                if (wordsNextLine[0] === _eachWord && wordsNextLine[1] === 'tomo' || wordsNextLine[0] === _eachWord && wordsNextLine[1] === 'toma') {
                  codeLine += ', ' + helpers.slugify(wordsNextLine[2]);
                  ignoreNextLine = true;
                }
                _eachWord = ''; // to avoid printing it as a variable name later.
              }

              if (words[_wordIndex + 1] === 'es') {
                codeLine += 'let ' + helpers.slugify(_eachWord) + ' =';
                _eachWord = '';
              }
            }
            // While
            if (_eachWord.toLowerCase() === 'mientras') {
              openingIfOrWhileLoop = true;
              codeLine += 'while(';
            }
            // If
            if (_eachWord.toLowerCase() === 'si') {
              openingIfOrWhileLoop = true;
              codeLine += 'if (';
            }
            // increment
            if (_eachWord.toLowerCase() === 'sube' && uppercaseLetters.indexOf(words[_wordIndex + 1].substr(0, 1)) > -1) {
              codeLine += helpers.slugify(words[_wordIndex + 1]) + '++';
              words[_wordIndex + 1] = '';
            }
            if (_eachWord.toLowerCase() === 'dice') {
              settingFunctionProps = true;
              codeLine += 'console.log(';
            }
          }
          // Number
          if (_eachWord !== '' && !isNaN(_eachWord))
            codeLine += ' ' + _eachWord;
          // variable name
          if (_eachWord !== '' && uppercaseLetters.indexOf(_eachWord.substr(0, 1)) > -1 && !reservedWords.includes(_eachWord)) {
            codeLine += ' ' + helpers.slugify(_eachWord);
          }
          if (_eachWord.toLowerCase() === 'y') {
            if (settingFunctionProps)
              codeLine += ',';
            else
              codeLine += ' &&';
          }

          // String
          if (_eachWord.substr(0, 1) === '"' && _eachWord.slice(-1) === '"')
            codeLine += ' ' + _eachWord;

          //if (_eachWord.toLowerCase() === 'y') {
            //codeLine += '&&';
          //}
          if (openingIfOrWhileLoop && !reservedWords.includes(_eachWord)) {
            if (declaredFunctions.includes(helpers.slugify(_eachWord))) {
              settingFunctionProps = true;
              codeLine += '(';
            }
          }
          if (_eachWord.toLowerCase() === 'poné' || _eachWord.toLowerCase() === 'pone') {
            codeLine += helpers.slugify(words[words.length - 1]) + ' =';
            words[words.length - 1] = ''; // to avoid printint it as a variable name later.
          }
          if (_eachWord.toLowerCase() === 'volvé' || _eachWord.toLowerCase() === 'volve' || _eachWord.toLowerCase() === 'vuelve') {
            codeLine += 'return';
          }
          if (_eachWord.toLowerCase() === 'wuki') {
            codeLine += 'continue';
          }
          if (_eachWord.toLowerCase() === 'hasta' && words[_wordIndex + 1] === 'que') {
            openingIfOrWhileLoop = true;
            codeLine += 'while(';
          }
          if (openingIfOrWhileLoop) {
            if (
              _eachWord + ' ' + words[_wordIndex + 1] + ' ' + words[_wordIndex + 2] === 'es tan alto' ||
              _eachWord + ' ' + words[_wordIndex + 1] + ' ' + words[_wordIndex + 2] === 'es tan alta' ||
              _eachWord + ' ' + words[_wordIndex + 1] + ' ' + words[_wordIndex + 2] === 'era tan alto' ||
              _eachWord + ' ' + words[_wordIndex + 1] + ' ' + words[_wordIndex + 2] === 'era tan alta' ||
              _eachWord + ' ' + words[_wordIndex + 1] + ' ' + words[_wordIndex + 2] === 'sea tan alto' ||
              _eachWord + ' ' + words[_wordIndex + 1] + ' ' + words[_wordIndex + 2] === 'sea tan alta'
            ) {
              codeLine += ' >=';
            }
            if ((_eachWord === 'es' || _eachWord === 'somos') && words[_wordIndex + 1] !== 'tan') {
              if (settingFunctionProps) {
                codeLine += ')';
                settingFunctionProps = false;
              }
              codeLine += ' ==';
            }
          }

          if (_eachWord + ' ' + words[_wordIndex + 1] === 'no sea')
            codeLine += ' !=';

          if (_eachWord === 'menos') {
            codeLine += ' -';
          }
        }

        countWordsInLine++;
      });
      if (openingIfOrWhileLoop) {
        if (settingFunctionProps) {
          codeLine += ')';
          settingFunctionProps = false;
        }
        codeLine += ') {';
      }
      if (settingFunctionProps) {
        codeLine += ')';
        settingFunctionProps = false;
      }
      if (insideLoop) {
        if (_line === '') {
          codeLine += '}';
          insideLoop--;
        }
      } else {
        if (insideFunctionDeclaration) {
          if (_line === '' || _lineIndex === lines.length - 1) {
            codeLine += '}';
            insideFunctionDeclaration = false;
          }
        }
      }
      if (openingFunctionDeclaration) {
        codeLine += ') {\n';
      }
      codeLine = '  '.repeat(insideLoop) + codeLine;

      if (openingIfOrWhileLoop) {
        insideLoop++;
      }

      if (insideFunctionDeclaration && !openingFunctionDeclaration)
        codeLine = '  ' + codeLine;

      jsScript += codeLine + ((codeLine !== '' && !ignoreNextLine) ? '\n' : '');

      if (insideLoop > 0 && _lineIndex === lines.length - 1)
        jsScript += '}';
    });

    jsScript = jsScript.replace(RegExp('\\( ', 'g'), '(');
    // jsScript = jsScript.replace(RegExp(' ', 'g'), ' ');

    resolve(jsScript);
  });
};

export { cumbionToJs };
