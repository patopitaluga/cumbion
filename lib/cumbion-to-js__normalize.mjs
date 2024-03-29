import { reservedWords } from './cumbion-to-js__reserved-words.mjs';

/**
 * Find variables in the full script and normalize all of them.
 * This function will not interact directly with the traspiler acc string variable.
 *
 * @param {string} _ -
 * @return {string}
 */
const normalize = (_) => {
  let literalString = false;
  let nextWordIsVariable = false;
  let normalizedTextAccumulator = '';
  _.split('\n').forEach((_thisCumbionLineStr, _cumbionLineIndex, _allLines) => {
    let lineacc = '';
    let spaceButNotAtBeginning = '';

    _thisCumbionLineStr.split(' ').forEach((_currentWord, _wordIndex, _wordsCurrentLine) => {
      // Trimmed because might be at the end of the line before the /n
      _currentWord = _currentWord.trim();

      if ((_currentWord.match(/"/g) || []).length % 2 !== 0) literalString = !literalString;

      if (!literalString) {
        // Numbers as words
        if (_currentWord === 'uno')    { _currentWord = '1'; nextWordIsVariable = false; }
        if (_currentWord === 'dos')    { _currentWord = '2'; nextWordIsVariable = false; }
        if (_currentWord === 'tres')   { _currentWord = '3'; nextWordIsVariable = false; }
        if (_currentWord === 'cuatro') { _currentWord = '4'; nextWordIsVariable = false; }
        if (_currentWord === 'cinco')  { _currentWord = '5'; nextWordIsVariable = false; }
        if (_currentWord === 'seis')   { _currentWord = '6'; nextWordIsVariable = false; }
        if (_currentWord === 'siete')  { _currentWord = '7'; nextWordIsVariable = false; }
        if (_currentWord === 'ocho')   { _currentWord = '8'; nextWordIsVariable = false; }
        if (_currentWord === 'nueve')  { _currentWord = '9'; nextWordIsVariable = false; }

        if (_currentWord === 'los') _currentWord = reservedWords.ARRAY[0];
        if (_currentWord === 'las') _currentWord = reservedWords.ARRAY[0];
        if (_currentWord === 'les') _currentWord = reservedWords.ARRAY[0];
        if (_currentWord === 'Los') _currentWord = reservedWords.ARRAY[0];
        if (_currentWord === 'Las') _currentWord = reservedWords.ARRAY[0];
        if (_currentWord === 'Les') _currentWord = reservedWords.ARRAY[0];
        if (_currentWord === 'mis') _currentWord = reservedWords.ARRAY[0];
        if (_currentWord === 'Mis') _currentWord = reservedWords.ARRAY[0];
        if (_currentWord === 'tus') _currentWord = reservedWords.ARRAY[0];
        if (_currentWord === 'Tus') _currentWord = reservedWords.ARRAY[0];
      }

      if (nextWordIsVariable) {
        nextWordIsVariable = false;
        lineacc += ' ' + _currentWord.substr(0, 1).toUpperCase() + _currentWord.substr(1);
        spaceButNotAtBeginning = ' ';
        return;
      }

      // nextWordIsVariable assigned after checkd to act on the next loop iterarion (next word)
      if (_currentWord === 'el') { nextWordIsVariable = true; return; }
      if (_currentWord === 'la') { nextWordIsVariable = true; return; }
      if (_currentWord === 'El') { nextWordIsVariable = true; return; }
      if (_currentWord === 'La') { nextWordIsVariable = true; return; }

      if (_currentWord === 'Una') { nextWordIsVariable = true; return; }
      if (_currentWord === 'Un') { nextWordIsVariable = true; return; }
      if (_currentWord === 'Une') { nextWordIsVariable = true; return; }
      if (_currentWord === 'una') { nextWordIsVariable = true; return; }
      if (_currentWord === 'un') { nextWordIsVariable = true; return; }
      if (_currentWord === 'une') { nextWordIsVariable = true; return; }

      // Possessive pronouns
      if (_currentWord === 'mi') { nextWordIsVariable = true; return; }
      if (_currentWord === 'Mi') { nextWordIsVariable = true; return; }
      if (_currentWord === 'Tu') { nextWordIsVariable = true; return; }
      if (_currentWord === 'nuestro') { nextWordIsVariable = true; return; }
      if (_currentWord === 'Nuestro') { nextWordIsVariable = true; return; }
      if (_currentWord === 'nuestra') { nextWordIsVariable = true; return; }
      if (_currentWord === 'Nuestra') { nextWordIsVariable = true; return; }
      if (_currentWord === 'nuestre') { nextWordIsVariable = true; return; }
      if (_currentWord === 'Nuestre') { nextWordIsVariable = true; return; }

      lineacc += spaceButNotAtBeginning + _currentWord;
      spaceButNotAtBeginning = ' ';

      if (!literalString) {
        if (_currentWord === 'separa' && _wordsCurrentLine[_wordIndex - 1] === 'me')
          lineacc = lineacc.substr(0, lineacc.lastIndexOf('me separa')) + 'entre';

        if (_wordIndex === 1) { // just at the beggining of the line (actually the second word is "dice")
          if (lineacc.startsWith('¡Y dice!')) lineacc = lineacc.replace('¡Y dice!', reservedWords.OUTPUT[0]);
          if (lineacc.startsWith('Y dice!'))  lineacc = lineacc.replace('Y dice!', reservedWords.OUTPUT[0]);
          if (lineacc.startsWith('¡y dice!')) lineacc = lineacc.replace('¡y dice!', reservedWords.OUTPUT[0]);
          if (lineacc.startsWith('y dice!')) lineacc = lineacc.replace('y dice!', reservedWords.OUTPUT[0]);
        }
      }
    }); // end parse words

    normalizedTextAccumulator += lineacc.trim() + '\n';
  });

  let i = 0;
  let insideString = false;
  while (normalizedTextAccumulator[i]) {
    if (normalizedTextAccumulator[i] === '"') insideString = !insideString;
    if (!insideString && normalizedTextAccumulator[i] === ' ')
      normalizedTextAccumulator = normalizedTextAccumulator.substr(0, i) + '—' + normalizedTextAccumulator.substr(i + 1);
    i++;
  }

  return normalizedTextAccumulator;
};

export { normalize };
