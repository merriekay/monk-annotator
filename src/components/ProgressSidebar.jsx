import { MST_COLORS } from '../constants'

// ProgressSidebar lists every signer in the batch, showing at a glance who's
// been rated, what they were rated, and who's flagged for QC review. Clicking
// a row jumps straight to that signer, which is how a researcher revisits and
// revises an earlier rating.
export default function ProgressSidebar({ signers, currentIndex, onSelect }) {
  const ratedCount = signers.filter((s) => s.monkLabel).length

  return (
    <aside className="flex h-full w-64 flex-col border-l border-gray-200 bg-white">
      <div className="border-b border-gray-200 p-3">
        <h2 className="text-sm font-semibold text-gray-700">Progress</h2>
        <p className="text-sm text-gray-500">
          {ratedCount} of {signers.length} rated
        </p>
      </div>
      <ul className="flex-1 overflow-y-auto">
        {signers.map((signer, i) => (
          <li key={signer.signerId}>
            <button
              type="button"
              onClick={() => onSelect(i)}
              className={`flex w-full items-center justify-between gap-2 border-b border-gray-100 px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                i === currentIndex ? 'bg-blue-50' : ''
              }`}
            >
              <span className="flex items-center gap-2 truncate">
                {signer.flagged && (
                  <span
                    className="h-2 w-2 shrink-0 rounded-full bg-red-500"
                    title="Flagged: human/ITA disagreement > 2 steps"
                  />
                )}
                <span className="truncate text-gray-700">
                  {signer.signerId}
                </span>
              </span>
              {signer.monkLabel ? (
                <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-gray-600">
                  <span
                    className="h-2.5 w-2.5 rounded-full border border-gray-300"
                    style={{ backgroundColor: MST_COLORS[signer.monkLabel] }}
                  />
                  {signer.monkLabel.replace('MST_', '')}
                </span>
              ) : (
                <span className="shrink-0 text-xs text-gray-300">--</span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  )
}
