import { helpers } from './cumbion-to-js__helpers.mjs';
import { isVariable } from './cumbion-to-js__is-variable.mjs';
import { isReserved } from './cumbion-to-js__reserved-words.mjs';

/**
 * Handle numbers.
 *
 * @param {number} _wordIndex -
 * @param {array} _wordsCurrentLine -
 * @param {object} status -
 */
const handleNumbers = (_wordIndex, _wordsCurrentLine, status) => {
  const currentWord = _wordsCurrentLine[_wordIndex];
  const thisWordSlug = helpers.slugify(currentWord);
  const nextWord = _wordsCurrentLine[_wordIndex + 1];
  const secondNextWord = _wordsCurrentLine[_wordIndex + 2];

  // Number
  if (
    // !status.line.writingStringLiteral && is already check in findKeywords before calling this
    (currentWord.slice(-1) !== '"') &&
    (status.line.rightSideOfDeclaration || status.line.printing) &&
    !isReserved(thisWordSlug) &&
    !isVariable(_wordIndex, _wordsCurrentLine, status) &&
    isNaN(currentWord) &&
    (currentWord !== 'más' && currentWord !== 'mas') && // la más linda / el más lindo
    (currentWord !== 'de' || !status.line.referringArrayPosition)
  ) {
    if (!isNaN(status.getPreviousPart()))
      status.setPreviousPart('spaceAfter', false);
    status.addToModel(currentWord.length, true);
  }

  // Is actually a literal number. E.g.: 100
  if (!isNaN(currentWord)) {
    if (nextWord === 'de' && secondNextWord === 'lxs') {
      status.line.referringArrayPosition = thisWordSlug;
    } else {
      status.addToModel(currentWord, true);
    }
  }
};

export { handleNumbers };
