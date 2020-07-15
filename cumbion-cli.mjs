/**
 * Cumbion to javascript transpiler terminal client.
 *
 * To see the js code:
 *   node cumbion yourscript.cumbia
 *
 * To see run the js transpiled code:
 *   node cumbion run yourscript.cumbia
 *
 * To export the js code to a file:
 *   node cumbion yourscript.cumbia thetargetfile.js
 */
// const fs = require('fs');
import * as fs from 'fs';
// const path = require('path');
import * as path from 'path';

import { cumbionToJs } from './lib/cumbion-to-js.mjs';

let filename;
if (!process.argv[2]) { console.log('Missing filename parameter. Run: "node cumbion yourscript.cumbia"'); process.exit(); }
if (process.argv[2] === 'run') {
  if (!process.argv[3]) { console.log('Missing filename parameter. Run: "node cumbion run yourscript.cumbia"'); process.exit(); }
  filename = process.argv[3];
} else {
  filename = process.argv[2];
}

try {
  const doesThisFileExists = fs.readFileSync(filename);
} catch(err) {
  console.log('File "' + filename + '" not found.');
  process.exit();
}

const decodeEntities = (encodedString) => {
  var translate_re = /&(nbsp|amp|quot|lt|gt);/g;
  var translate = {
    'nbsp': ' ',
    'amp' : '&',
    'quot': '"',
    'lt'  : '<',
    'gt'  : '>',
  };
  return encodedString.replace(translate_re, function(match, entity) {
    return translate[entity];
  }).replace(/&#(\d+);/gi, function(match, numStr) {
    var num = parseInt(numStr, 10);
    return String.fromCharCode(num);
  });
};

const fileContents = fs.readFileSync(filename, 'utf8');
cumbionToJs(fileContents)
  .then((_result) => {
    if (process.argv[2] === 'run') {
      _result = _result.replace(RegExp('\&', 'g'), '&amp;');

      // console.log(decodeEntities(_result))

      try {
        eval(decodeEntities(_result));
      } catch(err) {
        console.log(err);
      }

      /*const lines = _result.split('\n');
      lines.forEach((_line, _lineIndex) => {
        try {
          eval(_line);
        } catch(err) {
          console.log('Error in line ' + _lineIndex + ': ' + _line);
        }
      });*/
    } else {
      console.log('');
      console.log(_result);
      console.log('');
    }
  })
  .catch((_err) => {
    console.log(_err);
  });
