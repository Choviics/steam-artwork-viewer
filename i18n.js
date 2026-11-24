const artworkLanguageKey = "steam-artwork-viewer-language";
const artworkDefaultLanguage = "en";
const artworkLanguages = Object.freeze({ en: "English", es: "Español" });
const artworkStrings = {
  language: ["Idioma", "Language"],
  artwork: ["Artwork {id}", "Artwork {id}"],
  viewer: ["Visor de artwork", "Artwork viewer"],
  leftPiece: ["Pieza izquierda", "Left piece"],
  rightPiece: ["Pieza derecha", "Right piece"],
  noLeft: ["Sin pieza izquierda", "No left piece"],
  noRight: ["Sin pieza derecha", "No right piece"],
  show: ["Mostrar", "Show"],
  useOnProfile: ["Usar en mi perfil", "Use on my profile"],
  create: ["Crear artwork", "Create artwork"],
  close: ["Cerrar", "Close"],
  loading: ["Cargando artwork…", "Loading artwork…"],
  loadFailed: ["Steam no devolvió una imagen que se pudiera cargar.", "Steam did not return a loadable image."],
  pieceError: ["Pieza {number}: {error}", "Piece {number}: {error}"],
  dimensions: ["{width} × {height} px", "{width} × {height} px"],
  viewerStatus: ["{dimensions}", "{dimensions}"],
  errorDetail: ["{error}", "{error}"],
  synchronized: ["{dimensions} · Reproducción sincronizada", "{dimensions} · Synchronized playback"],
  preview: ["Vista previa de las dos piezas", "Preview of both pieces"],
  split: ["Dividir una imagen o GIF en dos", "Split an image or GIF into two pieces"],
  download: ["Descargar piezas (ZIP)", "Download pieces (ZIP)"],
  upload: ["Subir a Steam", "Upload to Steam"],
  uploadFailed: ["No se pudieron abrir los formularios.", "Could not open the upload forms."],
  uploadRecovery: ["La extensión se recargó. Usa Descargar piezas (ZIP) antes de actualizar esta pestaña. Después puedes volver a dividir el original o adjuntar las piezas manualmente.", "The extension was reloaded. Use Download pieces (ZIP) before refreshing this tab. Then split the original again or attach the pieces manually."],
  unsupportedFormat: ["Selecciona un PNG, JPG o GIF.", "Select a PNG, JPG, or GIF."],
  canvasFailed: ["No se pudo preparar la imagen.", "Could not prepare the image."],
  exportFailed: ["No se pudo exportar la imagen.", "Could not export the image."],
  preparingPieces: ["Preparando las piezas…", "Preparing the pieces…"],
  processingFrame: ["Procesando fotograma {done} de {total}…", "Processing frame {done} of {total}…"],
  piecesReady: ["Piezas listas · {left} px izquierda · {right} px derecha", "Pieces ready · {left} px left · {right} px right"],
  splitFailed: ["No se pudo dividir el archivo. {error}", "Could not split the file. {error}"],
  backToViewer: ["Volver al visor", "Back to viewer"],
  openViewer: ["Ver artwork", "View artwork"],
  openShowcaseViewer: ["Elegir artwork con el visor", "Choose artwork in the viewer"],
  useInShowcase: ["Colocar en este escaparate", "Place in this showcase"],
  numberedArtwork: ["{position} · {title}", "{position} · {title}"],
  untitledArtwork: ["Sin título · #{id}", "Untitled · #{id}"],
  selectedArtwork: ["{side}: {position} de {total} · #{id}", "{side}: {position} of {total} · #{id}"],
  loadMoreArtwork: ["Cargar más artwork", "Load more artwork"],
  galleryFailed: ["No se pudo cargar tu galería de Steam.", "Could not load your Steam artwork gallery."],
  artworkRateLimited: ["Steam está limitando las solicitudes. Intenta de nuevo en {seconds} s.", "Steam is rate limiting requests. Try again in {seconds}s."],
  noArtwork: ["No encontré piezas en esta página. Prueba abrir la ficha de un artwork.", "No artwork was found on this page. Try opening an artwork page."],
  longType: ["Tipo de publicación larga", "Long artwork type"],
  artworkMode: ["Artwork o Artwork destacado", "Artwork or Featured Artwork"],
  screenshotMode: ["Captura de pantalla", "Screenshot"],
  showcaseHelp: ["Escaparate normal: {left} px al centro y {right} px al lado, a la misma altura. Artwork destacado: una pieza de {featured} px. Los escaparates de artwork y capturas requieren nivel {level} en Steam.", "Standard showcase: {left} px center and {right} px side, at the same height. Featured Artwork: one {featured} px piece. Artwork and Screenshot showcases require Steam level {level}."],
  invisibleTitle: ["Usar título invisible", "Use invisible title"],
  titleApplied: ["Título invisible aplicado.", "Invisible title applied."],
  removeLong: ["Quitar publicación larga", "Disable long artwork"],
  enableLong: ["Activar publicación larga", "Enable long artwork"],
  longOn: ["Publicación larga activada.", "Long artwork enabled."],
  longOff: ["Publicación larga desactivada.", "Long artwork disabled."],
  preparingPiece: ["Preparando la pieza {side}…", "Preparing the {side} piece…"],
  selectedPiece: ["Pieza {side} seleccionada. {mode}", "{side} piece selected. {mode}"],
  leftSide: ["izquierda", "Left"],
  rightSide: ["derecha", "Right"],
  fileInputDisabled: ["El selector de archivos de Steam está deshabilitado.", "Steam's file picker is disabled."],
  reopenForms: ["Vuelve a la pestaña del visor y abre los formularios otra vez.", "Go back to the viewer tab and reopen the upload forms."],
  attachFailed: ["{error} También puedes extraer el ZIP y elegir el archivo manualmente.", "{error} You can also extract the ZIP and select the file manually."],
  destination: ["Escaparate de arte de destino", "Destination Artwork Showcase"],
  placePieces: ["Colocar las dos piezas", "Place both pieces"],
  numberedShowcase: ["Escaparate de arte {number}", "Artwork Showcase {number}"],
  slotsUnavailable: ["Steam todavía no muestra las casillas central y lateral de este escaparate.", "Steam is not showing the center and side slots for this showcase yet."],
  placingPieces: ["Colocando las piezas…", "Placing the pieces…"],
  piecesPlaced: ["Piezas colocadas. Revisa la vista previa y pulsa Guardar en Steam.", "Pieces placed. Review the preview and click Save in Steam."],
  placementFailed: ["Steam no confirmó las dos piezas. Revisa el escaparate y vuelve a intentarlo.", "Steam did not confirm both pieces. Check the showcase and try again."],
  chooseShowcase: ["Selecciona o añade un escaparate de arte en Steam y coloca las dos piezas elegidas en el visor.", "Select or add an Artwork Showcase in Steam, then place the two pieces selected in the viewer."],
  gifUnsupported: ["Este navegador no admite la decodificación de GIF.", "This browser does not support GIF decoding."],
  gifEmpty: ["El archivo no contiene fotogramas GIF.", "The file contains no GIF frames."],
  gifTooTall: ["El GIF es demasiado alto para exportarlo a {width} px de ancho.", "The GIF is too tall to export at {width} px wide."],
  gifCanvasFailed: ["No se pudo preparar el lienzo para este GIF.", "Could not prepare the canvas for this GIF."],
  syncFailed: ["No se pudo iniciar la vista sincronizada.", "Could not start synchronized playback."]
};

const artworkLocalizedNodes = new WeakMap();
const artworkLanguageListeners = new Set();
let artworkLanguage = preferredArtworkLanguage(localStorage.getItem(artworkLanguageKey));

function preferredArtworkLanguage(value) {
  return Object.hasOwn(artworkLanguages, value) ? value : artworkDefaultLanguage;
}

function artworkText(key, values = {}) {
  return artworkStrings[key][artworkLanguage === "en" ? 1 : 0].replace(/\{(\w+)\}/g, (_, name) => {
    const value = values[name];
    return typeof value === "function" ? value() : value;
  });
}

function localizeArtworkNode(node, key, values, attribute = "textContent") {
  let bindings = artworkLocalizedNodes.get(node);
  if (!bindings) {
    bindings = new Map();
    artworkLocalizedNodes.set(node, bindings);
    artworkLanguageListeners.add(weakArtworkBinding(node, bindings));
  }
  if (!key) {
    bindings.delete(attribute);
    return;
  }
  bindings.set(attribute, { key, values });
  renderArtworkLabel(node, attribute, key, values);
}

function weakArtworkBinding(node, bindings) {
  const ref = new WeakRef(node);
  return () => {
    const target = ref.deref();
    if (!target) return false;
    for (const [attribute, { key, values }] of bindings) renderArtworkLabel(target, attribute, key, values);
    return true;
  };
}

function renderArtworkLabel(node, attribute, key, values) {
  const text = artworkText(key, values);
  if (attribute === "textContent") node.textContent = text;
  else node.setAttribute(attribute, text);
}

function setArtworkLanguage(language) {
  if (language === artworkLanguage || !Object.hasOwn(artworkLanguages, language)) return;
  artworkLanguage = language;
  for (const update of artworkLanguageListeners) {
    if (!update()) artworkLanguageListeners.delete(update);
  }
}

function makeArtworkLanguagePicker() {
  const picker = document.createElement("select");
  for (const [value, label] of Object.entries(artworkLanguages)) picker.add(new Option(label, value));
  localizeArtworkNode(picker, "language", {}, "aria-label");
  picker.value = artworkLanguage;
  artworkLanguageListeners.add(() => { picker.value = artworkLanguage; return true; });
  picker.addEventListener("change", () => {
    localStorage.setItem(artworkLanguageKey, picker.value);
    setArtworkLanguage(picker.value);
  });
  return picker;
}

window.addEventListener("storage", event => {
  if (event.key === artworkLanguageKey) setArtworkLanguage(preferredArtworkLanguage(event.newValue));
});

