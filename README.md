# Foxes Arround Green

Pequeño laboratorio de realidad aumentada: coloca un zorro, un conejo o un
pájaro geométrico sobre superficies detectadas por tu dispositivo.
Es un experimento personal, sin backend ni instalación de dependencias.

## Ejecutar

Desde esta carpeta, con Python 3 instalado:

```sh
python -m http.server 8765 --bind 127.0.0.1
```

Abre [la página local](http://127.0.0.1:8765). Detén el servidor con `Ctrl+C`.
No abras el HTML con doble clic: usa un servidor estático para los módulos JS.
Se necesita Internet para descargar Three.js 0.150.1 desde jsDelivr.

## Probar AR

1. Abre la página en un dispositivo y navegador con `immersive-ar` y `hit-test`.
2. Elige un animal **antes** de iniciar AR; el zorro es el predeterminado.
3. Pulsa el botón de AR y concede los permisos del dispositivo si deseas probarlo.
4. Apunta a una superficie hasta que aparezca el anillo verde y toca para colocar
   una copia. Puedes colocar varias.

WebXR necesita un contexto seguro y su compatibilidad depende del navegador y
hardware; consulta [la referencia de WebXR](https://developer.mozilla.org/en-US/docs/Web/API/WebXR_Device_API).
Loopback sirve para la comprobación local; para probar desde otro dispositivo
necesitas un acceso HTTPS válido o reenvío local adecuado. Una IP de red por HTTP
no equivale a localhost. Este repositorio no incluye despliegue ni túnel.

Si aparece `AR NOT SUPPORTED`, ese entorno no ofrece la sesión AR requerida.
No hay vista 3D de escritorio: antes de entrar en AR la escena está vacía.

## Cómo funciona

- `index.html`: selector, estilos mínimos y carga del módulo.
- `main.js`: Three.js dibuja animales hechos con primitivas geométricas;
  WebXR gestiona la sesión y el hit-test busca superficies desde la vista.
  La retícula marca una pose válida y cada selección clona el animal allí.
- `Fox.glb`: recurso conservado del historial, no cargado por el código actual.

## Estado y límites

Se conserva como laboratorio pequeño. Sin guardado, borrado individual de animales
ni límite de copias; recarga la página para empezar de cero. El selector no solicita
DOM Overlay, por lo que no se garantiza que aparezca dentro de la sesión inmersiva.
El manejo de errores al solicitar hit-test sigue siendo básico.

Comprobación de escritorio realizada durante la limpieza; la colocación en
superficies, orientación y salida/reentrada deben validarse en hardware AR real.
Una captura útil para añadir aquí sería el zorro colocado junto al anillo verde
en una superficie real, tomada durante esa prueba y sin datos personales visibles.
