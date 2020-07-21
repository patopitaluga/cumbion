import { helpers } from './cumbion-to-js__helpers.mjs';
import { isVariable } from './cumbion-to-js__is-variable.mjs';
import { isReserved } from './cumbion-to-js__reserved-words.mjs';

/**
 * Handle numbers.
 *
 * @param {number} _wordIndex -
 * @param {array} _wordsCurrentLine -
 * @param {object} _status -
 * @return {string}
 */
const handleNumbers = (_wordIndex, _wordsCurrentLine, _status) => {
  let jsNumberHandleAccumulator = '';
  const currentWord = _wordsCurrentLine[_wordIndex];
  const thisWordSlug = helpers.slugify(currentWord);
  const prevWord = _wordsCurrentLine[_wordIndex - 1];
  const nextWord = _wordsCurrentLine[_wordIndex + 1];
  const secondNextWord = _wordsCurrentLine[_wordIndex + 2];

  // Number
  if (
    // !_status.line.writingStringLiteral && is already check in findKeywords before calling this
    (currentWord.slice(-1) !== '"') &&
    (_status.line.settingVar || _status.line.printing) &&
    !isReserved(thisWordSlug) &&
    !isVariable(_wordIndex, _wordsCurrentLine, _status) &&
    isNaN(currentWord) &&
    (currentWord !== 'más' && currentWord !== 'mas') && // la más linda / el más lindo
    (currentWord !== 'de' || !_status.line.referringArrayPosition)
  ) {
    helpers.addToLine(_status, currentWord.length, true);
    jsNumberHandleAccumulator += currentWord.length; // not using ' ' as prefix because might concatenate next word/number
  }

  // Is actually a literal number. E.g.: 100
  if (!isNaN(currentWord)) {
    if (nextWord === 'de' && secondNextWord === 'lxs') {
      _status.line.referringArrayPosition = thisWordSlug;
    } else {
      helpers.addToLine(_status, currentWord, true);
      jsNumberHandleAccumulator += ' ' + currentWord; // actually rendering the variable name.
    }
  }

  return jsNumberHandleAccumulator;
};

export { handleNumbers };
