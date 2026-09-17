# Foxes Arround Green 🦊

Pequeño experimento de realidad aumentada hecho con Three.js y WebXR. La idea es simple: abrir la página desde un celular compatible, detectar una superficie y colocar animales en el mundo real.

## Probarlo

La versión publicada está en GitHub Pages:

https://umcristian.github.io/Foxes_Arround_Green/

En un dispositivo compatible:

1. Pulsa **START AR**.
2. Permite el acceso a la cámara.
3. Apunta al suelo o a otra superficie hasta que aparezca el anillo verde.
4. Elige **Zorro**, **Conejo** o **Pájaro**.
5. Toca la pantalla para colocar el animal.

Por ahora el proyecto está centrado principalmente en el zorro. El conejo y el pájaro siguen siendo modelos de prueba.

## Ejecutarlo localmente

Con Python 3:

```bash
python -m http.server 8765
```

Después abre `http://localhost:8765`.

No abras `index.html` directamente con doble clic, porque los módulos de JavaScript necesitan servirse desde un servidor. Three.js se carga desde jsDelivr, así que también necesitas conexión a Internet.

## Cómo funciona

- **Three.js** se encarga de la escena y los modelos 3D.
- **WebXR** inicia la experiencia de realidad aumentada.
- **Hit Test** detecta superficies donde se pueden colocar los animales.
- **DOM Overlay** mantiene los botones del selector visibles y utilizables mientras AR está activo.
- No hay backend ni dependencias que instalar.

`Fox.glb` sigue dentro del repositorio, aunque actualmente el zorro que aparece en AR se genera directamente con Three.js.

## Compatibilidad

La experiencia AR depende del navegador y del dispositivo. Si aparece **AR NOT SUPPORTED**, significa que ese entorno no ofrece las funciones WebXR que necesita el proyecto.

Para probar AR desde un celular, la versión de GitHub Pages es la opción más sencilla porque ya se sirve mediante HTTPS.
