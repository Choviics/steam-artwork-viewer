(() => {
  const gallery = /^\/(id|profiles)\/[^/]+\/images\/?$/.test(location.pathname);
  const detail = /^\/sharedfiles\/filedetails\/?$/.test(location.pathname);
  const showcaseEditor = artworkShowcasePath.test(location.pathname);
  if (!gallery && !detail && !showcaseEditor) return;

  const make = makeArtworkElement;
  const artworkSources = new Map();
  let artworkRetryAt = 0;

  function artworkID(url) {
    if (url.origin !== location.origin || !/^\/sharedfiles\/filedetails\/?$/.test(url.pathname)) return null;
    const id = url.searchParams.get("id");
    return /^\d+$/.test(id || "") ? id : null;
  }

  function visibleTitle(value) {
    const text = value?.trim();
    return text?.replace(/[\s\u2800\u3164\uFFA0\p{Cf}]/gu, "") ? text : "";
  }

  function entries(page) {
    const found = new Map();
    if (detail) {
      const id = artworkID(new URL(location.href));
      if (id) found.set(id, visibleTitle(document.title));
      return found;
    }
    for (const link of page.querySelectorAll('a[href*="sharedfiles/filedetails"]')) {
      const id = artworkID(new URL(link.getAttribute("href"), location.origin));
      if (!id || found.has(id)) continue;
      found.set(id, visibleTitle(link.querySelector("img")?.alt) || visibleTitle(link.title) || visibleTitle(link.textContent));
    }
    return found;
  }

  function artworkRateLimitError() {
    const seconds = Math.max(1, Math.ceil((artworkRetryAt - Date.now()) / 1000));
    return Object.assign(new Error(artworkText("artworkRateLimited", { seconds })), { status: 429 });
  }

  async function fetchArtworkPage(url) {
    if (Date.now() < artworkRetryAt) throw artworkRateLimitError();
    const response = await fetch(url, { credentials: "same-origin", signal: AbortSignal.timeout(steamArtworkRequestTimeout) });
    if (response.status === 429) {
      const retryAfter = response.headers.get("Retry-After")?.trim();
      const now = Date.now();
      const deadline = /^\d+$/.test(retryAfter) ? now + Number(retryAfter) * 1000 : Date.parse(retryAfter);
      artworkRetryAt = Math.max(artworkRetryAt, deadline > now ? deadline : now + artworkRateLimitFallback);
      throw artworkRateLimitError();
    }
    if (!response.ok) throw new Error("HTTP " + response.status);
    return new DOMParser().parseFromString(await response.text(), "text/html");
  }

  async function readArtworkSources(id) {
    const url = new URL("/sharedfiles/filedetails/", location.origin);
    url.searchParams.set("id", id);
    const page = id === artworkID(new URL(location.href)) ? document : await fetchArtworkPage(url);
    return [
      page.querySelector("#ActualMedia img, img#ActualMedia")?.getAttribute("src"),
      page.querySelector(".workshopItemPreviewImageMain img, img.workshopItemPreviewImageMain")?.getAttribute("src"),
      page.querySelector('meta[property="og:image"]')?.content
    ].filter(Boolean).map(value => new URL(value, url)).filter(source => source.protocol === "https:" &&
      /(^|\.)steamusercontent\.com$|^steamuserimages-[\w-]+\.akamaihd\.net$/.test(source.hostname));
  }

  async function artwork(id, signal) {
    if (!artworkSources.has(id)) {
      artworkSources.set(id, readArtworkSources(id).catch(error => {
        artworkSources.delete(id);
        throw error;
      }));
    }
    const lookup = artworkSources.get(id);
    const sources = await lookup;
    signal.throwIfAborted();
    for (const source of sources) {
      const image = make("img");
      image.alt = artworkText("artwork", { id });
      image.src = source.href;
      try {
        await image.decode();
        return image;
      } catch {
        // Steam sometimes exposes a fallback image in its page metadata.
      }
      signal.throwIfAborted();
    }
    if (artworkSources.get(id) === lookup) artworkSources.delete(id);
    throw new Error(artworkText("loadFailed"));
  }

  const dialog = make("dialog");
  dialog.className = "sav-dialog";
  localizeArtworkNode(dialog, "viewer", {}, "aria-label");
  const form = make("form");
  const left = make("select");
  localizeArtworkNode(left, "leftPiece", {}, "aria-label");
  const right = make("select");
  localizeArtworkNode(right, "rightPiece", {}, "aria-label");
  const show = make("button", "show");
  const showcase = make("button", showcaseEditor ? "useInShowcase" : "useOnProfile");
  showcase.type = "button";
  showcase.disabled = true;
  showcase.addEventListener("click", () => {
    if (showcase.disabled) return;
    const editor = new URL(steamShowcaseEditor);
    editor.hash = `sav-showcase=${left.value}:${right.value}`;
    if (showcaseEditor) {
      dialog.close();
      if (location.hash === editor.hash) window.dispatchEvent(new HashChangeEvent("hashchange"));
      else location.hash = editor.hash;
      return;
    }
    window.open(editor, "_blank", "noopener");
  });
  const prepare = make("button", "create");
  prepare.type = "button";
  const close = make("button", "close");
  close.type = "button";
  close.addEventListener("click", () => dialog.close());
  const status = make("p");
  status.setAttribute("role", "status");
  const selection = make("div");
  selection.className = "sav-selection";
  const leftPosition = make("span");
  const rightPosition = make("span");
  selection.append(leftPosition, rightPosition);
  const more = make("button", "loadMoreArtwork");
  more.type = "button";
  more.hidden = true;
  const images = make("div");
  images.className = "sav-images";
  images.style.gap = artworkGap + "px";
  let previewTimer;
  for (const select of [left, right]) select.addEventListener("change", schedulePreview);
  form.append(left, right, show, showcase, more, prepare, makeArtworkLanguagePicker(), close);
  dialog.append(form, selection, status, images);

  function markSelection(select, marker, side, offset) {
    marker.hidden = !select.value;
    if (marker.hidden) return;
    localizeArtworkNode(marker, "selectedArtwork", {
      side: () => artworkText(side), position: select.selectedIndex + 1 - offset,
      total: select.options.length - offset, id: select.value
    });
  }

  function updateSelection() {
    markSelection(left, leftPosition, "leftPiece", 1);
    markSelection(right, rightPosition, "rightPiece", 1);
    show.disabled = !left.value && !right.value;
    showcase.disabled = !left.value || !right.value || left.value === right.value;
  }

  function schedulePreview() {
    updateSelection();
    request?.abort();
    clearTimeout(previewTimer);
    previewTimer = setTimeout(() => form.requestSubmit(), artworkPreviewDelay);
  }

  let request;
  form.addEventListener("submit", async event => {
    event.preventDefault();
    clearTimeout(previewTimer);
    updateSelection();
    request?.abort();
    if (show.disabled) {
      images.replaceChildren();
      images.classList.remove("sav-images-pair");
      localizeArtworkNode(status, null);
      status.textContent = "";
      return;
    }
    const current = new AbortController();
    request = current;
    localizeArtworkNode(status, "loading");
    images.replaceChildren();
    images.classList.toggle("sav-images-pair", Boolean(right.value));
    const results = await Promise.allSettled(
      [left.value, right.value].filter(Boolean).map(id => artwork(id, current.signal))
    );
    if (current.signal.aborted) return;
    const ready = results.filter(result => result.status === "fulfilled").map(result => result.value);
    images.replaceChildren(...ready);
    const dimensions = () => results.map((result, index) => {
      if (result.status === "rejected") return artworkText("pieceError", { number: index + 1, error: result.reason.message });
      const image = result.value;
      return artworkText("dimensions", { width: image.naturalWidth, height: image.naturalHeight });
    }).join(" · ");
    function showDimensions() {
      localizeArtworkNode(status, "viewerStatus", { dimensions });
    }
    showDimensions();
    if (ready.length === 2 && globalThis.ImageDecoder) {
      try {
        const gifs = await Promise.all(ready.map(async image => {
          const data = await chrome.runtime.sendMessage({ type: artworkMessages.readArtwork, url: image.src });
          return data && decodeArtworkBytes(data);
        }));
        if (current.signal.aborted || gifs.some(gif => !gif)) return;
        await playArtworkPair(gifs, current.signal, canvases => {
          canvases.forEach((canvas, index) => canvas.setAttribute("aria-label", ready[index].alt));
          images.replaceChildren(...canvases);
          localizeArtworkNode(status, "synchronized", { dimensions });
        });
      } catch {
        if (!current.signal.aborted) {
          images.replaceChildren(...ready);
          showDimensions();
        }
      }
    }
  });
  dialog.addEventListener("close", () => {
    clearTimeout(previewTimer);
    request?.abort();
    images.replaceChildren();
  });

  const preview = make("dialog");
  preview.className = "sav-dialog";
  localizeArtworkNode(preview, "preview", {}, "aria-label");
  const controls = make("div");
  controls.className = "sav-preview-controls";
  const localImages = make("div");
  localImages.className = "sav-images sav-images-pair";
  const localStatus = make("p");
  localStatus.setAttribute("role", "status");
  const previewImage = make("img");
  localizeArtworkNode(previewImage, "preview", {}, "alt");
  previewImage.hidden = true;
  localImages.append(previewImage);

  let conversion;
  const fileLabel = make("label");
  fileLabel.append(make("span", "split"));
  const fileInput = make("input");
  fileInput.type = "file";
  fileInput.accept = artworkInputFormats;
  fileLabel.append(fileInput);
  controls.append(fileLabel);
  const download = make("a", "download");
  download.download = "steam-artwork.zip";
  download.hidden = true;
  const upload = make("button", "upload");
  upload.type = "button";
  upload.hidden = true;
  controls.append(download, upload);
  let generatedFiles;
  const stagedFiles = new Map();

  chrome.runtime.onMessage.addListener((message, sender, respond) => {
    if (message.type !== artworkMessages.getFile || sender.id !== chrome.runtime.id) return;
    const pair = stagedFiles.get(message.token);
    const file = pair?.[message.index];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => respond({ name: file.name, type: file.type, data: reader.result.split(",")[1] });
    reader.onerror = () => respond(null);
    reader.readAsDataURL(file);
    return true;
  });

  upload.addEventListener("click", async () => {
    if (!generatedFiles) return;
    if (!chrome.runtime?.id) {
      showUploadRecovery();
      return;
    }
    const token = crypto.randomUUID();
    stagedFiles.set(token, generatedFiles);
    setTimeout(() => stagedFiles.delete(token), 5 * 60 * 1000);
    upload.disabled = true;
    try {
      const result = await chrome.runtime.sendMessage({ type: artworkMessages.openUpload, token });
      if (!result?.ok) throw new Error(result?.error || artworkText("uploadFailed"));
    } catch (error) {
      stagedFiles.delete(token);
      if (!chrome.runtime?.id || /extension context invalidated/i.test(error.message)) {
        showUploadRecovery();
      } else {
        localizeArtworkNode(localStatus, "errorDetail", { error: error.message });
      }
    } finally {
      upload.disabled = false;
    }
  });

  function showUploadRecovery() {
    localizeArtworkNode(localStatus, "uploadRecovery");
  }

  function cancelConversion() {
    conversion?.abort();
    conversion = undefined;
    fileInput.value = "";
    const href = download.getAttribute("href");
    if (href) URL.revokeObjectURL(href);
    download.hidden = true;
    download.removeAttribute("href");
    upload.hidden = true;
    generatedFiles = undefined;
    const previewUrl = previewImage.getAttribute("src");
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewImage.removeAttribute("src");
    previewImage.hidden = true;
  }

  fileInput.addEventListener("change", async () => {
    const file = fileInput.files[0];
    cancelConversion();
    if (!file) return;
    const current = new AbortController();
    conversion = current;
    localizeArtworkNode(localStatus, "preparingPieces");
    try {
      const result = await splitArtwork(file, current.signal, (done, total) => {
        localizeArtworkNode(localStatus, "processingFrame", { done, total });
      });
      if (current.signal.aborted) return;
      const pair = result.pieces.map((piece, index) => {
        const side = index === 0 ? "izquierda" : "derecha";
        const extension = piece.type === artworkFormats.jpg ? "jpg" : piece.type.split("/")[1];
        return new File([piece], "artwork-" + side + "." + extension, { type: piece.type });
      });
      const archive = await archiveArtwork(pair);
      if (current.signal.aborted) return;
      generatedFiles = pair;
      previewImage.src = URL.createObjectURL(result.preview);
      previewImage.hidden = false;
      download.href = URL.createObjectURL(archive);
      download.hidden = false;
      upload.hidden = false;
      localizeArtworkNode(localStatus, "piecesReady", { left: artworkLeftWidth, right: artworkRightWidth });
    } catch (error) {
      if (!current.signal.aborted) localizeArtworkNode(localStatus, "splitFailed", { error: error.message });
    } finally {
      if (conversion === current) conversion = undefined;
    }
  });

  const closePreview = make("button", "backToViewer");
  closePreview.type = "button";
  closePreview.addEventListener("click", () => preview.close());
  controls.append(makeArtworkLanguagePicker(), closePreview);
  preview.append(controls, localStatus, localImages);
  prepare.addEventListener("click", () => preview.showModal());
  preview.addEventListener("close", () => {
    cancelConversion();
    localizeArtworkNode(localStatus, null);
    localStatus.textContent = "";
  });

  const launch = make("button", showcaseEditor ? "openShowcaseViewer" : "openViewer");
  const noLeft = new Option("", "");
  localizeArtworkNode(noLeft, "noLeft");
  const noRight = new Option("", "");
  localizeArtworkNode(noRight, "noRight");
  launch.className = "sav-launch";
  const galleryItems = new Map();
  let galleryPage = 1;
  let galleryEnded = false;

  function showEntries(items) {
    const currentPair = showcaseEditor && !left.options.length ? location.hash.match(artworkShowcaseHash) : null;
    const previousLeft = currentPair?.[1] || left.value;
    const previousRight = currentPair?.[2] || right.value;
    left.replaceChildren(noLeft);
    right.replaceChildren(noRight);
    let position = 0;
    for (const [id, title] of items) {
      position += 1;
      for (const select of [left, right]) {
        const option = new Option("", id);
        localizeArtworkNode(option, "numberedArtwork", {
          position, title: () => title || artworkText("untitledArtwork", { id })
        });
        select.add(option);
      }
    }
    if (items.has(previousLeft)) left.value = previousLeft;
    if (items.has(previousRight)) right.value = previousRight;
    updateSelection();
    more.hidden = !showcaseEditor || galleryEnded;
    if (items.size) form.requestSubmit();
    else {
      localizeArtworkNode(status, "noArtwork");
    }
  }

  async function loadGalleryPage() {
    if (more.disabled || galleryEnded) return;
    more.disabled = true;
    localizeArtworkNode(status, "loading");
    try {
      const url = new URL(location.pathname.replace(/\/edit\/showcases\/?$/, "/images/"), steamOrigin);
      if (galleryPage > 1) url.searchParams.set("p", galleryPage);
      const page = await fetchArtworkPage(url);
      const size = galleryItems.size;
      for (const [id, title] of entries(page)) galleryItems.set(id, title);
      galleryEnded = galleryItems.size === size;
      galleryPage += 1;
      if (dialog.open) showEntries(galleryItems);
    } catch (error) {
      if (dialog.open) {
        more.hidden = false;
        if (error.status === 429) localizeArtworkNode(status, "errorDetail", { error: error.message });
        else localizeArtworkNode(status, "galleryFailed");
      }
    } finally {
      more.disabled = false;
    }
  }

  more.addEventListener("click", loadGalleryPage);
  launch.addEventListener("click", () => {
    dialog.showModal();
    if (showcaseEditor && (galleryItems.size || galleryEnded)) showEntries(galleryItems);
    else if (showcaseEditor) void loadGalleryPage();
    else showEntries(entries(document));
  });
  document.body.append(launch, dialog, preview);
})();

