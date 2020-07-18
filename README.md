![Cumbion Logo](https://patopitaluga.github.io/cumbion/images/cumbion-icon.png | width=100)

# Cumbion

Lenguaje de programación de tipado dinámico, Turing-completo, que es al mismo tiempo letras de cumbia.

*Read this in other languages: [English](README--en.md).*

------

**Probá el intérprete de javascript [en vivo](https://patopitaluga.github.io/cumbion/)**

------

[Documentación completa](https://github.com/patopitaluga/cumbion/blob/master/DOCUMENTATION.md)

------

## Ejemplos

### 'Hola mundo' en Cumbion
```
¡Y dice! "Hola mundo"
```

### FizzBuzz en Cumbion

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

#### Transpilación a javascript
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
