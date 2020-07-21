import { helpers } from '../lib/cumbion-to-js__helpers.mjs';
import { cumbionToJs } from '../lib/cumbion-to-js.mjs';
import * as fs from 'fs';
import * as path from 'path';

// __dirname missing when using --experimental-modules
import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 *
 */
const trimRight = (_str) => {
  if (!_str) return;

  while (_str.slice(-1) === ' ') {
    _str = _str.substr(0, _str.length -1);
  }
  return _str;
};

const testFindmax = function() {
  describe('Test findmax transpilation', function() {
    it('sample-findmax.cumbia should transpile to js', function(done) {
      const fileContents = fs.readFileSync(path.resolve(__dirname, '../sample-findmax.cumbia'), 'utf8');
      cumbionToJs(fileContents)
        .then(() => {
          done();
        })
        .catch((_err) => {
          done(_err);
        })
    })

    it('sample-findmax.cumbia should match js', function(done) {
      const fileContents = fs.readFileSync(path.resolve(__dirname, '../sample-findmax.cumbia'), 'utf8');
      cumbionToJs(fileContents)
        .then((_result) => {
          const expected = `let pibas = []
pibas.push(33)
pibas.push(526)
pibas.push(4433)
pibas[3] = 5
pibas[4] = 25
pibas.push(100)

let cumbia = 0
let mayor = 0
while(cumbia < pibas.length) {
  if (pibas[cumbia] > mayor) {
    mayor = pibas[cumbia]
  }
  cumbia++
}
console.log("El más grande de:")
console.log(pibas)
console.log("Es: ")
console.log(mayor)
`;
          const arExpected = expected.trim().split('\n');
          let allLinesEqual = true;
          let indexLineWithDifference = -1;
          let lineWithDifference = '';
          _result.trim().split('\n').forEach((_line, _index) => {
            if (trimRight(_line) !== trimRight(arExpected[_index])) {
              allLinesEqual = false;
              if (indexLineWithDifference === -1) {
                indexLineWithDifference = _index;
                lineWithDifference = _line;
              }
            }
          });
          if (allLinesEqual)
            done();
          else
            done(new Error(
              'Transpilation doesn\'t match expected js. ' +
              'Difference in line: ' + indexLineWithDifference + '. ' +
              'Got: ' + lineWithDifference + '. Expected: ' + arExpected[indexLineWithDifference]
            ));
        })
        .catch((_err) => {
          done(_err);
        })
    })
  })
};

export { testFindmax };
