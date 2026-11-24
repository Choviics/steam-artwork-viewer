async function splitArtwork(file, signal, onProgress) {
  const extension = file.name.split(".").pop().toLowerCase();
  const type = Object.values(artworkFormats).includes(file.type)
    ? file.type : Object.hasOwn(artworkFormats, extension) && artworkFormats[extension];
  if (type === artworkFormats.gif) return splitArtworkGif(file, signal, onProgress);
  if (!type) throw new Error(artworkText("unsupportedFormat"));

  const image = await createImageBitmap(file);
  try {
    signal.throwIfAborted();
    const width = artworkLeftWidth + artworkRightWidth;
    const height = Math.max(1, Math.round(image.height * width / image.width));
    const scaled = drawArtworkCanvas(width, height, context => context.drawImage(image, 0, 0, width, height));
    const left = drawArtworkCanvas(artworkLeftWidth, height, context => context.drawImage(scaled, 0, 0));
    const right = drawArtworkCanvas(artworkRightWidth, height, context => context.drawImage(scaled, -artworkLeftWidth, 0));
    const preview = drawArtworkCanvas(width + artworkGap, height, context => {
      context.drawImage(left, 0, 0);
      context.drawImage(right, artworkLeftWidth + artworkGap, 0);
    });
    const [leftFile, rightFile, previewFile] = await Promise.all([
      encodeArtworkCanvas(left, type), encodeArtworkCanvas(right, type), encodeArtworkCanvas(preview, artworkFormats.png)
    ]);
    return { pieces: [leftFile, rightFile], preview: previewFile };
  } finally {
    image.close();
  }
}

function drawArtworkCanvas(width, height, draw) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error(artworkText("canvasFailed"));
  draw(context);
  return canvas;
}

function encodeArtworkCanvas(canvas, type) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error(artworkText("exportFailed")));
    }, type, 0.92);
  });
}
