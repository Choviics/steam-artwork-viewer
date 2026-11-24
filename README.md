<p align="center">
  <img src="extension/icons/artwork-128.png" width="96" height="96" alt="">
</p>

<h1 align="center">Steam Artwork Viewer</h1>

<p align="center">Preview, split, and prepare images and GIFs for your Steam profile showcases directly in Chrome.</p>

## Features

- Preview the center and side pieces of an Artwork Showcase together, with synchronized playback for compatible GIFs.
- Split a PNG, JPG, or GIF into two pieces for the standard Artwork Showcase and download them as a ZIP.
- Open Steam's upload forms with the pieces attached, enable long artwork mode, or apply an invisible title.
- Pick two posts from your gallery and place them in a showcase of your choice in the Steam profile editor.
- Switch between English and Spanish from the viewer.

## Install in Chrome

1. Download **steam-artwork-viewer.zip** from the [latest GitHub Release](https://github.com/Choviics/steam-artwork-viewer/releases/latest) and extract it.
2. Open `chrome://extensions` and turn on **Developer mode**.
3. Click **Load unpacked** and select the folder containing `manifest.json`.
4. Refresh any Steam Community tabs you already have open.

## How to use

### Preview artwork

Open a Steam Community profile with an Artwork Showcase or open an individual artwork post. Click **View artwork**, select the left piece, and select the right piece if one is available. The viewer displays both pieces together.

### Create and upload the pieces

1. In the viewer, click **Create artwork** and select a PNG, JPG, or GIF. The exporter creates a **506 px** wide center piece and a **100 px** wide side piece, both at the same height.
2. Review the preview. Click **Download pieces (ZIP)** if you want to save the files or attach them manually.
3. While signed in to Steam, click **Upload to Steam**. This opens two forms, one for each piece. Keep the viewer tab open while the files are attached.
4. Review and publish each piece in its Steam form. You can also adjust long artwork mode or apply an invisible title there.

The **Featured Artwork Showcase** uses a single **630 px** wide piece. The two-piece export is designed for the standard Artwork Showcase.

### Place the pieces on your profile

1. In Steam, go to **Edit Profile → Featured Showcase** and select or add an Artwork Showcase. You can also click **Use on my profile** in the viewer after selecting two posts.
2. In the profile editor, click **Choose artwork in the viewer** and select the left and right posts from your gallery.
3. Click **Place in this showcase**, choose the target showcase, and click **Place both pieces**.
4. Check the preview and click **Save** in Steam.

## Troubleshooting

| Issue | What to do |
| --- | --- |
| **View artwork** is missing | Refresh the tab after installing the extension and try a profile with an Artwork Showcase or an individual artwork post. |
| Steam does not show the center and side slots | Select or add a standard Artwork Showcase in your profile editor and try placing the pieces again. |
| An upload form does not attach a piece | Reopen the forms from the viewer. You can also extract the ZIP and attach the files manually. |
| Steam rate-limits gallery requests | Wait for the time shown in the viewer before reloading the gallery. |

## Privacy and permissions

The extension processes the images you select in your browser. If you choose to upload them, it attaches them to Steam's forms so you can review and submit them. The extension reads Steam Community posts and accesses Steam's image domains (`steamusercontent.com` and `steamuserimages-a.akamaihd.net`) to load artwork. It stores your language preference in Steam Community's local storage.

## Development

The extension uses JavaScript and requires no dependency installation or build step. Start with [manifest.json](extension/manifest.json), which defines the service worker and the scripts that run on Steam Community. The viewer is in [viewer.js](extension/viewer.js), shared dimensions are in [constants.js](extension/constants.js), and interface text is in [i18n.js](extension/i18n.js).

To test from a checkout, load the `extension/` folder in Chrome. After making changes, click **Reload** on the extension card at `chrome://extensions`, then refresh your Steam tab.

This is an independent project with no affiliation with Valve or Steam.

## GitHub releases

Changes under `extension/` on the main branch automatically publish a new GitHub Release with a ZIP you can extract and load into Chrome. The first release uses the version in the manifest. Later releases increment the patch version unless the manifest already specifies a higher version. The workflow writes that version into the ZIP's manifest, so no version commit is needed. Documentation-only changes do not trigger a release.

To publish the first ZIP without an extension change, run the **GitHub Release** workflow manually from the **Actions** tab. To update a manually installed copy, extract the new ZIP into the same folder, then click **Reload** in Chrome.
