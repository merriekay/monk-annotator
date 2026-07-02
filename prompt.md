Build a lightweight skin-tone annotation tool for ASL fairness research.

## Context

We're building a ground truth dataset for the FSboard ASL fingerspelling dataset. A researcher
needs to manually assign Monk Skin Tone Scale (MST) labels to individual signers using video
frames. The tool should make it fast to rate each signer, flag ITA disagreements for review,
and export a clean JSON file for use in a downstream Colab notebook.

## What to build

A local React app (Vite) that:

1. Loads a folder of signer images/video frames from the local filesystem
2. Displays one signer at a time with their signer ID
3. Lets the researcher assign a Monk Skin Tone Scale label using the official lettered system:
   MST_A through MST_J (A = lightest, J = darkest)
4. Optionally displays the ITA-estimated label alongside the image as a QC reference
5. Flags and visually highlights cases where the human label and ITA label diverge by more
   than 2 steps (e.g., human says MST_C, ITA says MST_F or darker)
6. Tracks progress (e.g., "12 of 45 rated")
7. Allows going back and revising a previous rating
8. Exports a JSON file on completion in this format:

[
{
"signer_id": "12345678",
"monk_label": "MST_D",
"ita_label": "MST_G",
"flagged": true,
"notes": ""
},
...
]

## Labeling system — important

The Monk Skin Tone Scale uses LETTERS, not numbers. The official 10 labels are:
MST_A, MST_B, MST_C, MST_D, MST_E, MST_F, MST_G, MST_H, MST_I, MST_J
(A = lightest, J = darkest)

This matches the labeling used in the FSboard dataset paper and Google's official
documentation. Do NOT use 1–10; use A–J throughout the UI and all exported data.

## Input data

- Signer images: assume a flat folder of JPGs/PNGs. FSboard signer IDs are numeric/anonymous
  (e.g., "12345678.jpg") — derive signer_id from the filename without extension
- ITA labels: loaded from a companion JSON file (ita_labels.json) mapping signer_id to
  an MST letter:
  { "12345678": "MST_G", "87654321": "MST_C", ... }
- If no ITA file is provided, the tool should still work — just hide the ITA column
  and disable flagging

## Monk Scale reference panel

Display a color swatch reference panel so the rater has a consistent visual anchor.
Use these official hex values from Google's MST specification:
MST_A: #f6ede4
MST_B: #f3e7db
MST_C: #f7ead0
MST_D: #eadaba
MST_E: #d7bd96
MST_F: #a07e56 ← note: NOT #a07850
MST_G: #825c43
MST_H: #604134
MST_I: #3a312a
MST_J: #292420

## UX requirements

- Keyboard shortcuts for rating: keys A–J map directly to MST_A through MST_J
- A "next" button and a "back" button for navigation
- A notes field per signer for optional free-text annotation
- A sidebar or progress list showing all signers, their current label (if rated),
  and a flag indicator
- Flagged signers should be visually marked in the sidebar so the researcher can return to them
- "Export JSON" button available at any time (not just on completion)

## Technical requirements

- Vite + React (functional components, hooks only — no class components)
- No backend — runs fully locally in the browser
- File loading via the browser File API (folder picker for images, file picker for
  ita_labels.json)
- JSON export via browser download (no server needed)
- Clean, well-commented code — this will be shared with an undergraduate research assistant
  who is learning React
- Tailwind CSS for styling (keep it readable and minimal — this is a research tool,
  not a polished product)

## Code quality

- Comment each major component explaining what it does and why
- Comment any non-obvious logic, especially:
  - The flagging threshold calculation (2-step divergence between human and ITA label)
  - The keyboard shortcut handler (A–J mapping)
  - How signer_id is derived from filename
- Keep components small and named clearly:
  SignerViewer, MonkPicker, MonkSwatch, ProgressSidebar, ExportButton
- README with setup instructions: npm install, npm run dev, how to load images,
  how to load the optional ITA file, how to export

## FSboard-specific notes

- FSboard has 147 signers total; the test split used for this fairness analysis has 15 signers
- Signer IDs in FSboard are anonymous numeric strings (not names)
- The original FSboard paper annotated Monk labels by majority vote of 3 trained raters;
  this tool supports single-rater annotation with ITA as a QC check — note this in
  the README as a methodological caveat

## Out of scope

- No database, no authentication, no deployment
- No video playback — static frames only
- No multi-rater reconciliation (single rater for now; multi-rater is future work)
