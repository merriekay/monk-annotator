# Lab: Setting Up the MST Skin Tone Annotation Tool

Welcome! In this lab you'll get the annotation tool running on your own
laptop so you can start rating FSboard signers. It should take about
15–20 minutes, most of which is just waiting for installs.

By the end you'll have:
- [ ] A Kaggle account with API access to the FSboard dataset
- [ ] The project code on your machine, open in VSCode
- [ ] The app running in your browser, ready to annotate

:::info
**New to VSCode or the terminal?** Don't worry — every step below tells you
exactly which menu to click and which command to type. You don't need to
know this stuff already.
:::

---

## Part 0: Before you start

You'll need:
1. **VSCode** installed — [code.visualstudio.com](https://code.visualstudio.com/)
2. **Node.js** installed (version 20 or newer) — [nodejs.org](https://nodejs.org/)
   (download the "LTS" version)
3. **Git** installed — [git-scm.com](https://git-scm.com/downloads)
4. A **GitHub account** (you probably already have one)
5. A **Kaggle account** — [kaggle.com](https://www.kaggle.com/) (free to sign up)

To check whether Node and Git are already installed, open a terminal
(see Part 2 if you're not sure how) and run:

```bash
node -v
git --version
```

If either command says "command not found," install it from the links
above before continuing.

> 📸 **Screenshot placeholder:** terminal showing `node -v` and
> `git --version` output.
![Screenshot placeholder: node and git version check](PLACEHOLDER-versions.png)

---

## Part 1: Get a Kaggle API token

The tool pulls signer video clips from Kaggle automatically — you just need
your own access key.

1. Log into [kaggle.com](https://www.kaggle.com/), click your profile
   picture (top right) → **Settings**.
2. Scroll to the **API** section and click **Create New Token**. This
   downloads a file (or shows you a token string) — keep this window open,
   you'll need it in Part 5.

   > 📸 **Screenshot placeholder:** Kaggle Settings page, API section, with
   > the "Create New Token" button visible.
   ![Screenshot placeholder: Kaggle API token creation](PLACEHOLDER-kaggle-token.png)

3. Go to
   [kaggle.com/datasets/googleai/fsboard](https://www.kaggle.com/datasets/googleai/fsboard)
   and click whatever button accepts the dataset's terms/rules (you may
   need to scroll down). **This step is easy to miss but required** — without
   it, the app will get "access denied" errors even with a valid token.

   > 📸 **Screenshot placeholder:** FSboard dataset page showing the
   > terms/rules acceptance button.
   ![Screenshot placeholder: accepting FSboard dataset terms](PLACEHOLDER-dataset-terms.png)

:::warning
Keep your API token private — treat it like a password. Don't post it in
Slack, email, or commit it to GitHub. You'll paste it into a local file
that's set up to never be uploaded (more on that in Part 5).
:::

---

## Part 2: Open a terminal in VSCode

You'll use the terminal to run a few commands. In VSCode:

1. Open the top menu **Terminal → New Terminal** (or press `` Ctrl+` `` on
   Windows/Linux, `` Cmd+` `` on Mac).
2. A panel opens at the bottom of the window with a blinking cursor — that's
   your terminal. Anywhere below that says "run" a command, click into this
   panel, type the command, and press Enter.

> 📸 **Screenshot placeholder:** VSCode with the Terminal menu open,
> highlighting "New Terminal."
![Screenshot placeholder: opening a VSCode terminal](PLACEHOLDER-vscode-terminal.png)

---

## Part 3: Clone the project from GitHub

"Cloning" just means downloading a copy of the project's code (and its
history) from GitHub onto your computer.

**Option A — using VSCode's UI (recommended if you're new to this):**

1. Open the **Command Palette**: `Ctrl+Shift+P` (Windows/Linux) or
   `Cmd+Shift+P` (Mac).
2. Type `Git: Clone` and press Enter.
3. Paste this URL when prompted:
   ```
   https://github.com/merriekay/monk-annotator.git
   ```
4. Choose a folder on your computer where you'd like the project saved
   (e.g. your Desktop or a "Projects" folder).
5. When VSCode asks if you'd like to open the cloned repository, click
   **Open**.

> 📸 **Screenshot placeholder:** Command Palette with "Git: Clone" typed in.
![Screenshot placeholder: Git Clone command palette](PLACEHOLDER-git-clone-palette.png)

> 📸 **Screenshot placeholder:** the folder-picker dialog for choosing where
> to save the clone.
![Screenshot placeholder: choosing clone destination folder](PLACEHOLDER-clone-folder.png)

**Option B — using the terminal:**

```bash
git clone https://github.com/merriekay/monk-annotator.git
cd monk-annotator
code .
```

(The last command, `code .`, opens the folder you just cloned in VSCode.)

**Checkpoint:** you should now see a file list in VSCode's sidebar including
`README.md`, `package.json`, `src/`, and `server/`.

---

## Part 4: Set up your `.env` file

This project needs a small config file called `.env` to store your Kaggle
token. It's intentionally **not** included when you clone the project (and
never gets uploaded to GitHub), so you create your own.

1. In VSCode's file sidebar, find the file named **`.env.example`**.
2. Right-click it → **Copy**, then right-click the folder → **Paste**.
3. Rename the copy to exactly **`.env`** (no `.example` at the end).

   > 📸 **Screenshot placeholder:** VSCode file sidebar showing
   > `.env.example` being copied/renamed to `.env`.
   ![Screenshot placeholder: creating the .env file](PLACEHOLDER-env-file.png)

4. Open `.env` and find the line that starts with `KAGGLE_API_TOKEN=`.
   Paste your token from Part 1 right after the `=`, with no spaces or
   quotes, e.g.:
   ```
   KAGGLE_API_TOKEN=your-token-goes-here
   ```
5. Save the file (`Ctrl+S` / `Cmd+S`).

   > 📸 **Screenshot placeholder:** `.env` file open in the editor with the
   > token filled in (blur/redact the real token before screenshotting!).
   ![Screenshot placeholder: filled-in .env file](PLACEHOLDER-env-filled.png)

:::warning
Never share a screenshot of your `.env` file with the real token visible,
and never commit it to GitHub. If you're ever unsure, ask before pushing.
:::

---

## Part 5: Install and run

Back in the terminal (Part 2), make sure you're inside the project folder,
then run:

```bash
npm install
```

This downloads the project's dependencies — it can take a minute or two and
will print a lot of text. That's normal.

> 📸 **Screenshot placeholder:** terminal after `npm install` finishes
> successfully.
![Screenshot placeholder: npm install output](PLACEHOLDER-npm-install.png)

Once that finishes, start the app:

```bash
npm run dev
```

You'll see output that includes a line like:

```
➜  Local:   http://localhost:5173/
```

**Hold `Cmd`/`Ctrl` and click that link** (or copy it into your browser).

> 📸 **Screenshot placeholder:** terminal showing the `npm run dev` output
> with the local URL.
![Screenshot placeholder: npm run dev output](PLACEHOLDER-npm-dev.png)

**Checkpoint:** your browser should open the MST Annotation Tool, and after
a few seconds the first signer's image should appear.

> 📸 **Screenshot placeholder:** the app running in the browser, showing a
> signer image and the rating swatches.
![Screenshot placeholder: app running in browser](PLACEHOLDER-app-running.png)

:::info
The **first time** you view each signer there's a short delay (a few
seconds) while the tool fetches their clip from Kaggle and extracts a frame.
After that, it's instant — even if you close and reopen the app.
:::

---

## Part 6: Rating signers (quick tour)

- Click a color swatch, or press a letter key **A–J** on your keyboard, to
  rate the current signer's skin tone (A = lightest, J = darkest).
- Use the **Back**/**Next** buttons or **←/→ arrow keys** to move between
  signers.
- Add optional notes in the text box below the picker.
- Click **Export JSON** any time to download your progress so far.

> 📸 **Screenshot placeholder:** close-up of the swatch picker and keyboard
> shortcut hints.
![Screenshot placeholder: rating swatches close-up](PLACEHOLDER-swatches.png)

For the full rating guide (flagging, ITA labels, exporting format), see the
project's `README.md`.

---

## Troubleshooting

| Problem | Likely fix |
|---|---|
| `node: command not found` | Node.js isn't installed — see Part 0. |
| `npm install` fails with permission errors | Try closing and reopening VSCode, or restarting your computer, then try again. |
| Browser shows "Failed to load signer list" | Double-check `.env` has your token with no extra spaces/quotes, and that you accepted the FSboard dataset terms (Part 1, step 3). |
| Kaggle API errors mentioning "403" or "access denied" | You likely skipped accepting the dataset's terms — revisit Part 1, step 3. |
| Port `5173` already in use | Close any other terminal windows running `npm run dev`, or just let Vite pick a different port automatically (it'll say so in the terminal output). |

If you're stuck, take a screenshot of the error and send it my way.
