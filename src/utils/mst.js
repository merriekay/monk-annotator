// Small, dependency-free helper functions used across the app. Kept separate
// from the components so the "business logic" (what counts as a flag, how a
// signer ID is derived, etc.) is easy to find and unit-test in isolation.

import { MST_LABELS, FLAG_DIVERGENCE_THRESHOLD } from '../constants'

// Converts an "MST_X" label to its 0-9 index on the scale (A=0 ... J=9).
// Returns null for missing/invalid labels so callers can skip flagging
// when a rating hasn't been made yet.
export function mstIndex(label) {
  if (!label) return null
  const index = MST_LABELS.indexOf(label)
  return index === -1 ? null : index
}

// A signer is flagged when both a human and an ITA label exist AND they
// disagree by MORE than FLAG_DIVERGENCE_THRESHOLD steps on the A-J scale
// (e.g. human=C, ITA=F is exactly 3 apart -> flagged; ITA=E is 2 apart ->
// not flagged, per the "more than 2 steps" spec).
export function isFlagged(humanLabel, itaLabel) {
  const humanIndex = mstIndex(humanLabel)
  const itaIndexValue = mstIndex(itaLabel)
  if (humanIndex === null || itaIndexValue === null) return false
  return Math.abs(humanIndex - itaIndexValue) > FLAG_DIVERGENCE_THRESHOLD
}

// Triggers a client-side download of `data` as a formatted JSON file. Used by
// ExportButton -- no server round-trip, just an in-memory Blob and a
// synthetic <a> click, which is the standard no-backend download pattern.
export function downloadJson(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
