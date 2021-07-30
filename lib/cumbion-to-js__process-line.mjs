import { findKeywords } from './cumbion-to-js__find-keywords.mjs';
import { newLine } from './cumbion-to-js__empty-line.mjs';

const processLine = (_status, _thisCumbionLineStr, _cumbionLineIndex, _allLines) => {
  if (_thisCumbionLineStr.substr(0, 1) === '#' || _status.line.ignoreNextLine) { // Ignore lines starting with comment.
    _status.line.ignoreNextLine = false;
    return;
  }

  /* Reset the _status of the previous line (it's opened (/[ ) */
  _status.line = JSON.parse(newLine);

  _status.finishLine();
  if (_status.tabLevel === 0 && _thisCumbionLineStr === '') {
    _status.addNewElementToModel();
    _status.model[_status.model.length - 1].full = true;
  }

  /* Parse every word of the _status.line. */
  _thisCumbionLineStr.split('—').forEach((_currentWord, _wordIndex, _wordsCurrentLine) => {
    if (_currentWord !== '') {
      // String delimited with ""
      if (_currentWord.substr(0, 1) === '"')
        _status.addToModel(_currentWord, true);

      // Outside literal strings, interpret every word to see if it's a keyword
      const wordsNextLine = (_allLines[_cumbionLineIndex + 1]) ? _allLines[_cumbionLineIndex + 1].split('—') : [];
      findKeywords(_wordIndex, _wordsCurrentLine, wordsNextLine, _status);
    }
  }); // End parse words of each line

  /**
   * Before ending the line check if a ( is open because is setting a if/while loop or a function declaration.
   */
  while (_status.line.settingFunctionProps > 0) {
    _status.addToModel(')', false);
    _status.line.settingFunctionProps--;
  }
  while (_status.line.printing > 0) {
    _status.addToModel(')', false);
    _status.line.printing--;
  }
  while (_status.line.willBePushedToArray > 0) {
    _status.addToModel(')', false);
    // console.log(_status.model[_status.model.length - 1])
    _status.finishLine();
    _status.line.willBePushedToArray--;
  }
  if (_status.line.inComparison) {
    _status.setPreviousPart('spaceAfter', false);
    _status.tabLevel++;
    _status.addToModel(') {', false);
  }
  // If the line is empty, should close the if/while loop {}
  if (_status.tabLevel > 0) {
    if (
      _thisCumbionLineStr === '' ||
      _cumbionLineIndex === _allLines.length - 1 // if it's the last line should close the opened {
    ) {
      _status.tabLevel--;
      _status.finishLine();
      _status.addToModel('}', false);
    }
  }

  if (_status.settingFunctionParams > 0) {
    _status.addToModel(') {', false); // closing setting function param
    _status.tabLevel++; // is tabulated because it's inside the function
    _status.settingFunctionParams--;
  }

  // The _status.tabulated should be incremented after setting
  // the tabulation for current line because otherwise will indent   while(
  /* if (_status.line.inComparison) {
    _status.tabLevel++;
  }*/

  // ?
  if (_status.tabLevel > 0 && _cumbionLineIndex === _allLines.length - 1) {
    _status.tabLevel--;
    _status.finishLine();
    _status.addToModel('}', false);
    _status.finishLine();
  }
};

export { processLine }; // function.
