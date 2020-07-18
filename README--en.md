![Cumbion Logo](https://patopitaluga.github.io/cumbion/images/cumbion-gh-title.png)

Dynamically typed Turing-complete programming language that's also cumbia lyrics.

*Read this in other languages: [Español](README.md).*

------

**Check the javascript interpreter [live](https://patopitaluga.github.io/cumbion/)**

------

[Full documentation (spanish)](https://github.com/patopitaluga/cumbion/blob/master/DOCUMENTATION.md)

------

## Examples

### 'Hello, World' in Cumbion
```
¡Y dice! "Hello World"
```

### FizzBuzz in Cumbion

```
Yo tomo licor
Yo tomo cerveza
Mientras el licor sea tan alto como la cerveza
El licor es el licor menos cerveza

¡Mandale licor!

El límite es 100
La cumbia no es nada
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
```

#### Javascript transpilation
```
let yo = function(licor, cerveza) {
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
```

------

Inspired by: https://codewithrockstar.com/
