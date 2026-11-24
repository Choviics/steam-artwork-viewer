const splitArtworkGif = (() => {
  function encoder(width, height) {
    const bytes = [];
    const word = value => bytes.push(value & 255, value >> 8);
    bytes.push(71, 73, 70, 56, 57, 97); // GIF89a
    word(width);
    word(height);
    bytes.push(0xf7, 255, 0);
    // Use a shared RGB 3:3:2 palette and reserve the last entry for transparency.
    for (let color = 0; color < 256; color++) {
      bytes.push(Math.round((color >> 5) * 255 / 7),
        Math.round(((color >> 2) & 7) * 255 / 7), color === 254 ? 255 : (color & 3) * 85);
    }
    bytes.push(0x21, 0xff, 11, ...Array.from("NETSCAPE2.0", letter => letter.charCodeAt(0)),
      3, 1, 0, 0, 0);

    function frame(rgba, delay) {
      bytes.push(0x21, 0xf9, 4, 9);
      word(Math.min(65535, Math.max(0, Math.round(delay / 10000))));
      bytes.push(255, 0, 0x2c, 0, 0, 0, 0);
      word(width);
      word(height);
      bytes.push(0, 8);

      const dictionary = new Map();
      let nextCode = 258;
      let pending = 0;
      let bits = 0;
      let block = [];
      function writeCode(code) {
        pending |= code << bits;
        bits += 9;
        while (bits >= 8) {
          block.push(pending & 255);
          pending >>= 8;
          bits -= 8;
          if (block.length === 255) {
            bytes.push(255, ...block);
            block = [];
          }
        }
      }
      function index(offset) {
        if (rgba[offset + 3] < 128) return 255;
        const color = (rgba[offset] & 224) | ((rgba[offset + 1] & 224) >> 3) | (rgba[offset + 2] >> 6);
        return Math.min(color, 254);
      }

      // Clear the dictionary before it needs a tenth bit per code.
      writeCode(256);
      let prefix = index(0);
      for (let offset = 4; offset < rgba.length; offset += 4) {
        const color = index(offset);
        const key = prefix * 256 + color;
        const match = dictionary.get(key);
        if (match !== undefined) {
          prefix = match;
          continue;
        }
        writeCode(prefix);
        if (nextCode === 511) {
          writeCode(256);
          dictionary.clear();
          nextCode = 258;
        } else {
          dictionary.set(key, nextCode++);
        }
        prefix = color;
      }
      writeCode(prefix);
      writeCode(257);
      if (bits) block.push(pending & 255);
      if (block.length) bytes.push(block.length, ...block);
      bytes.push(0);
    }

    return {
      frame,
      finish() {
        bytes.push(0x3b);
        return new Blob([Uint8Array.from(bytes)], { type: artworkFormats.gif });
      }
    };
  }

  return async function (file, signal, onProgress) {
    if (!globalThis.ImageDecoder) throw new Error(artworkText("gifUnsupported"));
    const leftWidth = artworkLeftWidth;
    const rightWidth = artworkRightWidth;
    const width = leftWidth + rightWidth;
    const decoder = new ImageDecoder({ data: file.stream(), type: artworkFormats.gif });
    const abort = () => decoder.close();
    signal.addEventListener("abort", abort, { once: true });
    try {
      await decoder.completed;
      const count = decoder.tracks.selectedTrack?.frameCount;
      if (!count) throw new Error(artworkText("gifEmpty"));
      const { image: first } = await decoder.decode({ frameIndex: 0 });
      const height = Math.max(1, Math.round(first.displayHeight * width / first.displayWidth));
      first.close();
      if (height > 65535) throw new Error(artworkText("gifTooTall", { width }));
      const canvas = document.createElement("canvas");
      canvas.width = width + artworkGap;
      canvas.height = height;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) throw new Error(artworkText("gifCanvasFailed"));
      const left = encoder(leftWidth, height);
      const right = encoder(rightWidth, height);
      const preview = encoder(canvas.width, height);
      for (let frameIndex = 0; frameIndex < count; frameIndex++) {
        signal.throwIfAborted();
        const { image } = await decoder.decode({ frameIndex });
        try {
          context.clearRect(0, 0, canvas.width, height);
          context.drawImage(image, 0, 0, width, height);
          left.frame(context.getImageData(0, 0, leftWidth, height).data, image.duration);
          const rightPixels = context.getImageData(leftWidth, 0, rightWidth, height);
          right.frame(rightPixels.data, image.duration);
          context.clearRect(leftWidth, 0, artworkGap, height);
          context.putImageData(rightPixels, leftWidth + artworkGap, 0);
          preview.frame(context.getImageData(0, 0, canvas.width, height).data, image.duration);
        } finally {
          image.close();
        }
        onProgress(frameIndex + 1, count);
        // Let the browser repaint and handle cancellation between frames.
        await new Promise(resolve => setTimeout(resolve, 0));
      }
      signal.throwIfAborted();
      return { pieces: [left.finish(), right.finish()], preview: preview.finish() };
    } finally {
      if (!signal.aborted) decoder.close();
      signal.removeEventListener("abort", abort);
    }
  };
})();

async function playArtworkPair(gifs, signal, show) {
  const tracks = [];
  const close = () => tracks.forEach(track => track.decoder.close());
  signal.throwIfAborted();
  let hiddenAt = document.hidden ? performance.now() : null;
  let pausedFor = 0;
  const activeTime = () => (hiddenAt ?? performance.now()) - pausedFor;
  function updateVisibility() {
    const now = performance.now();
    if (document.hidden) {
      hiddenAt ??= now;
    } else if (hiddenAt !== null) {
      pausedFor += now - hiddenAt;
      hiddenAt = null;
    }
  }
  document.addEventListener("visibilitychange", updateVisibility);
  signal.addEventListener("abort", close, { once: true });
  try {
    for (const data of gifs) {
      const decoder = new ImageDecoder({ data, type: artworkFormats.gif });
      tracks.push({ decoder, index: 0, due: 0, loops: 0 });
    }
    await Promise.all(tracks.map(track => track.decoder.tracks.ready));
    signal.throwIfAborted();
    for (const track of tracks) {
      track.info = track.decoder.tracks.selectedTrack;
      if (!track.info?.frameCount) throw new Error(artworkText("gifEmpty"));
      track.canvas = document.createElement("canvas");
      track.context = track.canvas.getContext("2d");
      if (!track.context) throw new Error(artworkText("syncFailed"));
    }

    let start;
    while (true) {
      signal.throwIfAborted();
      const deadline = Math.min(...tracks.map(track => track.due));
      if (deadline === Infinity) return;
      const due = tracks.filter(track => track.due === deadline);
      const decoded = await Promise.allSettled(due.map(track => track.decoder.decode({ frameIndex: track.index })));
      try {
        signal.throwIfAborted();
        const failed = decoded.find(result => result.status === "rejected");
        if (failed) throw failed.reason;
        await waitForArtworkFrame(() => hiddenAt === null &&
          (start === undefined || activeTime() >= start + deadline), signal);
        due.forEach((track, index) => {
          const { image } = decoded[index].value;
          const { canvas, context, info } = track;
          if (!track.index && !track.loops) {
            canvas.width = image.displayWidth;
            canvas.height = image.displayHeight;
          }
          context.clearRect(0, 0, canvas.width, canvas.height);
          context.drawImage(image, 0, 0);
          const delay = (image.duration ?? 0) / 1000;
          track.due += delay < 20 ? 100 : delay;
          track.index += 1;
          if (track.index === info.frameCount) {
            track.index = 0;
            track.loops += 1;
            if (info.frameCount === 1 || track.loops > info.repetitionCount) track.due = Infinity;
          }
        });
        if (start === undefined) {
          start = activeTime();
          show(tracks.map(track => track.canvas));
        }
      } finally {
        for (const result of decoded) {
          if (result.status === "fulfilled") result.value.image.close();
        }
      }
    }
  } finally {
    document.removeEventListener("visibilitychange", updateVisibility);
    signal.removeEventListener("abort", close);
    if (!signal.aborted) close();
  }
}

function waitForArtworkFrame(isDue, signal) {
  return new Promise((resolve, reject) => {
    signal.throwIfAborted();
    const abort = () => {
      cancelAnimationFrame(frame);
      reject(signal.reason);
    };
    function tick() {
      if (!isDue()) {
        frame = requestAnimationFrame(tick);
        return;
      }
      signal.removeEventListener("abort", abort);
      resolve();
    }
    let frame = requestAnimationFrame(tick);
    signal.addEventListener("abort", abort, { once: true });
  });
}
