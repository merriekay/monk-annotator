import { MST_LABELS, MST_COLORS } from '../constants'

// MonkPicker is the actual rating control: ten swatch buttons, one per MST
// label. Clicking a swatch (or pressing its A-J key, wired up in
// SignerViewer) selects it as the current signer's human_label.
export default function MonkPicker({ value, onChange }) {
  return (
    <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
      {MST_LABELS.map((label, i) => {
        const isSelected = value === label
        // A-J keyboard shortcut letter for this swatch, shown as a hint.
        const shortcutKey = String.fromCharCode(65 + i)
        return (
          <button
            key={label}
            type="button"
            onClick={() => onChange(label)}
            className={`flex flex-col items-center rounded-md border-2 p-1 transition ${
              isSelected
                ? 'border-blue-600 ring-2 ring-blue-300'
                : 'border-gray-200 hover:border-gray-400'
            }`}
            title={`${label} (press ${shortcutKey})`}
          >
            <span
              className="h-8 w-8 rounded"
              style={{ backgroundColor: MST_COLORS[label] }}
            />
            <span className="mt-1 text-xs font-medium text-gray-600">
              {shortcutKey}
            </span>
          </button>
        )
      })}
    </div>
  )
}
