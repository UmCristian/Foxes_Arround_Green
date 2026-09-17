# Foxes Arround Green 🦊

Un pequeño experimento de realidad aumentada hecho con Three.js y WebXR.

La idea es bastante simple: abrir la página desde un celular compatible, detectar una superficie con la cámara y colocar un zorro 3D en el mundo real.

## Probarlo

La versión publicada está disponible en GitHub Pages:

[Foxes Arround Green](https://umcristian.github.io/Foxes_Arround_Green/?utm_source=chatgpt.com)

Para probarla:

1. Abre la página desde un celular compatible con WebXR.
2. Pulsa **START AR**.
3. Permite el acceso a la cámara.
4. Mueve el celular apuntando al suelo, una mesa u otra superficie.
5. Cuando aparezca el círculo verde, significa que se encontró una superficie.
6. Selecciona **🦊 Zorro**.
7. Toca la pantalla donde quieras colocarlo.

Puedes colocar más de un zorro en la misma sesión.

## Animales

Por ahora el proyecto está centrado en el zorro.

* 🦊 **Zorro:** funcional. Utiliza el modelo `Fox.glb`.
* 🐇 **Conejo:** todavía no implementado.
* 🐦 **Pájaro:** todavía no implementado.

Los botones del conejo y del pájaro se mantienen porque la idea es añadir sus modelos posteriormente.

## Ejecutarlo localmente

No es necesario instalar dependencias.

Con Python 3 puedes iniciar un servidor desde la carpeta del proyecto:

```bash
python -m http.server 8765
```

Después abre `localhost:8765` en el navegador.

Three.js y sus módulos se cargan desde jsDelivr, por lo que se necesita conexión a Internet.

## Cómo funciona

El proyecto utiliza:

* **Three.js** para mostrar y manipular el modelo 3D.
* **GLTFLoader** para cargar `Fox.glb`.
* **WebXR** para iniciar la experiencia de realidad aumentada.
* **Hit Test** para detectar superficies del mundo real.
* **DOM Overlay** para mantener los botones de animales disponibles mientras AR está activo.

Cuando WebXR encuentra una superficie válida aparece un círculo verde. Al tocar la pantalla, el proyecto crea una copia del zorro y la coloca en esa posición.

## Archivos principales

`index.html` contiene la interfaz y los botones.

`main.js` contiene la escena de Three.js, WebXR, la detección de superficies y la colocación de los modelos.

`Fox.glb` es el modelo 3D utilizado actualmente para el zorro.

## Compatibilidad

WebXR no funciona en todos los navegadores ni en todos los celulares.

Si aparece **AR NOT SUPPORTED**, el navegador o dispositivo no ofrece las funciones de realidad aumentada que necesita el proyecto.

Para probar AR desde un celular es recomendable utilizar directamente la versión publicada en GitHub Pages, ya que WebXR necesita un contexto seguro HTTPS.
