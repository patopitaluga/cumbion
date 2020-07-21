const helpers = {
  slugify: (str) => {
    str = str.replace(/^\s+|\s+$/g, ''); // trim
    str = str.toLowerCase();

    // remove accents, swap ñ for n, etc
    let from = 'áéíóúöüñ';
    let to   = 'aeiououn';
    for (let i = 0, l = from.length ; i < l; i++) {
      str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }

    str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
      .replace(/\s+/g, '-') // collapse whitespace and replace by -
      .replace(/-+/g, '-'); // collapse dashes

    return str;
  },

  /**
   *
   */
  trimLeft: (_str) => {
    if (_str === ' ') return _str; // if the full word is an space let it be.

    while (_str.substr(0, 1) === ' ') {
      _str = _str.substr(1);
    }
    return _str;
  },

  /**
   *
   */
  trimRight: (_str) => {
    while (_str.slice(-1) === ' ') {
      _str = _str.substr(0, _str.length -1);
    }
    return _str;
  },

  addToLine: (_status, _, _spaceRight) => {
    if (!_status.accumulator[_status.accumulator.length - 1]) helpers.newLine(_status);
    _status.accumulator[_status.accumulator.length - 1].parts.push({
      word: _,
      spaceRight: _spaceRight,
    });
  },

  addToPreviousWord: (_status, _) => {
    helpers.addToLine(_status, _, false);

    /*_status.accumulator[_status.accumulator.length - 1].parts[
      _status.accumulator[_status.accumulator.length - 1].parts.length - 1
    ].word += _;*/
  },

  newLine: (_status) => {
    let prevTabulated = 0;
    _status.accumulator.push({
      parts: [],
      tabulated: _status.tabPos,
    });
  },
};

export { helpers };
