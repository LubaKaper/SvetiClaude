/**
 * Lightweight intent + topic detection that runs in the browser.
 *
 * `classifyIntent` mirrors the rule set of the optional Python service in
 * `server-python/app/classifier.py`, so the app behaves the same whether or
 * not that service is running.
 */

// Rules in priority order: [intent, strong patterns, weak patterns]
const INTENT_RULES = [
  [
    'check_answer',
    [/\bis this (right|correct)\b/, /\bcheck my\b/, /\bdid i (get|do)\b/, /\bam i right\b/, /\breview my\b/, /\bis my answer\b/],
    [/\bcorrect\?/, /\bright\?/, /\bwrong\b/, /\bmistake\b/],
  ],
  [
    'motivation',
    [/\bi('m| am) (so )?(confused|frustrated|lost|stuck)\b/, /\bgive up\b/, /\btoo (hard|difficult)\b/, /\bcan'?t (do|understand|figure|get)\b/, /\bstruggling\b/],
    [/\bhard\b/, /\bdifficult\b/, /\bconfused\b/, /\bstuck\b/, /\blost\b/, /\bfrustrated\b/, /\bdon'?t (get|understand)\b/],
  ],
  [
    'practice',
    [/\bpractice\b/, /\bgive me a problem\b/, /\btry one\b/, /\btry a\b/, /\bquiz\b/, /\bexercise\b/, /\bdrill\b/],
    [/\bproblem\b/, /\bworksheet\b/, /\btest me\b/],
  ],
  [
    'give_example',
    [/\bshow me an example\b/, /\bgive me an example\b/, /\bdemonstrate\b/, /\bwhat does .+ look like\b/, /\bfor example\b/],
    [/\bexample\b/, /\bshow me\b/, /\bsample\b/, /\billustrate\b/],
  ],
  [
    'explain_concept',
    [/\bexplain\b/, /\bwhat is\b/, /\bwhat are\b/, /\bhow does\b/, /\bwhy does\b/, /\bdefine\b/, /\bmeaning of\b/, /\bhelp me understand\b/, /\bwhat do you mean\b/],
    [/\bhow\b/, /\bwhy\b/, /\bwhat\b/],
  ],
]

/** @returns {{intent: string, confidence: number}} */
export function classifyIntent(text) {
  const lower = String(text || '').toLowerCase().trim()
  if (!lower) return { intent: 'other', confidence: 0.3 }

  for (const [intent, strong, weak] of INTENT_RULES) {
    if (strong.some((p) => p.test(lower))) return { intent, confidence: 0.85 }
    if (weak.some((p) => p.test(lower))) return { intent, confidence: 0.6 }
  }
  return { intent: 'other', confidence: 0.3 }
}

// Most specific topics first, so "system of linear equations" lands on systems.
const TOPIC_RULES = [
  ['system', /\bsystems?\b|simultaneous|two (unknowns|variables|equations)|substitution|elimination/],
  ['percent', /%|\bpercent|\bdiscount|\bsale\b|\binterest\b|\bmarkup\b|\btip\b/],
  ['ratio', /\bratios?\b|\bproportion|\bscale\b|\bper\b|\brate\b|unit rate/],
  ['fn', /\bslope\b|\bfunctions?\b|\bgraph|y\s*=\s*m|\bintercept|rate of change|\bline\b/],
  ['linear', /\bequations?\b|\bsolve\b|\bvariable|\bunknown\b|[a-z]\s*[+\-=]\s*\d|\d\s*[a-z]\b\s*[+\-=]/],
]

/** Which quest topic (if any) is this message about? */
export function detectTopic(text) {
  const lower = String(text || '').toLowerCase()
  const hit = TOPIC_RULES.find(([, pattern]) => pattern.test(lower))
  return hit ? hit[0] : null
}
