// One-time (well, one-per-signer-list-change) prefetch that turns the
// Kaggle-backed dev/prod server into a plain static export: downloads every
// signer's clip and extracts their frame (same logic the live server uses
// lazily, per request), then writes them into public/ so `vite build` bundles
// them as ordinary static files. The result needs no server, no Kaggle token,
// and no ffmpeg on whatever host serves it -- just a folder of HTML/JS/JPGs.
//
// Run via `npm run build:static`, which is `node --env-file=.env
// scripts/build-static-frames.js && vite build`.
import { copyFile, mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { loadSignerClips, extractFrame } from '../server/kaggleRoutes.js'

const token = process.env.KAGGLE_API_TOKEN
if (!token) {
  console.error('KAGGLE_API_TOKEN is not set (check .env, and that you ran this with --env-file=.env)')
  process.exit(1)
}

const PUBLIC_FRAMES_DIR = path.resolve('public/frames')

const clips = await loadSignerClips(token)
const signerIds = [...clips.keys()].sort()
console.log(`Found ${signerIds.length} signers. Fetching/extracting frames...`)

await mkdir(PUBLIC_FRAMES_DIR, { recursive: true })

let done = 0
for (const signerId of signerIds) {
  const cachedFramePath = await extractFrame(token, signerId, clips.get(signerId))
  await copyFile(cachedFramePath, path.join(PUBLIC_FRAMES_DIR, `${signerId}.jpg`))
  done += 1
  console.log(`[${done}/${signerIds.length}] ${signerId}`)
}

await writeFile(path.resolve('public/signers.json'), JSON.stringify(signerIds))
console.log(`Done. Wrote public/signers.json and ${signerIds.length} frames to public/frames/.`)
