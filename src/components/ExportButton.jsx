import { downloadJson } from '../utils/mst'

// ExportButton serializes the current annotations to the exact JSON shape
// the downstream Colab notebook expects and triggers a browser download.
// Available at any time (not just when every signer is rated) so the
// researcher can save partial progress.
export default function ExportButton({ signers }) {
  function handleExport() {
    const output = signers.map((signer) => ({
      signer_id: signer.signerId,
      monk_label: signer.monkLabel,
      ita_label: signer.itaLabel,
      flagged: signer.flagged,
      notes: signer.notes,
    }))
    downloadJson(output, 'mst_annotations.json')
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
    >
      Export JSON
    </button>
  )
}
