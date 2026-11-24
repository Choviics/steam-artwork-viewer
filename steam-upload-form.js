(() => {
  const match = location.hash.match(artworkUploadHash);
  const input = document.querySelector('form input[type="file"]');
  if (!input?.form) return;
  const form = input.form;
  const status = document.createElement("p");
  status.setAttribute("role", "status");
  const label = document.createElement("label");
  const modeLabel = document.createElement("span");
  localizeArtworkNode(modeLabel, "longType");
  const mode = document.createElement("select");
  for (const [key, value] of [["artworkMode", "artwork"], ["screenshotMode", "screenshot"]]) {
    const option = new Option("", value);
    localizeArtworkNode(option, key);
    mode.add(option);
  }
  label.append(modeLabel, " ", mode);
  const toggleLong = document.createElement("button");
  toggleLong.type = "button";
  let longEnabled = true;
  const controls = document.createElement("div");
  const actions = document.createElement("div");
  actions.style.display = "flex";
  actions.style.flexWrap = "wrap";
  actions.style.alignItems = "center";
  actions.style.gap = "8px";
  const help = document.createElement("p");
  localizeArtworkNode(help, "showcaseHelp", {
    left: artworkLeftWidth, right: artworkRightWidth, featured: artworkFeaturedWidth, level: artworkShowcaseLevel
  });
  actions.append(label, toggleLong);
  controls.append(actions, help, status);
  input.parentElement.prepend(controls);
  const title = form.querySelector('input[name="title"], input#title');
  if (title) {
    const blankTitle = document.createElement("button");
    blankTitle.type = "button";
    localizeArtworkNode(blankTitle, "invisibleTitle");
    blankTitle.addEventListener("click", () => {
      title.value = artworkInvisibleTitle;
      title.dispatchEvent(new Event("input", { bubbles: true }));
      title.dispatchEvent(new Event("change", { bubbles: true }));
      localizeArtworkNode(status, "titleApplied");
    });
    actions.append(blankTitle);
  }
  actions.append(makeArtworkLanguagePicker());
  function updateLongMode() {
    localizeArtworkNode(toggleLong, longEnabled ? "removeLong" : "enableLong");
    mode.disabled = !longEnabled;
    localizeArtworkNode(status, longEnabled ? "longOn" : "longOff");
  }
  updateLongMode();

  toggleLong.addEventListener("click", () => {
    longEnabled = !longEnabled;
    updateLongMode();
  });

  form.addEventListener("formdata", event => {
    if (!longEnabled || !input.files.length) return;
    const width = form.querySelector("#image_width")?.name;
    const height = form.querySelector("#image_height")?.name;
    if (!width || !height) return;
    event.formData.set(width, artworkLongFields.width);
    event.formData.set(height, artworkLongFields.height);
    if (mode.value === "screenshot") event.formData.set("file_type", artworkLongFields.screenshotType);
  });

  if (!match) return;
  const side = () => artworkText(match[2] === "0" ? "leftSide" : "rightSide");
  localizeArtworkNode(status, "preparingPiece", { side });

  async function attach() {
    if (input.disabled) throw new Error(artworkText("fileInputDisabled"));
    const piece = await chrome.runtime.sendMessage({ type: artworkMessages.readUpload, fragment: location.hash });
    if (input.files.length) {
      updateLongMode();
      return;
    }
    if (!piece?.data) throw new Error(artworkText("reopenForms"));
    const bytes = decodeArtworkBytes(piece.data);
    const transfer = new DataTransfer();
    transfer.items.add(new File([bytes], piece.name, { type: piece.type || artworkFormats.gif }));
    input.files = transfer.files;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
    localizeArtworkNode(status, "selectedPiece", { side, mode: () => artworkText(longEnabled ? "longOn" : "longOff") });
  }

  attach().catch(error => {
    localizeArtworkNode(status, "attachFailed", { error: error.message });
  });
})();
