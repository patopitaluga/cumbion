import { normalize } from './cumbion-to-js__normalize.mjs';
import { findKeywords } from './cumbion-to-js__find-keywords.mjs';
import { helpers } from './cumbion-to-js__helpers.mjs';

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

    /**
     * Normalize will turn all multiple word phrases that are outside string literals into single words.
     */
    _cumbionCode = normalize(_cumbionCode.trim());
    // console.log(_cumbionCode); return; // to test normalizer

    /**
     * Parse line by line and accumulate a string.
     */
    let fullJsTranspilation = '';
    _cumbionCode.split('\n').forEach((_thisCumbionLineStr, _cumbionLineIndex, _allLines) => {

      if (_thisCumbionLineStr.substr(0, 1) === '#' || scopeStatus.line.ignoreNextLine) { // Ignore lines starting with comment.
        scopeStatus.line.ignoreNextLine = false;
        return;
      }

      /* Reset the status of the previous line (it's opened (/[ ) */
      scopeStatus.line.ignoreNextLine = false; // reset
      scopeStatus.line.inComparison = false; // reset

      scopeStatus.line.settingFunctionProps = 0; // reset // should be scalar because a function can be an argument of another function or console.log
      scopeStatus.line.printing = 0; // reset
      scopeStatus.line.settingVar = false; // reset
      // should be scalar because an array might be an element inside an array
      // can't be the same as settingFunctionProps because will check this to render the actually ".push("
      scopeStatus.line.willBePushedToArray = 0; // reset
      scopeStatus.line.referringArrayPosition = ''; // reset
      scopeStatus.line.writingStringLiteral = false; // reset

      /**
       * Parse every word of the line.
       */
      let jsLineAccumulator = '';
      _thisCumbionLineStr.split(' ').forEach((_currentWord, _wordIndex, _wordsCurrentLine) => {
        if (_currentWord !== '') {
          const isThisWordCapitalized = (uppercaseLetters.indexOf(_currentWord.substr(0, 1)) > -1);

          // String delimited with ""
          if ((_currentWord.match(/"/g) || []).length % 2 !== 0) scopeStatus.line.writingStringLiteral = !scopeStatus.line.writingStringLiteral;
          if (scopeStatus.line.writingStringLiteral) {
            jsLineAccumulator += ' ' + _currentWord;
          } else {
            if (_currentWord.slice(-1) === '"')
              jsLineAccumulator += ' ' + _currentWord;
          }

          // Outside literal strings, interpret every word to see if it's a keyword
          const wordsNextLine = (_allLines[_cumbionLineIndex + 1]) ? _allLines[_cumbionLineIndex + 1].split(' ') : [];
          jsLineAccumulator += findKeywords(_wordIndex, _wordsCurrentLine, wordsNextLine, scopeStatus);
        }
      }); // End parse words of each line

      /**
       * Before ending the line check if a ( is open because is setting a if/while loop or a function declaration.
       */
      while (scopeStatus.line.settingFunctionProps > 0) {
        jsLineAccumulator += ')';
        scopeStatus.line.settingFunctionProps--;
      }
      while (scopeStatus.line.printing > 0) {
        jsLineAccumulator += ')';
        scopeStatus.line.printing--;
      }
      while (scopeStatus.line.willBePushedToArray > 0) {
        jsLineAccumulator += ')';
        scopeStatus.line.willBePushedToArray--;
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
      jsLineAccumulator = '\t'.repeat(scopeStatus.tabulated) + helpers.trimLeft(jsLineAccumulator);

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
    fullJsTranspilation = fullJsTranspilation.replace(/\//g, '/ '); // should be a sepace in "/2" for example
    fullJsTranspilation = fullJsTranspilation.replace(/  +/g, ' '); // remove duplicated spaces (not tab)
    fullJsTranspilation = fullJsTranspilation.replace(RegExp('\t', 'g'), '  '); // replace tabs with sapaces
    fullJsTranspilation = fullJsTranspilation.trim();
    fullJsTranspilation = fullJsTranspilation + '\n';

    resolve(fullJsTranspilation);
  });
};

export { cumbionToJs }; // function.
