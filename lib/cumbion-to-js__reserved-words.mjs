const reservedWords = {
  // BELONGSTOARRAY: ['de'], // sets that number as the index of an array <- this one might be the number 2 in some context
  DECREMENT: ['baja'], // --
  OUTPUT: ['dice'], // output
  DIVIDE: ['entre'], // divide (Math)
  EQUAL: ['es'], // =
  LISTEN: ['escucha'], // =
  ISZERO: ['gratis', 'gratis!', '¡gratis!'], // =
  ARRAY: ['lxs'], // is the let in an array definition
  RETURN: ['mandale'], // return
  MINUS: ['menos'], // - sign (Math)
  WHILE: ['mientras'], // while
  UNDEFINED: ['misteriose'], // undefined
  FALSE: ['ortiba'], // false
  TRUE: ['piola'], // true
  SET: ['pone'], // to set an already declared variable
  MULTIPLY: ['por'], // * (Math)
  CLOSECURLYBRACKET: ['para!', '¡para!', 'pará!', '¡pará!'], // Pará! to close a loop without letting an empty line (if it's actually "para" might be ignored anyway)
  IF: ['si'], // if
  INCREMENT: ['sube', 'crece'], // ++
  PUSHTOARRAY: ['tienen'], // is the [ in an array definition
  FUNCTIONPARAM: ['tomo', 'toma'], // function
  AND: ['y'],
  CONTINUE: ['wuki'],
}

/**
 * Check if it's a reserved word.
 *
 * @param {string} _str -
 */
const isReserved = (_str) => {
  for (let _ in reservedWords) {
    if (reservedWords[_].includes(_str)) return true;
  }
  return false;
};

export { isReserved, reservedWords };
