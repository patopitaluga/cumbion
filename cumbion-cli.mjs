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
 *
 * To transpile a single line: node cumbion line + the cumbion snippet.
 *   node cumbion line Y dice! Cumbia más " cabeza"
 */
// const fs = require('fs');
import * as fs from 'fs';
// const path = require('path');
// import * as path from 'path';

import { cumbionToJs } from './lib/cumbion-to-js.mjs';
import { helpers } from './lib/cumbion-to-js__helpers.mjs';

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

  const fileContents = fs.readFileSync(filename, 'utf8');
  cumbionToJs(fileContents)
    .then((_result) => {
      if (process.argv[2] === 'run') {
        _result = _result.replace(RegExp('&', 'g'), '&amp;');

        try {
          eval(helpers.decodeEntities(_result));
        } catch (err) {
          console.log(err);
        }
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
