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
// import * as path from 'path';

import { cumbionToJs } from './lib/cumbion-to-js.mjs';

if (process.argv[2] === 'line') {
  let line = '';
  for (let i = 3; i < process.argv.length; i++) {
    line += ' ' + process.argv[i];
  }

  cumbionToJs(line.trim())
    .then((_result) => {
      console.log('');
      console.log(_result);
    })
    .catch((_err) => {
      console.log(_err);
    });
} else {
  let filename;
  if (!process.argv[2]) { console.log('Missing filename parameter. Run: "node cumbion yourscript.cumbia"'); process.exit(); }
  if (process.argv[2] === 'run') {
    if (!process.argv[3]) { console.log('Missing filename parameter. Run: "node cumbion run yourscript.cumbia"'); process.exit(); }
    filename = process.argv[3];
  } else {
    filename = process.argv[2];
  }

  try {
    fs.readFileSync(filename);
  } catch (err) {
    console.log('File "' + filename + '" not found.');
    process.exit();
  }

  const decodeEntities = (encodedString) => {
    var translateRe = /&(nbsp|amp|quot|lt|gt);/g;
    var translate = {
      'nbsp': ' ',
      'amp': '&',
      'quot': '"',
      'lt': '<',
      'gt': '>',
    };
    return encodedString.replace(translateRe, function(match, entity) {
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
        _result = _result.replace(RegExp('&', 'g'), '&amp;');

        // console.log(decodeEntities(_result))

        try {
          eval(decodeEntities(_result));
        } catch (err) {
          console.log(err);
        }

        /* const lines = _result.split('\n');
        lines.forEach((_line, _lineIndex) => {
          try {
            eval(_line);
          } catch(err) {
            console.log('Error in line ' + _lineIndex + ': ' + _line);
          }
        });*/
      } else {
        if (process.argv[3]) {
          if (process.argv[3].slice(-3) !== '.js') throw new Error(process.argv[3] + ' is not a proper output js file. Try "node cumbion yourscript.cumbia someoutputname.js"');
          fs.writeFileSync(process.argv[3], _result);
          console.log('Output js file generated: ' + process.argv[3]);
        } else {
          console.log('');
          console.log(_result);
        }
      }
    })
    .catch((_err) => {
      console.log(_err);
    });
}
