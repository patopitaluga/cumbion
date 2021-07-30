import { normalize } from './cumbion-to-js__normalize.mjs'; // function
import { processLine } from './cumbion-to-js__process-line.mjs'; // function
import { newLine } from './cumbion-to-js__empty-line.mjs'; // stringified json

/**
 * Reads Cumbion code, returns javascript.
 *
 * @param {string} _rawCmnScript -
 * @return {Promise<string>}
 */
const cumbionToJs = (_rawCmnScript) => {
  if (typeof _rawCmnScript !== 'string') throw new Error('Argument in cumbionToJs must be a string.');

  /**
   * status object will hold the status of the full system.
   * E.g. if it's declaring a function, if it's inside an if, etc.
   */
  const status = {
    // will hold the status of opened structures, e.g. () in current status.line. Will be reset in every loop.
    line: JSON.parse(newLine),
    settingFunctionParams: 0,
    declaredFunctions: [],
    declaredVariables: [],
    declaredArrays: [],

    tabLevel: 0, // is easier to consider tabLevel as a property of the full status, then when a new part es added to the model it will hold current tabLevel;
    model: [], // model holds elements that represent every transpiled line as an object. A previous and more plastic state before writing the transpiled code to a string.

    /**
     * Parts are the components of the elements of the model.
     *
     * @return {string}
     */
    getPreviousPart: function() {
      return this.model[this.model.length - 1].parts[this.model[this.model.length - 1].parts.length - 1].word;
    },

    /**
     *
     * @param {?} _prop -
     * @param {?} _newVal -
     */
    setPreviousPart: function(_prop, _newVal) {
      this.model[this.model.length - 1].parts[this.model[this.model.length - 1].parts.length - 1][_prop] = _newVal;
    },

    /**
     * Previous element of the model.
     *
     * @return {object}
     */
    getPreviousElement: function() {
      if (this.model.length < 1) return {};
      return this.model[this.model.length - 1];
    },

    /**
     * Adds a new element to the code model array.
     *
     * @param {string} _wordOrSymbol -
     * @param {boolean} _spaceAfter - Some elements will be set with a space character to the right. For example ==, some not.
     * @param {object} _extraParams -
     */
    addToModel: function(_wordOrSymbol, _spaceAfter, _extraParams) {
      if (!_wordOrSymbol) return;
      if (!_extraParams) _extraParams = {};
      if (!this.model[this.model.length - 1]) status.addNewElementToModel();
      if (this.model[this.model.length - 1].full) status.addNewElementToModel();
      // eslint-disable-next-line guard-for-in
      for (let _eachExtra in _extraParams) {
        this.model[this.model.length - 1][_eachExtra] = _extraParams[_eachExtra];
      }
      this.model[this.model.length - 1].parts.push({
        word: _wordOrSymbol,
        spaceAfter: _spaceAfter,
      });
    },

    /**
     *
     * @param {number} _ref - (optional) to identify elements in the model for debugging.
     */
    finishLine: function(_ref) {
      if (!this.model[this.model.length - 1])
        status.addNewElementToModel();
      if (this.model[this.model.length - 1].parts.length > 0) {
        this.model[this.model.length - 1].ref = _ref; // does nothing but is useful to identify the part when debugging.
        this.model[this.model.length - 1].full = true;
      }
    },

    /**
     *
     */
    addNewElementToModel: function() {
      this.model.push({
        parts: [],
        tabulated: status.tabLevel,
        full: false,
      });
    },
  };

  return new Promise((resolve, reject) => {
    /**
     * Normalize will turn all multiple word phrases that are outside string literals into single words.
     */
    _rawCmnScript = normalize(_rawCmnScript.trim());

    /* Process line by line */
    _rawCmnScript.split('\n').forEach((_thisCumbionLineStr, _cumbionLineIndex, _allLines) => {
      processLine(status, _thisCumbionLineStr, _cumbionLineIndex, _allLines);
    });

    let str = '';
    // console.log(JSON.stringify(status.model, null, 2)); // output the model
    status.model.forEach((_line, _index) => {
      if (status.model[_index - 1] && _line.length === 0 && status.model[_index - 1].length === 0) return;
      if (status.model[_index].tabulated > 0)
        str += '  '.repeat(status.model[_index].tabulated);
      _line.parts.forEach((_part, _partIndex) => {
        if (
          _line.parts[_partIndex - 1] &&
          _line.parts[_partIndex - 1].spaceAfter &&
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
