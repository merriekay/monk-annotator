import { useEffect } from 'react'
import MonkPicker from './MonkPicker'
import { MST_LABELS, MST_COLORS } from '../constants'

// SignerViewer shows the current signer's frame plus everything needed to
// rate it: the image, the ITA reference (if available), a flag banner, the
// MonkPicker, a notes field, and next/back navigation. It also owns the
// keyboard shortcut handler for rating with the A-J keys.
export default function SignerViewer({
  signer,
  position,
  totalSigners,
  onRate,
  onNotesChange,
  onNext,
  onBack,
  hasIta,
}) {
  // Keyboard shortcuts: pressing A-J rates the current signer directly,
  // skipping the mouse entirely. We map the pressed key's char code back to
  // an index into MST_LABELS (A=0, B=1, ... J=9) and ignore anything typed
  // while the notes textarea has focus so raters can type free text without
  // accidentally overwriting their rating.
  useEffect(() => {
    function handleKeyDown(event) {
      const isTypingInField = ['TEXTAREA', 'INPUT'].includes(
        document.activeElement?.tagName,
      )
      if (isTypingInField) return

      const key = event.key.toUpperCase()
      const labelIndex = key.charCodeAt(0) - 65 // 'A' -> 0, 'B' -> 1, ...
      if (key.length === 1 && labelIndex >= 0 && labelIndex < MST_LABELS.length) {
        onRate(MST_LABELS[labelIndex])
        return
      }

      if (event.key === 'ArrowRight') onNext()
      if (event.key === 'ArrowLeft') onBack()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onRate, onNext, onBack])

  if (!signer) {
    return (
      <div className="flex h-full items-center justify-center text-gray-400">
        No signer selected
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">
          Signer {signer.signerId}
        </h2>
        <span className="text-sm text-gray-500">
          Signer {position} of {totalSigners}
        </span>
      </div>

      {signer.flagged && (
        <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          Flagged: human label diverges from ITA estimate by more than 2 steps
        </div>
      )}

      <div className="flex justify-center rounded-lg border border-gray-200 bg-gray-50 p-2">
        <img
          src={signer.imageUrl}
          alt={`Signer ${signer.signerId}`}
          className="max-h-96 rounded object-contain"
        />
      </div>

      {hasIta && (
        <div className="text-sm text-gray-600">
          ITA-estimated label (QC reference):{' '}
          {signer.itaLabel ? (
            <span className="inline-flex items-center gap-1 font-medium">
              <span
                className="h-3 w-3 rounded-full border border-gray-300"
                style={{ backgroundColor: MST_COLORS[signer.itaLabel] }}
              />
              {signer.itaLabel}
            </span>
          ) : (
            <span className="italic text-gray-400">not available</span>
          )}
        </div>
      )}

      <div>
        <p className="mb-2 text-sm text-gray-600">
          Select the swatch that most closely matches this signer's skin tone
          as shown in the image.
        </p>
        <MonkPicker value={signer.monkLabel} onChange={onRate} />
      </div>

      <div>
        <label
          htmlFor="notes"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Notes
        </label>
        <textarea
          id="notes"
          rows={2}
          value={signer.notes}
          onChange={(event) => onNotesChange(event.target.value)}
          placeholder="Optional free-text notes about this signer..."
          className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Next
        </button>
      </div>
    </div>
  )
}
