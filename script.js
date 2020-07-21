import { cumbionToJs } from './lib/cumbion-to-js.mjs';

/**
 * To read GET variables php style (kinda). Remember that this is a function, so it's not used $_GET[] but $_GET().
 *
 * @param {string} parameterName - The GET variable you're considering. E.g. if the url is sending ?q=1 you'll use $_GET('q').
 * @return {string|null} The value in that variable or null.
 */
const $_GET = function(parameterName) {
  /* global location*/
  var result = null;
  location.search
    .substr(1)
    .split('&')
    .forEach(function(foundGetVar) {
      var tmp = foundGetVar.split('=');
      if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
    });
  return result;
};

/**
 * .
 */
document.getElementById('transpile-button').onclick = () => {
  document.getElementById('output-title').innerHTML = 'Javascript transpilation:';
  cumbionToJs(document.getElementById('cumbioncode').value)
    .then((_result) => {
      document.getElementById('output').innerHTML = _result;
    })
    .catch((_err) => {
      console.log(_err);
    });
};

/**
 *
 */
/* const decodeEntities = (() => {
  // this prevents any overhead from creating the object each time
  var element = document.createElement('div');

  /**
   * Decore html entities.
   *
   * @param {string} str -
   * @return {string}
   */
/* function decodeHTMLEntities(str) {
    if (str && typeof str === 'string') {
      // strip script/html tags
      str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
      str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
      element.innerHTML = str;
      str = element.textContent;
      element.textContent = '';
    }
    return str;
  }

  return decodeHTMLEntities;
})(); */

const output = (_str) => {
  if (typeof _str === 'object')
    document.getElementById('output').innerHTML += JSON.stringify(_str) + '\n';
  else
    document.getElementById('output').innerHTML += _str + '\n';
};

const example1 = `Yo tomo licor
Yo tomo cerveza
Mientras el licor sea tan alto como la cerveza
El licor es el licor menos cerveza

¡Mandale licor!

El límite es 100
Cumbia Gratis!
El Tano es tres
Laura es linda

Mientras que la cumbia no sea el límite
Sube la cumbia
Si yo con la cumbia y El Tano somos 0 y yo con la cumbia y Laura somos 0
Y dice! "FizzBuzz!"
Wuki Wuki!

Si yo con la cumbia y El Tano somos 0
Y dice! "Fizz!"
Wuki Wuki!

Si yo con la cumbia y Laura somos 0
Y dice! "Buzz!"
Wuki Wuki!

Y dice! la cumbia
`;

if ($_GET('example') == 1)
  document.getElementById('cumbioncode').innerHTML = example1;

document.getElementById('examples').onchange = (_ev) => {
  if (Number(document.getElementById('examples').value) === 1)
    document.getElementById('cumbioncode').innerHTML = example1;
  if (Number(document.getElementById('examples').value) === 2)
    document.getElementById('cumbioncode').innerHTML = `Las pibas tienen cha cha
Las pibas tienen ganas de bailar
Las pibas tienen raka taka pum pum
La tres de las pibas es rocha
La 4 de las pibas es re cheta
Las pibas tienen 100

Cumbia Gratis!
Mayor Gratis!
Mientras la cumbia sea menor que las pibas
Si la cumbia de las pibas es más grande que el mayor
El mayor es la cumbia de las pibas
Pará!
Crece la cumbia!

Y dice! "El más grande de:"
Y dice! Las pibas!
Y dice! "Es: "
Y dice! Mayor!
`;
};

document.getElementById('run-button').onclick = () => {
  /* try {
    eval(String(document.getElementById('output').innerHTML));
  } catch(e) {
    var err = e.constructor('Error in Evaled Script: ' + e.message);
    // +3 because `err` has the line number of the `eval` line plus two.
    err.lineNumber = e.lineNumber - err.lineNumber + 3;
    throw err;
  }*/

  document.getElementById('output-title').innerHTML = 'Output:';
  document.getElementById('output').innerHTML = '';

  cumbionToJs(document.getElementById('cumbioncode').value)
    .then((_result) => {
      _result = _result.replace(RegExp('console.log', 'g'), 'output');
      eval(_result);
    })
    .catch((_err) => {
      output(_err);
    });

  // const scriptElement = document.createElement('script');
  // scriptElement.innerHTML = theScriptStr;
  // document.getElementsByTagName('body')[0].appendChild(scriptElement)
};
