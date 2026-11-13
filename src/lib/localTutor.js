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
    return `Here's a ${topicName(topic)} problem to try${quest.game.id === 'generic' ? '' : ` — ${quest.game.name} edition`}:\n\n${quest.story}\n\n**${quest.ask}**\n\n*First hint:* ${quest.hints[0]}\n\nWant your answer checked instantly, with more hints? Open **Quests** and pick ${TOPICS.find((t) => t.id === topic).name}.`
  }

  const steps = quest.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')
  const lead =
    intent === 'motivation'
      ? `That's okay — ${topicName(topic)} can trip anyone up at first. Let's take one small example and go slowly.`
      : `Here's how ${topicName(topic)} works, using a worked example.`

  return `${lead}\n\n${quest.story}\n\n**${quest.ask}**\n\n${steps}\n\n**Answer: ${quest.answer.toLocaleString('en-US')}${quest.unit === '%' ? '%' : ` ${quest.unit}`}**${quest.also ? ` (${quest.also})` : ''}\n\nYour turn: open **Quests** to try one like it yourself.`
}

function englishReply(games) {
  const pack = resolveGame(games[0] || '')
  const prompt = pack.writing[0].replace(/^Help me /, '').replace(/^./, (c) => c.toUpperCase())
  return `I'm in **demo mode**, so I can't read your writing yet — but here's a solid way to start any piece.\n\n**Try this prompt:** ${prompt}\n\n1. **Claim** — write one sentence that takes a side someone could disagree with.\n2. **Reasons** — list three reasons you believe it.\n3. **Evidence** — for each reason, note one specific moment or detail${pack.id === 'generic' ? '' : ` from ${pack.name}`} that proves it.\n4. **So what?** — finish with why a reader should care.\n\nConnect an AI key to get feedback on your own sentences.`
}

/** Produce a demo-mode reply for a student message. */
export function localReply({ text, subject, games = [] }) {
  return subject === 'english' ? englishReply(games) : algebraReply(text, games)
}
