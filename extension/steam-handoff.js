importScripts("/constants.js");

chrome.runtime.onMessage.addListener((message, sender, respond) => {
  const tab = sender.tab;
  if (sender.frameId !== 0 || tab?.id == null) return;

  if (message.type === artworkMessages.readArtwork && sender.url?.startsWith(steamOrigin + "/")) {
    readArtworkGif(message.url).then(respond, () => respond(null));
    return true;
  }

  if (message.type === artworkMessages.openUpload && /^[\da-f-]{36}$/.test(message.token)) {
    (async () => {
      for (const index of [0, 1]) {
        await chrome.tabs.create({
          url: steamUploadForm + "#sav=" + message.token + ":" + index,
          openerTabId: tab.id,
          active: index === 0
        });
      }
    })().then(() => respond({ ok: true }), error => respond({ error: error.message }));
    return true;
  }

  if (message.type === artworkMessages.readUpload && tab.openerTabId != null &&
      sender.url && new URL(sender.url).origin + new URL(sender.url).pathname === steamUploadForm) {
    const match = String(message.fragment).match(artworkUploadHash);
    if (!match) return;
    chrome.tabs.sendMessage(tab.openerTabId, {
      type: artworkMessages.getFile,
      token: match[1],
      index: Number(match[2])
    }, { frameId: 0 }).then(respond, () => respond(null));
    return true;
  }
});

async function readArtworkGif(value) {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.port || url.username || url.password ||
      !/(^|\.)steamusercontent\.com$|^steamuserimages-a\.akamaihd\.net$/.test(url.hostname)) return null;
  const response = await fetch(url, { credentials: "omit", redirect: "error" });
  if (!response.ok) return null;
  const blob = await response.blob();
  if (await blob.slice(0, 3).text() !== "GIF") return null;
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 32768) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 32768));
  }
  return btoa(binary);
}
