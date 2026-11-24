(() => {
  if (!artworkShowcasePath.test(location.pathname)) return;
  let pair;

  const previewSelector = `[data-eshowcasetype="${artworkShowcaseType}"][data-purchaseid]`;
  const area = document.createElement("section");
  area.className = "sav-showcase-transfer";
  const picker = document.createElement("select");
  localizeArtworkNode(picker, "destination", {}, "aria-label");
  const apply = document.createElement("button");
  apply.type = "button";
  localizeArtworkNode(apply, "placePieces");
  const status = document.createElement("p");
  status.setAttribute("role", "status");
  area.append(picker, apply, makeArtworkLanguagePicker(), status);
  const editor = document.querySelector(".profile_edit_content") || document.body;
  editor.prepend(area);

  function visiblePreviews() {
    return [...document.querySelectorAll(previewSelector)].filter(node =>
      node.getClientRects().length && /^\d+$/.test(node.dataset.purchaseid));
  }

  let previous = "";
  let applying = false;
  let autoPlaced = false;
  function updatePicker() {
    if (area.hidden !== !pair) area.hidden = !pair;
    const previews = visiblePreviews();
    const signature = previews.map(node => node.dataset.purchaseid).join(",");
    if (signature !== previous) {
      previous = signature;
      const selected = picker.value;
      picker.replaceChildren(...previews.map((node, index) => {
        const option = new Option("", node.dataset.purchaseid);
        localizeArtworkNode(option, "numberedShowcase", { number: index + 1 });
        return option;
      }));
      if (previews.some(node => node.dataset.purchaseid === selected)) picker.value = selected;
    }
    picker.disabled = applying || previews.length < 2;
    apply.disabled = applying || !previews.length;
  }

  function findSlotControl(preview, purchaseID, slot) {
    const pickerCall = /\bShowcasePublishedFilePicker\s*\(\s*[^,]+,\s*['"]?(\d+)['"]?\s*,\s*['"]?(\d+)['"]?\s*,\s*['"]?\d+['"]?\s*,\s*['"]?(\d+)['"]?\s*,/;
    return [...(preview?.querySelectorAll('[onclick*="ShowcasePublishedFilePicker"]') || [])].find(control => {
      const args = control.getAttribute("onclick").match(pickerCall);
      return args && Number(args[1]) === artworkShowcaseType && args[2] === purchaseID &&
        Number(args[3]) === slot;
    });
  }

  function currentPiece(preview, slot) {
    for (const node of preview?.querySelectorAll("[data-slotjson]") || []) {
      try {
        const data = JSON.parse(node.dataset.slotjson);
        if (Number(data.slot) === slot) return String(data.publishedfileid);
      } catch {
        // Ignore incomplete slot metadata while Steam refreshes the preview.
      }
    }
  }

  async function placePieces(purchaseID) {
    if (applying || !pair) return;
    const selection = pair;
    const getPreview = () => visiblePreviews().find(node => node.dataset.purchaseid === purchaseID);
    const preview = getPreview();
    const slots = [0, 1];
    if (!preview || slots.some(slot =>
      currentPiece(preview, slot) !== selection[slot + 1] && !findSlotControl(preview, purchaseID, slot))) {
      localizeArtworkNode(status, "slotsUnavailable");
      return;
    }
    autoPlaced = true;
    applying = true;
    updatePicker();
    localizeArtworkNode(status, "placingPieces");
    try {
      for (const slot of slots) {
        const id = selection[slot + 1];
        if (currentPiece(getPreview(), slot) === id) continue;
        const control = findSlotControl(getPreview(), purchaseID, slot);
        if (!control) throw new Error();
        if (control.dispatchEvent(new CustomEvent(artworkShowcasePick, { detail: id, bubbles: true, cancelable: true }))) {
          throw new Error();
        }
        const timeout = Date.now() + 5000;
        while (currentPiece(getPreview(), slot) !== id) {
          if (Date.now() >= timeout) throw new Error();
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      if (slots.some(slot => currentPiece(getPreview(), slot) !== selection[slot + 1])) throw new Error();
      localizeArtworkNode(status, "piecesPlaced");
    } catch {
      localizeArtworkNode(status, "placementFailed");
    } finally {
      applying = false;
      updateEditor();
    }
  }

  apply.addEventListener("click", () => placePieces(picker.value));

  function updateEditor() {
    updatePicker();
    const previews = visiblePreviews();
    if (pair && !applying && !autoPlaced && previews.length === 1) {
      autoPlaced = true;
      void placePieces(previews[0].dataset.purchaseid);
    }
  }

  function readSelection() {
    const match = location.hash.match(artworkShowcaseHash);
    pair = match && match[1] !== match[2] ? match : undefined;
    autoPlaced = false;
    localizeArtworkNode(status, "chooseShowcase");
    updateEditor();
  }

  window.addEventListener("hashchange", readSelection);
  readSelection();
  new MutationObserver(updateEditor).observe(editor, { subtree: true, childList: true,
    attributes: true, attributeFilter: ["class", "style", "hidden"] });
})();
