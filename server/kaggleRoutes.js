// Core Kaggle-backed route handlers, shared between the Vite dev-server
// middleware (server/kaggleProxy.js, used by `npm run dev`) and the
// standalone production server (server/index.js, used by `npm start` after
// `npm run build`). FSboard's full 1TB dataset lives on Kaggle as raw video
// clips, not per-signer images, so downloading it locally isn't practical.
// Instead this talks to the Kaggle API server-side (KAGGLE_API_TOKEN never
// reaches the browser), and for each signer downloads just one short clip on
// demand and extracts a single representative frame from it with ffmpeg.
// Extracted frames are cached to disk so each signer is only fetched/decoded
// once per machine.
import { existsSync } from 'node:fs'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { execFile } from 'node:child_process'
import path from 'node:path'
import { promisify } from 'node:util'
import ffmpegPath from 'ffmpeg-static'

const execFileAsync = promisify(execFile)

const DATASET = 'googleai/fsboard'
// FSboard's signers are split across train/validation/test with no overlap
// between them (124 signers combined); annotating the full set means pulling
// metadata from all three, not just the test split.
const SPLITS = ['train', 'validation', 'test']

const CACHE_DIR = path.resolve('.cache')
const FRAMES_DIR = path.join(CACHE_DIR, 'frames')
const TMP_DIR = path.join(CACHE_DIR, 'tmp')

async function kaggleFetch(token, filePath) {
  const url = `https://www.kaggle.com/api/v1/datasets/download/${DATASET}/${encodeURIComponent(filePath)}`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) {
    throw new Error(`Kaggle API request for "${filePath}" failed: ${res.status} ${res.statusText}`)
  }
  return res
}

// Each split's metadata lists every annotated clip (thousands per split),
// each tagged with a signerId. We only need one clip per signer, so we keep
// the first one we see for each and record its duration (and which split it
// came from, since that's part of the clip's path) to fetch it later.
async function loadSplitRecords(token, split) {
  const cachedPath = path.join(CACHE_DIR, `daun_v3-${split}-metadata.json`)
  if (existsSync(cachedPath)) {
    return JSON.parse(await readFile(cachedPath, 'utf-8'))
  }
  const res = await kaggleFetch(token, `daun_v3/metadata/daun_v3-${split}.json`)
  const text = await res.text()
  await mkdir(CACHE_DIR, { recursive: true })
  await writeFile(cachedPath, text)
  return JSON.parse(text)
}

export async function loadSignerClips(token) {
  const bySigner = new Map()
  for (const split of SPLITS) {
    const records = await loadSplitRecords(token, split)
    for (const record of records) {
      if (!bySigner.has(record.signerId)) {
        bySigner.set(record.signerId, {
          split,
          clipFilename: record.clipFilename,
          durationS: record.clipEndTimeS - record.clipStartTimeS,
        })
      }
    }
  }
  return bySigner
}

export async function extractFrame(token, signerId, clip) {
  await mkdir(FRAMES_DIR, { recursive: true })
  const framePath = path.join(FRAMES_DIR, `${signerId}.jpg`)
  if (existsSync(framePath)) return framePath

  await mkdir(TMP_DIR, { recursive: true })
  const clipPath = path.join(TMP_DIR, `${signerId}.mp4`)
  const res = await kaggleFetch(
    token,
    `daun_v3/video_clips/daun_v3-${clip.split}/${clip.clipFilename}`,
  )
  await writeFile(clipPath, Buffer.from(await res.arrayBuffer()))

  try {
    const midpoint = Math.max(0.5, clip.durationS / 2)
    await execFileAsync(ffmpegPath, [
      '-ss', String(midpoint),
      '-i', clipPath,
      '-frames:v', '1',
      '-q:v', '2',
      framePath,
    ])
  } finally {
    await rm(clipPath, { force: true })
  }
  return framePath
}

// Builds the two request handlers, served at /signers.json and
// /frames/<signerId>.jpg -- the same paths used by the static-export build
// (scripts/build-static-frames.js), so the frontend fetches identical URLs
// whether it's talking to a live server or plain static files. Each handler
// is a plain (req, res) function written against the Node `connect`-style
// convention (as used by both Vite's server.middlewares and a bare
// http.createServer): the caller is expected to have already stripped the
// route's mount prefix from req.url before calling the frame handler, so it
// only ever sees "/<signerId>.jpg".
export function createKaggleRoutes(token) {
  // Loading the metadata files happens once per server run; cache the
  // in-flight/completed promise so concurrent requests share it.
  let signerClipsPromise = null
  // Per-signer extraction is also deduped so rapid Back/Next clicks don't
  // trigger duplicate downloads of the same clip.
  const framePromises = new Map()

  function getSignerClips() {
    if (!signerClipsPromise) signerClipsPromise = loadSignerClips(token)
    return signerClipsPromise
  }

  async function handleSigners(req, res) {
    try {
      const clips = await getSignerClips()
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify([...clips.keys()].sort()))
    } catch (err) {
      res.statusCode = 502
      res.end(String(err.message ?? err))
    }
  }

  async function handleFrame(req, res) {
    const signerId = decodeURIComponent(
      req.url.replace(/^\//, '').split('?')[0].replace(/\.jpg$/, ''),
    )
    try {
      const clips = await getSignerClips()
      const clip = clips.get(signerId)
      if (!clip) {
        res.statusCode = 404
        res.end(`Unknown signer: ${signerId}`)
        return
      }

      if (!framePromises.has(signerId)) {
        framePromises.set(
          signerId,
          extractFrame(token, signerId, clip).finally(() => framePromises.delete(signerId)),
        )
      }
      const framePath = await framePromises.get(signerId)

      res.setHeader('Content-Type', 'image/jpeg')
      res.end(await readFile(framePath))
    } catch (err) {
      res.statusCode = 502
      res.end(String(err.message ?? err))
    }
  }

  return { handleSigners, handleFrame }
}
