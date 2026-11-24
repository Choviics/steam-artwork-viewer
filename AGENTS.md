# Extension conventions

- Keep user-facing text and accessibility labels in `i18n.js`. Add Spanish and English together and use named placeholders for dynamic values.
- Keep shared routes, message types, formats, and dimensions in `constants.js`. Keep generic DOM and byte helpers in `utils.js`.
- Prefer focused functions. Keep media processing outside the scripts that wire up the browser UI.
- Use extension-root paths for worker imports. Declare content-script dependencies in `manifest.json` in execution order within their target world.
