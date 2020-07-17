import { cumbionToJs } from './lib/cumbion-to-js.mjs';

document.getElementById('transcript-button').onclick = () => {
  cumbionToJs(document.getElementById('cumbioncode').value)
    .then((_result) => {
      document.getElementById('result').innerHTML = _result;
    })
    .catch((_err) => {
      console.log(_err);
    })
}

const decodeEntities = (() => {
  // this prevents any overhead from creating the object each time
  var element = document.createElement('div');

  function decodeHTMLEntities(str) {
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
})();

const output = (_str) => {
  document.getElementById('output').innerHTML += _str;
};

document.getElementById('example-findmax').onclick = () => {
  document.getElementById('cumbioncode').innerHTML = `Las pibas quieren cha cha
Las pibas tienen ganas de bailar
Las pibas tienen raka taka pum pum
Las pibas quieren rochas
Las pibas quieren chetas
Las pibas tienen 100

La cumbia no es nada
El mayor no es nada
Mientras la cumbia sea menor que las pibas
Crece la cumbia!
Si la cumbia de las pibas es más grande que el mayor
El mayor es la cumbia de las pibas


Y dice! Mayor!
`;
};

document.getElementById('run-button').onclick = () => {
  /* try {
    eval(String(document.getElementById('result').innerHTML));
  } catch(e) {
    var err = e.constructor('Error in Evaled Script: ' + e.message);
    // +3 because `err` has the line number of the `eval` line plus two.
    err.lineNumber = e.lineNumber - err.lineNumber + 3;
    throw err;
  }*/
  document.getElementById('output').innerHTML = '';
  let theScriptStr = '';
  theScriptStr += decodeEntities(document.getElementById('result').innerHTML);
  theScriptStr = theScriptStr.replace(RegExp('console.log', 'g'), 'output');

  eval(theScriptStr);

  // const scriptElement = document.createElement('script');
  // scriptElement.innerHTML = theScriptStr;
  // document.getElementsByTagName('body')[0].appendChild(scriptElement)
}
