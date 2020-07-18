import { helpers } from './cumbion-to-js__helpers.mjs';
import { isReserved } from './cumbion-to-js__reserved-words.mjs';

const uppercaseLetters = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';

/**
 * Recognize variables
 *
 * @return {boolean}
 */
const isVariable = (_word, _prevWord, _scopeStatus) => {
  const thisWordSlug = helpers.slugify(_word);

  if (_word === '') return false;
  if (_scopeStatus.line.writingStringLiteral) return false;
  if (isReserved(thisWordSlug)) return false;
  if (_word === 'más' || _word === 'mas') return false; // la más algo / el más algo or + (Math)

  if (_prevWord === 'el') return true;
  if (_prevWord === 'la') return true;
  if (_prevWord === 'El') return true;
  if (_prevWord === 'La') return true;

  // Possessive pronouns
  if (_prevWord === 'mi') return true;
  if (_prevWord === 'Mi') return true;
  if (_prevWord === 'Tu') return true;
  if (_prevWord === 'nuestro') return true;
  if (_prevWord === 'Nuestro') return true;
  if (_prevWord === 'nuestra') return true;
  if (_prevWord === 'Nuestra') return true;
  if (_prevWord === 'nuestre') return true;
  if (_prevWord === 'Nuestre') return true;

  if (uppercaseLetters.indexOf(_word.substr(0, 1)) > -1) return true;
  if (_prevWord === 'lxs') return true;
  if (_scopeStatus.declaredVariables.includes(thisWordSlug)) return true;
  return false;
};

export { isVariable };
