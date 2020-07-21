import { normalize } from './cumbion-to-js__normalize.mjs';
import { findKeywords } from './cumbion-to-js__find-keywords.mjs';

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

      declaredFunctions: [],
      declaredVariables: [],
      declaredArrays: [],
      acc: {
        lines: [],
        getPreviousPart: function() {
          return this.lines[this.lines.length - 1].parts[this.lines[this.lines.length - 1].parts.length - 1].word;
        },
        setPreviousPart: function(_prop, _newVal) {
          this.lines[this.lines.length - 1].parts[this.lines[this.lines.length - 1].parts.length - 1][_prop] = _newVal;
        },
        addToLine: function(_, _spaceRight) {
          if (_ === '') return;
          if (!this.lines[this.lines.length - 1]) status.acc.newLine();
          if (this.lines[this.lines.length - 1].full) status.acc.newLine();
          this.lines[this.lines.length - 1].parts.push({
            word: _,
            spaceRight: _spaceRight,
          });
        },
        finishLine: function(_ref) {
          if (!this.lines[this.lines.length - 1]) status.acc.newLine();
          if (this.lines[this.lines.length - 1].parts.length > 0) {
            this.lines[this.lines.length - 1].ref = _ref;
            this.lines[this.lines.length - 1].full = true;
          }
        },
        newLine: function() {
          this.lines.push({
            parts: [],
            tabulated: status.tabPos,
          });
        },
      },
      tabPos: 0,
    };

    /**
     * Normalize will turn all multiple word phrases that are outside string literals into single words.
     */
    _rawCmnScript = normalize(_rawCmnScript.trim());

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
      status.line.rightSideOfDeclaration = false; // reset
      // should be scalar because an array might be an element inside an array
      // can't be the same as settingFunctionProps because will check this to render the actually ".push("
      status.line.willBePushedToArray = 0; // reset
      status.line.referringArrayPosition = ''; // reset
      status.line.writingStringLiteral = false; // reset

      status.acc.finishLine();
      if (status.tabPos === 0 && _thisCumbionLineStr === '') {
        status.acc.newLine();
        status.acc.lines[status.acc.lines.length - 1].full = true;
      }

      /* Parse every word of the line. */
      _thisCumbionLineStr.split('—').forEach((_currentWord, _wordIndex, _wordsCurrentLine) => {
        if (_currentWord !== '') {
          // String delimited with ""
          if (_currentWord.substr(0, 1) === '"')
            status.acc.addToLine(_currentWord, true);

          // Outside literal strings, interpret every word to see if it's a keyword
          const wordsNextLine = (_allLines[_cumbionLineIndex + 1]) ? _allLines[_cumbionLineIndex + 1].split('—') : [];
          findKeywords(_wordIndex, _wordsCurrentLine, wordsNextLine, status);
        }
      }); // End parse words of each line

      /**
       * Before ending the line check if a ( is open because is setting a if/while loop or a function declaration.
       */
      while (status.line.settingFunctionProps > 0) {
        status.acc.addToLine(')', false);
        status.line.settingFunctionProps--;
      }
      while (status.line.printing > 0) {
        status.acc.addToLine(')', false);
        status.line.printing--;
      }
      while (status.line.willBePushedToArray > 0) {
        status.acc.addToLine(')', false);
        // console.log(status.acc.lines[status.acc.lines.length - 1])
        status.acc.finishLine();
        status.line.willBePushedToArray--;
      }
      if (status.line.inComparison) {
        status.acc.setPreviousPart('spaceRight', false);
        status.tabPos++;
        status.acc.addToLine(') {', false, true);
      }
      // If the line is empty, should close the if/while loop {}
      if (status.tabPos > 0) {
        if (
          _thisCumbionLineStr === '' ||
          _cumbionLineIndex === _allLines.length - 1 // if it's the last line should close the opened {
        ) {
          status.tabPos--;
          status.acc.finishLine();
          status.acc.addToLine('}', false);
        }
      }

      if (status.settingFunctionParams > 0) {
        status.acc.addToLine(') {', false);
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
        status.acc.finishLine();
        status.acc.addToLine('}', false);
        status.acc.finishLine();
      }
    }); // Ends the line foreach

    let str = '';
    // console.log(JSON.stringify(status.acc.lines, null, 2))
    status.acc.lines.forEach((_line, _index) => {
      if (status.acc.lines[_index - 1] && _line.length === 0 && status.acc.lines[_index - 1].length === 0) return;
      if (status.acc.lines[_index].tabulated > 0)
        str += '  '.repeat(status.acc.lines[_index].tabulated);
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
      str += '\n';
    });
    resolve(str);
  });
};

export { cumbionToJs }; // function.
