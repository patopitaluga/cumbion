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

const testFizzbuzz = function() {
  describe('Test fizzbuzz transpilation', function() {
    it('sample-fizzbuzz.cumbia should transpile to js', function(done) {
      const fileContents = fs.readFileSync(path.resolve(__dirname, '../sample-fizzbuzz.cumbia'), 'utf8');
      cumbionToJs(fileContents)
        .then(() => {
          done();
        })
        .catch((_err) => {
          done(_err);
        })
    })

    it('sample-fizzbuzz.cumbia should match js', function(done) {
      const fileContents = fs.readFileSync(path.resolve(__dirname, '../sample-fizzbuzz.cumbia'), 'utf8');
      cumbionToJs(fileContents)
        .then((_result) => {
          const expected = `let yo = function(licor, cerveza) {
  while(licor >= cerveza) {
    licor = licor - cerveza
  }
  return licor
}
let limite = 100
let cumbia = 0
let tano = 3
let laura = 5

while(cumbia != limite) {
  cumbia++
  if (yo(cumbia, tano) == 0 && yo(cumbia, laura) == 0) {
    console.log("FizzBuzz!")
    continue
  }
  if (yo(cumbia, tano) == 0) {
    console.log("Fizz!")
    continue
  }
  if (yo(cumbia, laura) == 0) {
    console.log("Buzz!")
    continue
  }
  console.log(cumbia)
}
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
              'Got: ' + lineWithDifference + '. Expected: ' + ((arExpected[indexLineWithDifference] === '') ? 'empty line' : arExpected[indexLineWithDifference])
            ));
        })
        .catch((_err) => {
          done(_err);
        })
    })
  })
};

export { testFizzbuzz };
