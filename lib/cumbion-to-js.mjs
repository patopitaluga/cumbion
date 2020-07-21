import { normalize } from './cumbion-to-js__normalize.mjs';
import { findKeywords } from './cumbion-to-js__find-keywords.mjs';
import { helpers } from './cumbion-to-js__helpers.mjs';

/**
 * Reads Cumbion code, returns javascript.
 *
 * @param {string} _rawCmnScript -
 * @return {Promise<string>}
 */
const cumbionToJs = (_rawCmnScript) => {
  if (typeof _rawCmnScript !== 'string') throw new Error('Param in cumbionToJs must be a string.');

  return new Promise((resolve, reject) => {
    const status = {
      line: {}, // will hold the status of opened structures, e.g. () in current line. Reseted in every loop.

      settingFunctionParams: 0,
      insideFunction: 0,

      declaredFunctions: [],
      declaredVariables: [],
      declaredArrays: [],
      accumulator: [],
      tabPos: 0,
    };

    /**
     * Normalize will turn all multiple word phrases that are outside string literals into single words.
     */
    _rawCmnScript = normalize(_rawCmnScript.trim());
    // console.log(_rawCmnScript); return; // to test normalizer
    let i = 0;
    let insideString = false;
    while (_rawCmnScript[i]) {
      if (_rawCmnScript[i] === '"') insideString = !insideString;
      if (!insideString && _rawCmnScript[i] === ' ')
        _rawCmnScript = _rawCmnScript.substr(0, i) + '—' + _rawCmnScript.substr(i + 1);
      i++;
    }
    let fullJsTranspilation = '';
    _rawCmnScript.split('\n').forEach((_thisCumbionLineStr, _cumbionLineIndex, _allLines) => {
      if (_thisCumbionLineStr.substr(0, 1) === '#' || status.line.ignoreNextLine) { // Ignore lines starting with comment.
        status.line.ignoreNextLine = false;
        return;
      }

      /* Reset the status of the previous line (it's opened (/[ ) */
      status.line.ignoreNextLine = false; // reset
      status.line.inComparison = false; // reset

      status.line.settingFunctionProps = 0; // reset // should be scalar because a function can be an argument of another function or console.log
      status.line.printing = 0; // reset
      status.line.settingVar = false; // reset
      // should be scalar because an array might be an element inside an array
      // can't be the same as settingFunctionProps because will check this to render the actually ".push("
      status.line.willBePushedToArray = 0; // reset
      status.line.referringArrayPosition = ''; // reset
      status.line.writingStringLiteral = false; // reset

      // console.log(tabPos, _thisCumbionLineStr);

      // Then intention was just to leave an empty line.
      // if (status.tabPos === 0)
      // helpers.addToPreviousWord(status, _thisCumbionLineStr);

      if (status.tabPos === 0 && _thisCumbionLineStr === '')
        helpers.newLine(status);
        //helpers.addToPreviousWord(status, status.accumulator[status.accumulator.length - 1].parts.length);
      /*if (
        status.tabPos === 0 && // if is tabulated was made to trigger the }
        status.accumulator[status.accumulator.length - 1].parts.length === 0
      ) {
        helpers.newLine(status);
      }*/

      /**
       * Parse every word of the line.
       */
      _thisCumbionLineStr.split('—').forEach((_currentWord, _wordIndex, _wordsCurrentLine) => {
        if (_currentWord !== '') {
          // String delimited with ""
          if (_currentWord.substr(0, 1) === '"')
            helpers.addToLine(status, _currentWord, true);

          // Outside literal strings, interpret every word to see if it's a keyword
          const wordsNextLine = (_allLines[_cumbionLineIndex + 1]) ? _allLines[_cumbionLineIndex + 1].split('—') : [];
          findKeywords(_wordIndex, _wordsCurrentLine, wordsNextLine, status);
        }
      }); // End parse words of each line

      /**
       * Before ending the line check if a ( is open because is setting a if/while loop or a function declaration.
       */
      while (status.line.settingFunctionProps > 0) {
        helpers.addToLine(status, ')', false);
        status.line.settingFunctionProps--;
      }
      while (status.line.printing > 0) {
        helpers.addToLine(status, ')', false);
        status.line.printing--;
      }
      while (status.line.willBePushedToArray > 0) {
        helpers.addToLine(status, ')', false);
        status.line.willBePushedToArray--;
      }
      if (status.line.inComparison) {
        status.accumulator[status.accumulator.length -1].parts[status.accumulator[status.accumulator.length -1].parts.length - 1].spaceRight = false;
        status.tabPos++;
        helpers.addToPreviousWord(status, ') {', false);
      }
      // If the line is empty, should close the if/while loop {}
      if (status.tabPos > 0) {
        if (
          _thisCumbionLineStr === '' ||
          _cumbionLineIndex === _allLines.length - 1 // if it's the last line should close the opened {
        ) {
          status.tabPos--;
          // status.tabPos--;
          helpers.newLine(status);
          //status.accumulator[status.accumulator.length -1].tabulated = status.tabPos - 1;
          helpers.addToLine(status, '}', false);
          // status.tabPos--;
          // 2 helpers.newLine(status);
        }
      }

      if (status.settingFunctionParams > 0) {
        helpers.addToPreviousWord(status, ') {', false);
        status.tabPos++;
      }

      // The status.tabulated should be incremented after setting
      // the tabulation for current line because otherwise will indent   while(
      /* if (status.line.inComparison) {
        status.tabPos++;
      }*/
      if (status.settingFunctionParams > 0) {
        status.settingFunctionParams--;
      }

      // ?
      if (status.tabPos > 0 && _cumbionLineIndex === _allLines.length - 1) {
        status.tabPos--;
        helpers.newLine(status);
        helpers.addToLine(status, '}', false);
        helpers.newLine(status);
      }
    }); // Ends the line foreach

    let str = '';
    // console.log(JSON.stringify(status.accumulator, null, 2));
    status.accumulator.forEach((_line, _index) => {
      if (status.accumulator[_index - 1] && _line.length === 0 && status.accumulator[_index - 1].length === 0) return;
      if (status.accumulator[_index].tabulated > 0)
        str += '  '.repeat(status.accumulator[_index].tabulated);
      // str += status.accumulator[_index].tabulated;
      _line.parts.forEach((_part, _partIndex) => {
        if (
          _line.parts[_partIndex - 1] &&
          _line.parts[_partIndex - 1].spaceRight &&
          _part.word !== ')' &&
          _part.word !== '('
        )
          str += ' ';
        str += _part.word;
      });
      // str += status.accumulator[_index].tabulated;
      str += '\n';
    });
    resolve(str);

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
