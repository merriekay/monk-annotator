import { MST_LABELS, MST_COLORS } from '../constants'

// MonkSwatch renders the full A-J reference strip so the rater always has a
// consistent visual anchor on screen (skin tone perception drifts easily
// without a fixed reference to compare against). It also carries the
// background a new rater needs on what the scale is and where it comes from.
export default function MonkSwatch() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3">
      <h2 className="mb-1 text-sm font-semibold text-gray-700">
        Monk Scale reference
      </h2>
      <p className="mb-2 text-xs text-gray-500">
        The Monk Skin Tone (MST) Scale is a 10-shade scale developed by
        Harvard sociologist Dr. Ellis Monk, in partnership with Google, to
        represent a broader range of human skin tones than older standards
        allow.{' '}
        <a
          href="https://skintone.google/"
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-gray-700"
        >
          About the scale
        </a>{' '}
        &middot;{' '}
        <a
          href="https://arxiv.org/abs/2305.09073"
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-gray-700"
        >
          Schumann et al., "Consensus and Subjectivity of Skin Tone Annotation
          for ML Fairness"
        </a>
      </p>
      <div className="flex overflow-hidden rounded border border-gray-200">
        {MST_LABELS.map((label) => (
          <div key={label} className="flex-1 text-center">
            <div
              className="h-10 w-full"
              style={{ backgroundColor: MST_COLORS[label] }}
              title={label}
            />
            <div className="text-[11px] text-gray-500">
              {label.replace('MST_', '')}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
