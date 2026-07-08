import { useEffect, useState } from 'react'
import MonkSwatch from './components/MonkSwatch'
import SignerViewer from './components/SignerViewer'
import ProgressSidebar from './components/ProgressSidebar'
import ExportButton from './components/ExportButton'
import { isFlagged } from './utils/mst'

// App is the top-level component. It owns all annotation state and wires the
// signer list (fetched from the local Kaggle proxy, see server/kaggleProxy.js)
// to SignerViewer/ProgressSidebar/ExportButton.
function App() {
  const [signers, setSigners] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itaLabels, setItaLabels] = useState(null) // null = no ITA file loaded
  const [isLoadingSigners, setIsLoadingSigners] = useState(true)
  const [loadError, setLoadError] = useState(null)

  const hasIta = itaLabels !== null

  // FSboard (124 signers across its train/validation/test splits) lives on
  // Kaggle as raw video, not per-signer images -- too large to download
  // wholesale. /signers.json lists every signer ID across all three splits;
  // each signer's image is then lazy-loaded on demand from
  // /frames/<signerId>.jpg. In dev/production-server mode these are live
  // routes (server/kaggleRoutes.js) that download that signer's clip and
  // extract one frame on first request; in a static export
  // (scripts/build-static-frames.js) they're plain pre-baked files. Either
  // way the frontend fetches the same URLs.
  useEffect(() => {
    fetch('/signers.json')
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load signer list (HTTP ${res.status})`)
        return res.json()
      })
      .then((signerIds) => {
        setSigners(
          signerIds.map((signerId) => ({
            signerId,
            imageUrl: `/frames/${signerId}.jpg`,
            monkLabel: null,
            itaLabel: null,
            flagged: false,
            notes: '',
          })),
        )
      })
      .catch((err) => setLoadError(err.message))
      .finally(() => setIsLoadingSigners(false))
  }, [])

  // Reads ita_labels.json ({ signer_id: "MST_X", ... }) and merges it onto
  // any signers already loaded. Loading order (images first vs. ITA file
  // first) shouldn't matter, so we merge in both handlers.
  function handleItaFileSelected(event) {
    const file = event.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const parsed = JSON.parse(reader.result)
      setItaLabels(parsed)
      setSigners((prev) =>
        prev.map((signer) => {
          const itaLabel = parsed[signer.signerId] ?? null
          return {
            ...signer,
            itaLabel,
            flagged: isFlagged(signer.monkLabel, itaLabel),
          }
        }),
      )
    }
    reader.readAsText(file)
  }

  // Applies a rating to the signer at `index` and recomputes its flagged
  // status against the ITA label (if any).
  function rateSigner(index, monkLabel) {
    setSigners((prev) =>
      prev.map((signer, i) =>
        i === index
          ? { ...signer, monkLabel, flagged: isFlagged(monkLabel, signer.itaLabel) }
          : signer,
      ),
    )
  }

  function updateNotes(index, notes) {
    setSigners((prev) =>
      prev.map((signer, i) => (i === index ? { ...signer, notes } : signer)),
    )
  }

  function goNext() {
    setCurrentIndex((i) => Math.min(i + 1, signers.length - 1))
  }

  function goBack() {
    setCurrentIndex((i) => Math.max(i - 1, 0))
  }

  const currentSigner = signers[currentIndex]

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <div>
          <h1 className="text-lg font-bold text-gray-900">
            MST Skin Tone Annotation Tool
          </h1>
          <p className="text-xs text-gray-500">
            All FSboard signers, via Kaggle (googleai/fsboard)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="cursor-pointer rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Load ita_labels.json
            <input
              type="file"
              accept="application/json"
              onChange={handleItaFileSelected}
              className="hidden"
            />
          </label>
          <ExportButton signers={signers} />
        </div>
      </header>

      {isLoadingSigners ? (
        <div className="flex flex-1 items-center justify-center text-gray-400">
          Loading signer list from Kaggle...
        </div>
      ) : loadError ? (
        <div className="flex flex-1 items-center justify-center px-4 text-center text-red-500">
          {loadError}
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto p-4">
            <div className="mx-auto flex max-w-2xl flex-col gap-4">
              <MonkSwatch />
              <SignerViewer
                signer={currentSigner}
                position={currentIndex + 1}
                totalSigners={signers.length}
                hasIta={hasIta}
                onRate={(label) => rateSigner(currentIndex, label)}
                onNotesChange={(notes) => updateNotes(currentIndex, notes)}
                onNext={goNext}
                onBack={goBack}
              />
            </div>
          </main>
          <ProgressSidebar
            signers={signers}
            currentIndex={currentIndex}
            onSelect={setCurrentIndex}
          />
        </div>
      )}
    </div>
  )
}

export default App
