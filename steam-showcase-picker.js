// The native picker callbacks live in Steam's page world.
document.addEventListener("sav:pick-showcase-artwork", event => {
  const control = event.target;
  if (!(control instanceof HTMLElement) || !/^\d{1,20}$/.test(event.detail) ||
      !control.getAttribute("onclick")?.includes("ShowcasePublishedFilePicker(")) return;
  const previous = window.OnPublishedFileSelected;
  control.click();
  const select = window.OnPublishedFileSelected;
  if (typeof select !== "function" || select === previous) return;
  select.call(window, event.detail);
  event.preventDefault();
});
