# Skin Tone Annotation Tool

A lightweight tool for manually assigning Monk Skin Tone (MST) Scale labels
to FSboard ASL fingerspelling signers, for use in fairness analysis. No
database — everything you rate lives in memory for the browser session.
Signer images are fetched on demand from FSboard's Kaggle dataset through a
small server-side proxy (see below) rather than requiring the full ~1TB
dataset to be downloaded.

## Background: the Monk Skin Tone Scale

The Monk Skin Tone (MST) Scale is a 10-shade scale developed by Harvard
sociologist Dr. Ellis Monk, in partnership with Google, to represent a
broader range of human skin tones than older standards (e.g. the Fitzpatrick
scale) allow — particularly for skin tones that were historically
underrepresented. See [skintone.google](https://skintone.google/) for
Google's overview, and Schumann et al.,
["Consensus and Subjectivity of Skin Tone Annotation for ML Fairness"](https://arxiv.org/abs/2305.09073)
(arXiv:2305.09073) for the methodology this tool's rating instructions are
based on.

## Labeling system

MST labels use **letters, not numbers**: `MST_A` (lightest) through `MST_J`
(darkest), matching the FSboard paper and Google's official MST
documentation.

## Setup

1. Get a Kaggle API token (Kaggle → Settings → API → "Create New Token") and
   make sure your account has accepted FSboard's dataset terms at
   [kaggle.com/datasets/googleai/fsboard](https://www.kaggle.com/datasets/googleai/fsboard).
2. Copy `.env.example` to `.env` and fill in `KAGGLE_API_TOKEN`.
3. Install and run:
   ```bash
   npm install
   npm run dev
   ```

Then open the URL Vite prints (usually `http://localhost:5173`).

`KAGGLE_API_TOKEN` is only ever read server-side (by `server/kaggleRoutes.js`)
— it's never bundled into the browser code.

## Deploying to a server

For running on a shared/remote machine instead of your own laptop:

1. Copy the project to the server (e.g. `git clone`, `rsync`, or `scp -r`),
   excluding `node_modules`, `dist`, and `.cache`.
2. On the server:
   ```bash
   npm install
   npm run build      # builds the frontend into dist/
   ```
3. Set up `.env` on the server with `KAGGLE_API_TOKEN`. If the server has a
   public IP/URL (anyone besides you/your RA could reach it), also set
   `BASIC_AUTH_USER` and `BASIC_AUTH_PASSWORD` — without them, anyone who
   finds the URL can burn through your Kaggle quota and view FSboard footage
   through your server with no login prompt.
4. Start it:
   ```bash
   npm start           # runs server/index.js, serving dist/ + the API on PORT (default 8080)
   ```
   Use a process manager (e.g. `pm2 start npm --name mst-tool -- start`, or a
   `systemd` unit running `npm start`) so it survives reboots/SSH
   disconnects, and put it behind a reverse proxy (nginx/Caddy) if you want
   HTTPS on a real domain.

`npm run dev` (Vite) and `npm start` (the standalone server) both serve the
same `/api/signers` / `/api/frame` routes via the shared
`server/kaggleRoutes.js` — only the latter adds Basic Auth and serves the
built static files instead of running Vite's dev server.

## Loading data

1. **Signer images** — loaded automatically. On startup the app calls
   `/api/signers`, which lists every signer ID across FSboard's
   train/validation/test splits (124 signers total, no overlap between
   splits). Each signer's image is then fetched lazily, one at a time, from
   `/api/frame/<signerId>` as you navigate to them: the proxy downloads just
   that signer's first video clip from Kaggle, extracts a single frame from
   its midpoint with `ffmpeg`, and caches the result in `.cache/frames/` so
   it's instant on subsequent loads. The first time you view a given signer,
   expect a few seconds' delay while the clip downloads and the frame is
   extracted.
2. **ITA labels (optional)** — click "Load ita_labels.json" and select a
   JSON file mapping signer ID to an ITA-estimated MST label:

   ```json
   { "12345678": "MST_G", "87654321": "MST_C" }
   ```

   If you skip this step, the tool still works — the ITA reference and
   flagging are just hidden/disabled.

## Rating

- Click a swatch in the picker, or press keys **A–J** on your keyboard to
  assign `MST_A` through `MST_J` to the current signer.
- Use the **Back** / **Next** buttons (or Left/Right arrow keys) to move
  between signers and revise earlier ratings.
- Add optional free-text notes per signer.
- Signers where the human rating and ITA estimate diverge by **more than 2
  steps** on the A–J scale are automatically flagged and highlighted, both
  on the signer view and in the sidebar, so you can return to them.

## Exporting

Click **Export JSON** at any time (you don't need to finish the whole
batch first) to download `mst_annotations.json` in this format:

```json
[
  {
    "signer_id": "12345678",
    "monk_label": "MST_D",
    "ita_label": "MST_G",
    "flagged": true,
    "notes": ""
  }
]
```

## Methodological caveat

The original FSboard paper assigned Monk labels by **majority vote of 3
trained raters**. This tool supports **single-rater** annotation, using the
ITA estimate only as a QC/sanity check to flag likely disagreements — it is
not a substitute for multi-rater reconciliation. Treat single-rater labels
produced here as provisional; multi-rater reconciliation is out of scope for
this tool and left as future work.

## Project structure

```
server/
  kaggleRoutes.js         shared route handlers: /api/signers and
                           /api/frame/<signerId>, backed by the Kaggle API
  kaggleProxy.js          Vite dev-server adapter (used by `npm run dev`)
  index.js                standalone production server + Basic Auth
                           (used by `npm start`, after `npm run build`)
src/
  constants.js          MST label list, official hex colors, flag threshold
  utils/mst.js           flag calculation, JSON export
  components/
    MonkSwatch.jsx        the A-J reference color strip
    MonkPicker.jsx         the 10-swatch rating control
    SignerViewer.jsx       image + ITA reference + picker + notes + nav
    ProgressSidebar.jsx    per-signer list with ratings and flags
    ExportButton.jsx       serializes state to mst_annotations.json
  App.jsx                 top-level state and signer loading
```

`.cache/` (gitignored) holds downloaded metadata and extracted frame JPEGs
between runs. Delete it to force a fresh pull from Kaggle.

## Scope notes

- No database; annotation state lives in memory for the browser session
  (only the frame cache is persisted, on disk). Authentication is optional
  and only applies to the production server (`npm start`), via
  `BASIC_AUTH_USER`/`BASIC_AUTH_PASSWORD`.
- Static frames only, no video playback — one frame is extracted per signer
  from their first available clip.
- `vite preview` does not run the Kaggle proxy — use `npm run dev` locally or
  `npm start` (after `npm run build`) for a deployed instance.
- Single-rater only; no multi-rater reconciliation UI.
