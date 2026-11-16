import { describe, it, expect } from 'vitest'
import { GAMES } from '../src/config/games.js'
import { SKILLS, generateDrill } from '../src/lib/drills.js'
import { makePractice, splitContent, practiceForMarker, contentForAi, describePractice, topicInfo, practiceToPrompt } from '../src/lib/practice.js'

const packs = [...GAMES.map((g) => g.name), 'Hollow Knight', '']

describe('English drills', () => {
  it('are well-formed for every game, skill and seed', () => {
    for (const game of packs) {
      for (const skill of SKILLS) {
        for (let seed = 1; seed <= 80; seed++) {
          const d = generateDrill({ game, topic: skill.id, seed })
          const where = `${game || 'generic'}/${skill.id}/seed${seed}: ${d.sentence || d.options.join(' | ')}`
          expect(d.kind).toBe('choice')
          expect(d.options.length, where).toBeGreaterThanOrEqual(2)
          expect(new Set(d.options).size, where).toBe(d.options.length)
          expect(d.options[d.answerIndex], where).toBe(d.answer)
          expect(d.hints, where).toHaveLength(1)
          expect(d.explain.length, where).toBeGreaterThan(30)
          const text = [d.ask, d.sentence || '', ...d.options, d.explain, d.hints[0]].join(' ')
          expect(text, where).not.toMatch(/undefined|\[object|\$\{/)
          if (d.sentence) expect(d.sentence.match(/___/g), where).toHaveLength(1)
          else for (const o of d.options) expect(o, where).toMatch(/^[A-ZÀ-Ý'].*[.?]$/)
        }
      }
    }
  })

  it('use the game\'s own vocabulary and shuffle the answer position', () => {
    const texts = Array.from({ length: 40 }, (_, i) => generateDrill({ game: 'Minecraft', topic: 'homophones', seed: i }))
    expect(texts.some((d) => /diamonds|creepers|Nether|Minecraft/.test(d.sentence))).toBe(true)
    expect(new Set(texts.map((d) => d.answerIndex)).size).toBeGreaterThan(1)
    expect(generateDrill({ game: 'Valorant', topic: 'thesis', seed: 2 }).answer).toMatch(/because/)
    expect(generateDrill({ game: 'Minecraft', topic: 'nope', seed: 1 }).topic).toBe('homophones')
  })
})

describe('practice front door', () => {
  it('routes topics to the right engine', () => {
    expect(makePractice({ topic: 'percent', level: 2, game: 'Fortnite', seed: 1 }).kind).toBe('number')
    expect(makePractice({ topic: 'commas', game: 'Fortnite', seed: 1 }).kind).toBe('choice')
    expect(topicInfo('thesis').subject).toBe('english')
    expect(topicInfo('nope')).toBeNull()
  })

  it('describes exercises in plain text', () => {
    const quest = makePractice({ topic: 'linear', game: 'Rocket League', seed: 1 })
    expect(describePractice(quest)).toMatch(/33 boost/)
    expect(describePractice(quest)).not.toMatch(/\*\*/)
    const drill = makePractice({ topic: 'agreement', game: 'Pokémon', seed: 1 })
    expect(describePractice(drill)).toMatch(/Options: A\) /)
    expect(practiceToPrompt(drill)).toMatch(/^I'm stuck on this Pokémon question:/)
  })
})

describe('chat markers', () => {
  const message = { id: 'm1', role: 'assistant', game: 'Minecraft', content: 'Try this:\n\n[[quest:percent:2]]\n\nThen this:\n[[quest:commas]]\n[[quest:bogus:1]]' }

  it('splits text and exercises, dropping unknown topics', () => {
    const parts = splitContent(message.content)
    expect(parts.map((p) => p.type)).toEqual(['text', 'quest', 'text', 'quest'])
    expect(parts[1]).toMatchObject({ topic: 'percent', level: 2, index: 0 })
    expect(parts[3]).toMatchObject({ topic: 'commas', level: 1, index: 1 })
    expect(splitContent('plain reply')).toEqual([{ type: 'text', text: 'plain reply' }])
  })

  it('hides a half-written marker while streaming', () => {
    for (const partial of ['Go!\n\n[', 'Go!\n\n[[', 'Go!\n\n[[quest', 'Go!\n\n[[quest:perc', 'Go!\n\n[[quest:percent:2']) {
      expect(splitContent(partial, { streaming: true })).toEqual([{ type: 'text', text: 'Go!\n\n' }])
    }
    expect(splitContent('Go!\n\n[[quest:percent:2]]', { streaming: true })).toHaveLength(2)
  })

  it('generates the same exercise every time for a given message', () => {
    const part = splitContent(message.content)[1]
    const a = practiceForMarker(message, part)
    expect(practiceForMarker(message, part)).toEqual(a)
    expect(a.game.name).toBe('Minecraft')
    expect(practiceForMarker({ ...message, id: 'm2' }, part).id).not.toBe(a.id)
  })

  it('shows the AI the real exercise and the result', () => {
    const quest = practiceForMarker(message, splitContent(message.content)[1])
    const pending = contentForAi(message)
    expect(pending).not.toMatch(/\[\[quest/)
    expect(pending).toContain(describePractice(quest))
    expect(pending).toMatch(/Student result: not answered yet/)

    const done = contentForAi({ ...message, questResults: { 0: { outcome: 'solved', attempts: 2, hints: 1 }, 1: { outcome: 'revealed', attempts: 2, hints: 0 } } })
    expect(done).toMatch(/Student result: solved \(2 attempts, 1 hint\)/)
    expect(done).toMatch(/Student result: gave up and viewed the solution \(2 attempts\)/)
    expect(contentForAi({ role: 'user', content: '[[quest:percent]]' })).toBe('[[quest:percent]]')
  })
})
