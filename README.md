<p align="center">
  <img src="icons/artwork-128.png" width="96" height="96" alt="">
</p>

<h1 align="center">Steam Artwork Viewer</h1>

<p align="center">Previsualiza, divide y prepara imágenes y GIF para los escaparates de tu perfil de Steam directamente desde Chrome.</p>

## Qué puedes hacer

- Ver juntas la pieza central y la lateral de un escaparate, con reproducción sincronizada para GIF compatibles.
- Dividir un PNG, JPG o GIF en dos piezas para un escaparate de arte estándar y descargarlas en un ZIP.
- Abrir los formularios de Steam con las piezas preparadas, activar el modo de publicación larga o aplicar un título invisible.
- Elegir dos publicaciones de tu galería y colocarlas en el escaparate que selecciones en el editor de Steam.
- Cambiar la interfaz entre español e inglés desde el visor.

## Instalación en Chrome

1. En GitHub, usa **Code → Download ZIP** y extrae el archivo. También puedes clonar el repositorio con `git clone https://github.com/Choviics/steam-artwork-viewer.git`. Si el repositorio es privado, necesitas acceso a él.
2. Abre `chrome://extensions` y activa **Modo de desarrollador**.
3. Pulsa **Cargar descomprimida** y selecciona la carpeta que contiene `manifest.json`.
4. Recarga cualquier pestaña de Steam Community que ya tengas abierta.

## Cómo se usa

### Previsualizar un artwork

Abre un perfil de Steam Community con un escaparate de arte o la ficha de un artwork. Pulsa **Ver artwork**, selecciona la pieza izquierda y, si está disponible, la derecha. La vista previa muestra ambas juntas.

### Crear y subir las piezas

1. Desde el visor, pulsa **Crear artwork** y selecciona un PNG, JPG o GIF. El exportador genera una pieza central de **506 px** y una lateral de **100 px**, ambas a la misma altura.
2. Revisa el resultado. Pulsa **Descargar piezas (ZIP)** si quieres guardar los archivos o adjuntarlos manualmente.
3. Con tu sesión de Steam iniciada, pulsa **Subir a Steam**. Se abren dos formularios, uno por pieza. Mantén abierta la pestaña del visor mientras se adjuntan los archivos.
4. Revisa y publica cada pieza en su formulario de Steam. Allí también puedes ajustar el modo de publicación larga o aplicar un título invisible.

El escaparate de **Artwork destacado** usa una sola pieza de **630 px**. La división en dos está pensada para el escaparate de arte estándar.

### Colocar las piezas en tu perfil

1. En Steam, abre **Editar perfil → Escaparates destacados** y selecciona o añade un escaparate de arte. También puedes usar **Usar en mi perfil** desde el visor cuando hayas seleccionado dos publicaciones.
2. En el editor, pulsa **Elegir artwork con el visor** y selecciona las publicaciones izquierda y derecha de tu galería.
3. Pulsa **Colocar en este escaparate**, elige el escaparate de destino y pulsa **Colocar las dos piezas**.
4. Comprueba la vista previa y pulsa **Guardar** en Steam.

## Si algo falla

| Problema | Qué hacer |
| --- | --- |
| No aparece **Ver artwork** | Recarga la pestaña tras instalar la extensión y prueba en un perfil con un escaparate de arte o en la ficha de una publicación. |
| Steam no muestra las casillas central y lateral | Selecciona o añade un escaparate de arte estándar en el editor de tu perfil y vuelve a intentar la colocación. |
| Un formulario no adjunta la pieza | Vuelve a abrir los formularios desde el visor. También puedes extraer el ZIP y adjuntar los archivos manualmente. |
| Steam limita las solicitudes a la galería | Espera el tiempo que indica el visor antes de volver a cargarla. |

## Privacidad y permisos

Las imágenes que seleccionas se procesan en tu navegador. Si eliges publicarlas, se adjuntan a los formularios de Steam para que las revises y las envíes. La extensión lee publicaciones de Steam Community y accede a los dominios de imágenes de Steam (`steamusercontent.com` y `steamuserimages-a.akamaihd.net`) para cargar el artwork. La preferencia de idioma se guarda en el almacenamiento local de Steam Community.

## Desarrollo

La extensión usa JavaScript sin dependencias de instalación ni un paso de compilación. El punto de partida es [manifest.json](manifest.json), que define el service worker y los scripts que se ejecutan en Steam Community. El visor está en [viewer.js](viewer.js), las dimensiones compartidas en [constants.js](constants.js) y los textos de interfaz en [i18n.js](i18n.js).

Para probar cambios, pulsa **Recargar** en la tarjeta de la extensión en `chrome://extensions` y actualiza la pestaña de Steam.

Proyecto independiente, sin afiliación con Valve ni Steam.
