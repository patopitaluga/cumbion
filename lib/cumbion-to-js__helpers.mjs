const helpers = {
  /**
   * Creates a slug given a string. E.g. 'Foo bar' will return 'foo-bar'.
   *
   * @param {string} _str -
   * @return {string}
   */
  slugify: (_str) => {
    _str = _str.replace(/^\s+|\s+$/g, ''); // trim
    _str = _str.toLowerCase();

    // remove accents, swap ñ for n, etc
    const from = 'áéíóúöüñ';
    const to   = 'aeiououn';
    for (let i = 0, l = from.length; i < l; i++) {
      _str = _str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }

    _str = _str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
      .replace(/\s+/g, '-') // collapse whitespace and replace by -
      .replace(/-+/g, '-'); // collapse dashes

    return _str;
  },

  /**
   *
   *
   * @param {string} _encodedString -
   * @return {string}
   */
  decodeEntities: (_encodedString) => {
    const translateRegEx = /&(nbsp|amp|quot|lt|gt);/g;
    const translate = {
      'nbsp': ' ',
      'amp': '&',
      'quot': '"',
      'lt': '<',
      'gt': '>',
    };
    return _encodedString.replace(translateRegEx, (match, _entity) => {
      return translate[_entity];
    })
      .replace(/&#(\d+);/gi, (match, numStr) => {
        const num = parseInt(numStr, 10);
        return String.fromCharCode(num);
      });
  },
};

export { helpers };
