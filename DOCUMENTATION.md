# Cumbion

Lenguaje de programación de de tipado dinámico, Turing-completo, que es al mismo tiempo letras de cumbia.

**Probá el intérprete de javascript [en vivo](https://patopitaluga.github.io/cumbion/)**

## Documentación

### Formato de archivos

Los scripts de Cumbion son archivos de texto UTF-8 con la extensión .cumbia

### Comentarios

El símbolo #
```
# Este es un comentario, toda esta línea será ignorada por el compilador de Cumbion.
```

### Variables
Se consideran variables cualquier identificador que comience con mayúscula o que esté precedido por un artículo y que no sea una palabra reservada del lenguaje. Solo pueden contener letras, sin espacios. No se permiten guiones ni números porque no se pueden cantar. Los nombres de variables no diferencian mayúsculas de minúsculas.

**Una vez definida la variable, los artículos el/la/le en singular y los pronombres posesivos mi/tu/nuestro/nuestra serán ignorados. 'La Cerveza' es considerada la misma variable que 'Cerveza' y 'La Pollera' es considerada la misma variable que 'Mi Pollera'.**

Se recomiendan nombres propios cumbiancheros.

```
La cumbia es 20
Laura es una diosa
El baile es cumbia más Laura
¡Y dice! Baile

# define la variable "cumbia" y le asigna el valor 20
# define la variable "laura" y le asigna el valor 35 considerando 3 y 5 por la cantidad de letras de "una" y "diosa"
# define la variable "baile" y le asigna la suma del número 6 y la variable Laura
# imprime la variable "baile"
```

Las variables son dinámicamente tipadas, se declaran automáticamente la primera vez que se usan.

Si la variable es definida fuera de una función se encontrará en el scope global. Estará disponible en cualquier scope debajo de su inicialización. Si una variables fue inicializada dentro de una función solo está disponible dentro de la misma función. Si dentro de una función se modifica una variable inicializada antes fuera de ella, se modificará en ambos entornos.

### Tipos de variables

- **Misterioso/misteriosa/misteriose**: variables no definidas o definidas y regresadas a estado undefined. Por ejemplo **Laura es misteriosa**
- **Nada**: tipo null, se expresa con la palabra **nada**
- **Booleano**: valores verdaderos o falsos: **piola** = verdadero | **ortiba** = falso. Por ejemplo **Laura es piola** equivale a laura = true.
- **Número**: Se expresan con el número literal, por ejemplo **12**, o con palabras por la cantidad de letras, por ejemplo **linda** equivale a 5, o el nombre del número para los números del 0 al 9, por ejemplo: **seis**
- **String**: Expresados entre comillas dobles, por ejemplo "Cu cu cu cumbia!". Se concatenan con la palabra "más". Ejemplo: **Y dice! Cumbia más " cabeza"** concatena el valor de la variable **cumbia** y el string "cabeza"
- **Arrays**: - Siempre precesidos por artículo plural. Se definirán automáticamente la primera vez que se añada un elemento con la palabra "tienen", por ejemplo **Los pibes tienen ganas de bailar** define el array pibes si no existe y le asigna el valor 526 por la cantidad de letras.
- **Funciones**: Se definen con la palabra "tomo" o "toma" luego del nombre de la variable, por ejemplo **Laura toma cerveza** define la función **laura** con un único parámetro que se llama **cerveza** // laura = (cerveza) => ... en javascript

### Arrays

Comienzan en el índice cero. Se definen al asignarle un valor. Siempre deben ser precedido por el artículo plural los/las/lxs/les. La palabra tienen separa el array del valor a ser asignado

```
Las noches tienen cumbia
# declara el array noches y le asigna el número 6, por las letras de la palabra "cumbia" en el índice cero.
```

Para traer el contenido de un índice de un array se usa la palabra "de" entre el número del índice y el array precedido por el artículo en plural.
```
Y dice! El rey de las bailantas
# Imprimirá bailantas[rey]

Y dice! El uno de las bailantas
# Imprimirá bailantas[1]

El 6 de las bailantas es 3
# También puede asignar valor: bailantas[6] = 3
```

Si se hace referencia a una array en una comparación numérica, se considerará como el largo del array. Ejemplo:
```
Si mi wacha es tan grande como las chetas
# considera if (wacha >= chetas.length) {}
```

### Literales
Los strings literales se expresan siempre entre comillas dobles.
```
Y dice! "Siempre tú me decías..."
```

Los números decimales se separan con ".".
```
Pi es 3.141592654
Y dice! Pi!
```

### Incremento y decremento
Las palabras "sube" y "crece" incrementan la variable que les siga en uno. Ejemplo:
```
Sube el calor!
# Equivale a calor++
```

La palabras "baja", "pa abajo" y "y vas para abajo" decrementa la variable que les siga en uno. Ejemplo:
```
Y vas para abajo, Nena
# Equivale a nena--
```

### Operadores
Los operadores matemáticos básicos se expresan literalmente o mediante aliases.

- \+ suma. Alias: "más"
- \- resta. Alias: "menos"
- \* multiplicación. Alias: "por"
- \/ división. Alias: "entre"

Ejemplo:
```
Y dice! 100 + uno
# equivale a: console.log(100 + 1)
```

### Comparaciones
Comienzan con la palabra si. Cierran al encontrar una línea en blanco, o al encontrar el comando "Pará!"
Ejemplo:
```
Si Laura es mayor que 100
Y dice! "Sabor!"
# equivale a: if (laura > 100) console.log('Sabor!')
```

### Operaciones lógicas
La palabra "y" equivale a AND / &&.
```
Si la cumbia es mayor que 5 y Laura es piola
# equivale a: if (cumbia > 5 && laura == true) {}
```

### Loops/Until while
La palabra "mientras" comienza un loop while. Cierran al encontrar una línea en blanco. Para detener la ejecución del resto del contenido de while para esa iteración del loop, utilizar el comando "Wuki! Wuki!", equivalente a "continue" en javascript y otros lenguajes.

```
Mientras el baile sea tan alto como cinco
Sube el baile!

# Equivale a: while (baile >= 5) { baile++ }
```

### Funciones
Luego del nombre de la variable, las palabras "tomo" o "toma" se declara el nombre del parámetro. Si se repite la declaración de la misma función con otro parámetro en la línea inmediatamente siguiente, se agrega únicamente el parámetro en vez de declararse nuevamente. Ejemplo:
```
El volumen toma el ancho
El volumen toma el largo
# equivale a: let volumen = function(ancho, largo) {
```

### Salida
El comando "Y dice!" imprime el valor que le siga. Se puede usar sin el signo de admiración inicial. Ignorará los signos de admiración en los nombres de variables. Ejemplo:
```
Y dice! Cumbia!
# equivale a: console.log(cumbia);
```

### Expresiones poéticas
Equivalentes para mejorar la estética cumbiera:
```
La yuta no es nada
## equivale a: let yuta = 0;
```

**Probá el intérprete de javascript [en vivo](https://patopitaluga.github.io/cumbion/)**
