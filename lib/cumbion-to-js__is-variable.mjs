import { helpers } from './cumbion-to-js__helpers.mjs';
import { isReserved } from './cumbion-to-js__reserved-words.mjs';
import { reservedWords } from './cumbion-to-js__reserved-words.mjs';

const uppercaseLetters = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';

/**
 * Recognize variables
 *
 * @return {boolean}
 */
const isVariable = (_currentWordIndex, _line, _scopeStatus) => {
  const currentWord = _line[_currentWordIndex];
  const prevWord = _line[_currentWordIndex - 1];
  const nextWord = _line[_currentWordIndex + 1];
  const thisWordSlug = helpers.slugify(currentWord);

  if (currentWord === '') return false;
  if (currentWord.substr(0, 1) === '"' || currentWord.slice(-1) === '"') return false;
  if (_scopeStatus.line.writingStringLiteral) return false;
  if (isReserved(thisWordSlug)) return false;
  if (currentWord === 'más' || currentWord === 'mas') return false; // la más algo / el más algo or + (Math)

  if (prevWord === 'el') return true;
  if (prevWord === 'la') return true;
  if (prevWord === 'El') return true;
  if (prevWord === 'La') return true;

  // Possessive pronouns
  if (prevWord === 'mi') return true;
  if (prevWord === 'Mi') return true;
  if (prevWord === 'Tu') return true;
  if (prevWord === 'nuestro') return true;
  if (prevWord === 'Nuestro') return true;
  if (prevWord === 'nuestra') return true;
  if (prevWord === 'Nuestra') return true;
  if (prevWord === 'nuestre') return true;
  if (prevWord === 'Nuestre') return true;

  if (
    _currentWordIndex === 0 &&
    reservedWords.EQUAL.includes(nextWord)
  ) {
    return true;
  }

  if (uppercaseLetters.indexOf(currentWord.substr(0, 1)) > -1) return true;
  if (prevWord === 'lxs') return true;
  if (_scopeStatus.declaredVariables.includes(thisWordSlug)) return true;
  return false;
};

export { isVariable };
