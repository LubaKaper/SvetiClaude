/**
 * Demo-mode tutor. When no AI key is configured, Sveti still answers with
 * something real: a correct, game-themed worked example built by the quest
 * engine. It is clearly labelled in the UI as an offline example.
 */
import { resolveGame } from '../config/games.js'
import { generateQuest, TOPICS } from './quests.js'
import { classifyIntent, detectTopic } from './intent.js'

const topicName = (id) => TOPICS.find((t) => t.id === id)?.name.toLowerCase() || 'algebra'

function algebraReply(text, games) {
  const topic = detectTopic(text)
  const { intent } = classifyIntent(text)
  const game = games[0] || ''

  if (!topic) {
    const list = TOPICS.map((t) => `- **${t.name}** — ${t.blurb.toLowerCase()}`).join('\n')
    return `I'm running in **demo mode** right now, so I can't hold a full conversation — but I can still teach with real examples${game ? ` from ${resolveGame(game).name}` : ''}. Ask me about any of these:\n\n${list}\n\nOr open **Quests** to practice with instant answer checking.`
  }

  const quest = generateQuest({ game, topic, level: intent === 'practice' || topic === 'linear' ? 2 : 1 })

  if (intent === 'practice') {
    return `Here's a ${topicName(topic)} quest to try. Type your answer right here — I'll check it.\n\n[[quest:${topic}:2]]`
  }

  const steps = quest.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')
  const lead =
    intent === 'motivation'
      ? `That's okay — ${topicName(topic)} can trip anyone up at first. Let's take one small example and go slowly.`
      : `Here's how ${topicName(topic)} works, using a worked example.`

  return `${lead}\n\n${quest.story}\n\n**${quest.ask}**\n\n${steps}\n\n**Answer: ${quest.answer.toLocaleString('en-US')}${quest.unit === '%' ? '%' : ` ${quest.unit}`}**${quest.also ? ` (${quest.also})` : ''}\n\nYour turn: open **Quests** to try one like it yourself.`
}

const SKILL_RULES = [
  ['thesis', /\bthesis|\bessay|\bargu|\bclaim|\boutline|\bbrainstorm|\bpersuasive/],
  ['commas', /\bcomma|\brun-?on|\bpunctuat|\bsemicolon|\bsplice/],
  ['agreement', /\bagreement|\bsubject|\bverb|\bsingular|\bplural/],
  ['homophones', /\bgrammar|\bspell|\bits\b|\bit's|\btheir|\bthere|\byour|\bthan\b|\bthen\b|\bword/],
]

function englishReply(text, games) {
  const pack = resolveGame(games[0] || '')
  const lower = String(text || '').toLowerCase()
  const skill = (SKILL_RULES.find(([, pattern]) => pattern.test(lower)) || ['thesis'])[0]

  if (skill !== 'thesis') {
    return `I'm in **demo mode**, so I can't read your own writing yet — but I can drill the rule with you. Try this one:\n\n[[quest:${skill}]]`
  }

  const prompt = pack.writing[0].replace(/^Help me /, '').replace(/^./, (c) => c.toUpperCase())
  return `I'm in **demo mode**, so I can't read your writing yet — but here's a solid way to start any piece.\n\n**Try this prompt:** ${prompt}\n\n1. **Claim** — write one sentence that takes a side someone could disagree with.\n2. **Reasons** — list three reasons you believe it.\n3. **Evidence** — for each reason, note one specific moment or detail${pack.id === 'generic' ? '' : ` from ${pack.name}`} that proves it.\n4. **So what?** — finish with why a reader should care.\n\nFirst, can you spot a strong claim?\n\n[[quest:thesis]]`
}

/** Produce a demo-mode reply for a student message. */
export function localReply({ text, subject, games = [] }) {
  return subject === 'english' ? englishReply(text, games) : algebraReply(text, games)
}
