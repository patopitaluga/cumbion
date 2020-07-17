import { helpers } from './cumbion-to-js__helpers.mjs';
import { isVariable } from './cumbion-to-js__is-variable.mjs';
import { reservedWords } from './cumbion-to-js__reserved-words.mjs';

const uppercaseLetters = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';

/**
 * Handle numbers.
 *
 * @param {number} _wordIndex -
 * @param {string} _currentWord -
 * @param {array} _wordsCurrentLine -
 * @param {object} _scopeStatus -
 * @return {string}
 */
const handleNumbers = (_wordIndex, _currentWord, _wordsCurrentLine, _scopeStatus) => {
  let jsNumberHandleAccumulator = '';
  const thisWordSlug = helpers.slugify(_currentWord);
  const isThisWordCapitalized = (uppercaseLetters.indexOf(_currentWord.substr(0, 1)) > -1);
  const prevWord = _wordsCurrentLine[_wordIndex - 1];
  const nextWord = _wordsCurrentLine[_wordIndex + 1];
  const secondNextWord = _wordsCurrentLine[_wordIndex + 2];

  // Number
  if (
    _currentWord !== '_' && // not article
    _scopeStatus.line.settingVar &&
    !reservedWords.includes(thisWordSlug) &&
    !isVariable(_currentWord, prevWord, _scopeStatus, reservedWords) &&
    !isThisWordCapitalized && isNaN(_currentWord) &&
    (_currentWord !== 'más' && _currentWord !== 'mas') && // la más linda / el más lindo
    (_currentWord !== 'de' || !_scopeStatus.line.referringArrayPosition)
  ) {
    jsNumberHandleAccumulator += _currentWord.length; // not using ' ' as prefix because might concatenate next word/number
  }

  // Is actually a literal number. E.g.: 100
  if (!isNaN(_currentWord)) {
    if (nextWord === 'de' && secondNextWord === 'lxs')
      _scopeStatus.line.referringArrayPosition = thisWordSlug;
    else
      jsNumberHandleAccumulator += ' ' + _currentWord; // actually rendering the variable name.
  }

  if (_currentWord === '+') jsNumberHandleAccumulator += ' +';
  if (_currentWord === '-') jsNumberHandleAccumulator += ' -';
  if (_currentWord === '*') jsNumberHandleAccumulator += ' *';
  if (_currentWord === '/') jsNumberHandleAccumulator += ' /';

  if (_currentWord === 'piola') jsNumberHandleAccumulator += ' true';
  if (_currentWord === 'ortiba') jsNumberHandleAccumulator += ' false';

  if (_currentWord === 'misterioso') jsNumberHandleAccumulator += ' undefined';
  if (_currentWord === 'misteriosa') jsNumberHandleAccumulator += ' undefined';

  return jsNumberHandleAccumulator;
};

export { handleNumbers };
