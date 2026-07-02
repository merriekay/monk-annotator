// The Monk Skin Tone (MST) Scale, as published by Google. Ten steps, lettered
// A (lightest) through J (darkest) -- NOT numbered 1-10. FSboard and this tool
// both use the lettered form throughout, so every label in this codebase is a
// string like "MST_D".
export const MST_LABELS = [
  'MST_A',
  'MST_B',
  'MST_C',
  'MST_D',
  'MST_E',
  'MST_F',
  'MST_G',
  'MST_H',
  'MST_I',
  'MST_J',
]

// Official hex swatches from Google's MST specification, used for the
// reference panel and for the small color chip next to each label.
export const MST_COLORS = {
  MST_A: '#f6ede4',
  MST_B: '#f3e7db',
  MST_C: '#f7ead0',
  MST_D: '#eadaba',
  MST_E: '#d7bd96',
  MST_F: '#a07e56',
  MST_G: '#825c43',
  MST_H: '#604134',
  MST_I: '#3a312a',
  MST_J: '#292420',
}

// Two-step divergence is the QC threshold called for by the research brief:
// if the human rating and the ITA-estimated rating are more than 2 letters
// apart on the A-J scale, the signer gets flagged for a second look.
export const FLAG_DIVERGENCE_THRESHOLD = 2
