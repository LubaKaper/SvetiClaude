/**
 * English drills: short multiple-choice exercises on grammar and thesis
 * writing, built from the vocabulary of the student's game. Like the algebra
 * quests they are generated and checked locally — no AI involved.
 */
import { resolveGame } from '../config/games.js'
import { makeRng } from './rng.js'

export const SKILLS = [
  { id: 'homophones', name: 'Confusing words', blurb: "Its / it's, their / there, than / then" },
  { id: 'commas', name: 'Commas & run-ons', blurb: 'Punctuate sentences correctly' },
  { id: 'agreement', name: 'Subject–verb agreement', blurb: 'Match the verb to its subject' },
  { id: 'thesis', name: 'Strong thesis', blurb: 'Spot a claim worth arguing' },
]

const FILL = 'Pick the word that completes the sentence.'
const PUNCT = 'Which sentence is punctuated correctly?'

/**
 * Templates. `w` holds the game's words: G (name), I (items), at (place with
 * preposition), M (creatures/opponents). The first option is always the
 * correct one; options are shuffled when a drill is generated.
 */
const TEMPLATES = {
  homophones: [
    (w) => ({ sentence: `The ${w.M} are close. ___ waiting ${w.at}.`, options: ["They're", 'Their', 'There'], rule: '**They\'re** is short for "they are". **Their** shows ownership, and **there** points to a place.', hint: 'Try reading it as "they are". Does the sentence still make sense?' }),
    (w) => ({ sentence: `I left my ${w.I} over ___.`, options: ['there', 'their', "they're"], rule: '**There** points to a place. **Their** shows ownership, and **they\'re** means "they are".', hint: 'The blank is a place. Which spelling has "here" hiding inside it?' }),
    (w) => ({ sentence: `The ${w.M} dropped ___ ${w.I}.`, options: ['their', 'there', "they're"], rule: '**Their** shows that something belongs to them. **There** is a place, and **they\'re** means "they are".', hint: `Who do the ${w.I} belong to? You need the ownership word.` }),
    (w) => ({ sentence: `___ going to need more ${w.I} before you head out.`, options: ["You're", 'Your'], rule: '**You\'re** is short for "you are". **Your** shows ownership.', hint: 'Try reading it as "you are".' }),
    (w) => ({ sentence: `Is that ___ last round of ${w.G} tonight?`, options: ['your', "you're"], rule: '**Your** shows ownership (your round). **You\'re** means "you are".', hint: 'Would "you are last round" make sense?' }),
    (w) => ({ sentence: `___ hard to find ${w.I} ${w.at}.`, options: ["It's", 'Its', "Its'"], rule: '**It\'s** is short for "it is". **Its** (no apostrophe) shows ownership, and **its\'** is never correct.', hint: 'Try reading it as "it is".' }),
    (w) => ({ sentence: `${w.G} is famous for ___ soundtrack.`, options: ['its', "it's", "its'"], rule: '**Its** (no apostrophe) shows ownership, like "his" or "her". **It\'s** always means "it is".', hint: 'Would "famous for it is soundtrack" make sense?' }),
    (w) => ({ sentence: `I have more ${w.I} ___ you do.`, options: ['than', 'then'], rule: '**Than** compares two things. **Then** is about time or order.', hint: 'Is the sentence comparing two things, or saying what happened next?' }),
    (w) => ({ sentence: `We grabbed the ${w.I} and ___ ran.`, options: ['then', 'than'], rule: '**Then** is about time or order (what happened next). **Than** compares.', hint: 'Is the sentence comparing two things, or saying what happened next?' }),
    (w) => ({ sentence: `The ${w.M} were ___ strong for us.`, options: ['too', 'to', 'two'], rule: '**Too** means "more than enough" or "also". **To** is a direction, and **two** is the number.', hint: 'The blank means "more than we could handle".' }),
  ],
  commas: [
    (w) => ({ options: [`I collected the ${w.I}, and my friend watched for ${w.M}.`, `I collected the ${w.I}, my friend watched for ${w.M}.`, `I collected the ${w.I} and, my friend watched for ${w.M}.`], rule: 'Two complete sentences joined by **and**, **but** or **so** take a comma **before** the joining word. A comma alone (a "comma splice") is not enough.', hint: 'There are two complete thoughts here. Where does the first one end?' }),
    (w) => ({ options: [`After the match ended, we counted our ${w.I}.`, `After the match ended we, counted our ${w.I}.`, `After, the match ended we counted our ${w.I}.`], rule: 'An introductory clause ("After the match ended") is followed by a comma before the main sentence starts.', hint: 'Find where the opening "After…" part ends and the main sentence begins.' }),
    (w) => ({ options: [`We needed ${w.I}, a map, and a plan.`, `We needed, ${w.I} a map and a plan.`, `We needed ${w.I} a map, and, a plan.`], rule: 'Commas separate the items in a list of three or more.', hint: 'Count the things they needed. A comma goes between each one.' }),
    (w) => ({ options: [`The ${w.M} were everywhere; we had to leave.`, `The ${w.M} were everywhere, we had to leave.`, `The ${w.M} were everywhere we had to leave.`], rule: 'Two complete sentences can be joined with a **semicolon**. A comma alone makes a comma splice, and nothing at all makes a run-on.', hint: 'Both halves could stand alone as sentences. A comma is too weak to hold them together.' }),
    (w) => ({ options: [`Let's play ${w.G}, everyone.`, `Let's play ${w.G} everyone.`, `Let's, play ${w.G} everyone.`], rule: 'When you speak directly to someone, set off their name (or "everyone") with a comma.', hint: 'Who is being spoken to? That word needs to be set apart.' }),
    (w) => ({ options: [`We found the ${w.I} and left quickly.`, `We found the ${w.I}, and left quickly.`, `We found, the ${w.I} and left quickly.`], rule: 'No comma is needed before **and** when the second part has no subject of its own ("left quickly" is not a full sentence).', hint: 'Is "left quickly" a complete sentence by itself?' }),
  ],
  agreement: [
    (w) => ({ sentence: `The pile of ${w.I} ___ bigger every minute.`, options: ['gets', 'get'], rule: `The subject is **pile** (one pile), not ${w.I}, so the verb is singular: "the pile gets".`, hint: 'What is actually getting bigger — find the one-word subject.' }),
    (w) => ({ sentence: `The ${w.M} ${w.at} ___ waiting for you.`, options: ['are', 'is'], rule: `The subject is **${w.M}** (more than one), so the verb is plural: "are". The words in between don't change that.`, hint: `Ignore "${w.at}". Who is waiting?` }),
    () => ({ sentence: 'Each of the players ___ a different strategy.', options: ['has', 'have'], rule: '**Each** is singular — it means each one — so it takes "has", even when "players" comes right before the verb.', hint: 'Read it as "each one".' }),
    (w) => ({ sentence: `My friends and I ___ ${w.G} every weekend.`, options: ['play', 'plays'], rule: 'Two subjects joined by **and** ("my friends and I") are plural, so the verb is "play".', hint: 'How many people are playing?' }),
    (w) => ({ sentence: `One of the ${w.M} ___ right behind you.`, options: ['is', 'are'], rule: `The subject is **one**, not ${w.M}, so the verb is singular: "one … is".`, hint: 'How many are behind you?' }),
    (w) => ({ sentence: `Everyone on my team ___ more ${w.I}.`, options: ['wants', 'want'], rule: '**Everyone** is singular (every one), so it takes "wants".', hint: 'Read it as "every single person".' }),
    (w) => ({ sentence: `There ___ three ${w.M} near the exit.`, options: ['are', 'is'], rule: `In a "there is / there are" sentence the subject comes **after** the verb. "Three ${w.M}" is plural, so use "are".`, hint: 'The subject comes after the blank. Is it one or many?' }),
  ],
}

const WEAK_THESES = [
  (w) => `${w.G} is a video game that many people play.`,
  (w) => `${w.G} is really fun, and I like it a lot.`,
  (w) => `In this essay I will talk about ${w.G}.`,
  (w) => `There are many good and bad things about ${w.G}.`,
  (w) => `Why do so many people play ${w.G}?`,
]

function shuffle(list, rand) {
  const out = [...list]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/**
 * Build a drill.
 * @param {object} opts
 * @param {string} opts.game  - a game name from the player's preferences (or '')
 * @param {string} opts.topic - one of SKILLS ids
 * @param {number} [opts.seed]
 */
export function generateDrill({ game = '', topic = 'homophones', seed } = {}) {
  const pack = resolveGame(game)
  const skill = SKILLS.some((s) => s.id === topic) ? topic : 'homophones'
  const usedSeed = seed ?? (Math.random() * 2 ** 32) >>> 0
  const rand = makeRng(usedSeed)
  const pick = (list) => list[Math.floor(rand() * list.length)]
  const words = {
    G: pack.id === 'generic' ? 'this game' : pack.name,
    I: pack.lex.items,
    at: pack.lex.at,
    M: pack.lex.mobs,
  }

  let body
  if (skill === 'thesis') {
    const claim = `${pick(pack.lex.claims)}.`
    const weak = shuffle(WEAK_THESES, rand).slice(0, 3).map((fn) => fn(words)).map((t) => t[0].toUpperCase() + t.slice(1))
    body = {
      ask: 'Which sentence would make the strongest thesis statement?',
      options: [claim, ...weak],
      rule: 'A strong thesis makes a **claim someone could disagree with** and gives a **reason**. Facts, vague opinions, questions and "In this essay I will…" announcements give a reader nothing to argue with.',
      hint: 'Look for the sentence that takes a side and says why ("because…").',
    }
  } else {
    const t = pick(TEMPLATES[skill])(words)
    body = { ask: t.sentence ? FILL : PUNCT, ...t }
  }

  const correct = body.options[0]
  const options = shuffle(body.options, rand)

  return {
    kind: 'choice',
    id: `${pack.id}-${skill}-1-${usedSeed}`,
    topic: skill,
    level: 1,
    game: { id: pack.id, name: pack.name, emoji: pack.emoji, tint: pack.tint },
    ask: body.ask,
    sentence: body.sentence || null,
    options,
    answerIndex: options.indexOf(correct),
    answer: correct,
    hints: [body.hint],
    explain: body.rule,
  }
}
