function decodeArtworkBytes(base64) {
  return Uint8Array.from(atob(base64), character => character.charCodeAt(0));
}

function makeArtworkElement(tag, key) {
  const node = document.createElement(tag);
  if (key) localizeArtworkNode(node, key);
  return node;
}
