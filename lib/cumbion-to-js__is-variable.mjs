import { helpers } from './cumbion-to-js__helpers.mjs';

const uppercaseLetters = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';

/**
 * Recognize variables
 *
 * @return {boolean}
 */
const isVariable = (_word, _prevWord, _scopeStatus, _reservedWords) => {
  const thisWordSlug = helpers.slugify(_word);

  if (_word === '') return false;
  if (_reservedWords.includes(thisWordSlug)) return false;
  if (_word === 'más' || _word === 'mas') return false; // la más algo / el más algo or + (Math)

  if (uppercaseLetters.indexOf(_word.substr(0, 1)) > -1) return true;
  if (_prevWord === 'lxs') return true;
  if (_prevWord === '_') return true;
  if (_scopeStatus.declaredVariables.includes(thisWordSlug)) return true;
  return false;
};

export { isVariable };
