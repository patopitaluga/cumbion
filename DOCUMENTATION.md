# Cumbion

Lenguaje de programación de de tipado dinámico, Turing-completo, que es al mismo tiempo letras de cumbia.

## Formato de archivos

Los scripts de Cumbion son archivos de texto UTF-8 con la extensión .cumbia

## Comentarios

El símbolo #
```
# Este es un comentario, toda esta línea será ignorada por el compilador de Cumbion.
```

## Variables
Se consideran variables cualquier identificador que comience con mayúscula y que no sea una palabra reservada del lenguaje. Solo pueden contener letras, sin espacios. No se permiten guiones ni números porque no se pueden cantar. Los nombres de variables no diferencian mayúsculas de minúsculas excepto la primera letra que debe ser siempre mayúscula.

** Los artículos el/la/le y los pronombres posesivos mi/tu/nuestro/nuestra son completamente ignorados. 'La Cerveza' es considerada la misma variable que 'Cerveza' y 'La Pollera' es considerada la misma variable que 'Mi Pollera'. **

Se recomiendan nombres propios cumbiancheros.

```
La Cumbia es 20
Laura es una diosa
Poné Cumbia más Laura en el Baile
¡Y dice! Baile
```

Las variables son dinámicamente tipadas, se declaran automáticamente la primera vez que se usan.

Si la variable es definida fuera de una función se encontrará en el scope global. Estará disponible en cualquier scope debajo de su inicialización. Si una variables fue inicializada dentro de una función solo está disponible dentro de la misma función. Si dentro de una función se modifica una variable inicializada antes fuera de ella, se modificará en ambos entornos.
