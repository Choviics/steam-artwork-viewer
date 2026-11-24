const artworkGap = 8;
const artworkLeftWidth = 506;
const artworkRightWidth = 100;
const artworkFeaturedWidth = 630;
const artworkShowcaseLevel = 10;
const artworkShowcaseType = 13;
const artworkLongFields = Object.freeze({ width: "1000", height: "1", screenshotType: "5" });
const artworkInvisibleTitle = "\u2800";
const steamOrigin = "https://steamcommunity.com";
const steamUploadForm = steamOrigin + "/sharedfiles/edititem/767/3/";
const steamShowcaseEditor = steamOrigin + "/my/edit/showcases";
const artworkMessages = Object.freeze({
  readArtwork: "sav-read-artwork",
  openUpload: "sav-open-upload",
  readUpload: "sav-read-upload",
  getFile: "sav-get-file"
});
const artworkUploadHash = /^#sav=([\da-f-]{36}):([01])$/;
const artworkShowcaseHash = /^#sav-showcase=(\d{1,20}):(\d{1,20})$/;
const artworkShowcasePath = /^\/(?:my|(?:id|profiles)\/[^/]+)\/edit\/showcases\/?$/;
const artworkShowcasePick = "sav:pick-showcase-artwork";
const artworkPreviewDelay = 300;
const artworkRateLimitFallback = 60000;
const steamArtworkRequestTimeout = 15000;
const artworkFormats = Object.freeze({ gif: "image/gif", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg" });
const artworkInputFormats = [...new Set(Object.values(artworkFormats)), ...Object.keys(artworkFormats).map(extension => "." + extension)].join(",");

