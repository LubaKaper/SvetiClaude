import { describe, it, expect } from 'vitest'
import { GAMES, genericPack, findGame, resolveGame, normalizeGamePrefs, cleanGameName } from '../src/config/games.js'
import { TOPICS, LEVELS, generateQuest, parseAnswer, checkAnswer, questXp } from '../src/lib/quests.js'

const packs = [...GAMES.map((g) => g.name), 'Hollow Knight', '']

describe('quest generation', () => {
  it('every game has a scenario, facts and starters for every topic', () => {
    for (const game of GAMES) {
      for (const topic of TOPICS) expect(typeof game.scenarios[topic.id], `${game.id}/${topic.id}`).toBe('function')
      expect(game.facts.length).toBeGreaterThanOrEqual(5)
      expect(game.starters.length).toBeGreaterThanOrEqual(3)
      expect(game.writing.length).toBeGreaterThanOrEqual(2)
    }
  })

  it('produces well-formed, sensible quests for every game, topic and level', () => {
    for (const game of packs) {
      for (const topic of TOPICS) {
        for (const level of LEVELS) {
          for (let seed = 1; seed <= 60; seed++) {
            const q = generateQuest({ game, topic: topic.id, level: level.id, seed })
            const where = `${game || 'generic'}/${topic.id}/L${level.id}/seed${seed}: ${q.story}`
            expect(Number.isFinite(q.answer), where).toBe(true)
            expect(q.answer, where).toBeGreaterThan(0)
            // answers never need more than two decimals
            expect(Math.abs(q.answer * 100 - Math.round(q.answer * 100)), where).toBeLessThan(1e-6)
            expect(q.hints, where).toHaveLength(3)
            expect(q.steps.length, where).toBeGreaterThanOrEqual(2)
            expect(q.story.length, where).toBeGreaterThan(40)
            expect(q.ask.endsWith('?'), where).toBe(true)
            // no broken interpolation or float noise leaking into the text
            const text = [q.story, q.ask, ...q.hints, ...q.steps].join(' ')
            expect(text, where).not.toMatch(/undefined|NaN|\d\.\d{4,}/)
            // story numbers should be whole things (no "7.5 goals")
            expect(q.story, where).not.toMatch(/\*\*[^*]*\d\.\d+ (goals|kills|stages|trees|walls|shots|races|matches)/)
            // the second unknown of a system is always plural ("and 3 swords")
            if (q.also) expect(q.also, where).not.toMatch(/^and 1 /)
            expect(checkAnswer(q, String(q.answer)).ok, where).toBe(true)
            expect(checkAnswer(q, String(q.answer + 1)).ok, where).toBe(false)
          }
        }
      }
    }
  })

  it('is reproducible from a seed and varies between seeds', () => {
    const a = generateQuest({ game: 'Minecraft', topic: 'linear', level: 2, seed: 7 })
    const b = generateQuest({ game: 'Minecraft', topic: 'linear', level: 2, seed: 7 })
    expect(a).toEqual(b)
    const stories = new Set(Array.from({ length: 20 }, (_, i) => generateQuest({ game: 'Minecraft', topic: 'linear', level: 2, seed: i }).story))
    expect(stories.size).toBeGreaterThan(10)
  })

  it('gets the math right on hand-checked cases', () => {
    // Rocket League: spawn with 33 boost, 12 per small pad
    const rl = generateQuest({ game: 'Rocket League', topic: 'linear', level: 1, seed: 3 })
    const total = Number(rl.story.match(/arrive with \*\*(\d+) boost/)[1])
    expect(33 + 12 * rl.answer).toBe(total)

    // Roblox: creators keep 70%
    const rb = generateQuest({ game: 'Roblox', topic: 'percent', level: 1, seed: 3 })
    const price = Number(rb.story.match(/for \*\*([\d,]+) Robux/)[1].replace(/,/g, ''))
    expect(rb.answer).toBe(price * 0.7)

    // Pokémon system: Great Balls 600, Poké Balls 200
    const pk = generateQuest({ game: 'Pokémon', topic: 'system', level: 3, seed: 9 })
    const [, count] = pk.story.match(/with \*\*(\d+) balls/)
    const cost = Number(pk.story.match(/₽([\d,]+)\*\*\.$/)[1].replace(/,/g, ''))
    const y = Number(count) - pk.answer
    expect(600 * pk.answer + 200 * y).toBe(cost)
  })

  it('themes quests to the chosen game and falls back for unknown ones', () => {
    expect(generateQuest({ game: 'fortnite', topic: 'percent', seed: 1 }).story).toMatch(/V-Bucks/)
    const custom = generateQuest({ game: 'Hollow Knight', topic: 'linear', seed: 1 })
    expect(custom.story).toMatch(/Hollow Knight/)
    expect(custom.game.name).toBe('Hollow Knight')
    expect(generateQuest({ game: '', topic: 'nope', seed: 1 }).topic).toBe('linear')
  })
})

describe('answers', () => {
  it('reads numbers the way students type them', () => {
    expect(parseAnswer('12')).toBe(12)
    expect(parseAnswer('x = 12')).toBe(12)
    expect(parseAnswer('12 trades')).toBe(12)
    expect(parseAnswer('1,200 V-Bucks')).toBe(1200)
    expect(parseAnswer('25%')).toBe(25)
    expect(parseAnswer('3/4')).toBe(0.75)
    expect(parseAnswer('-2.5')).toBe(-2.5)
    expect(parseAnswer('₽600')).toBe(600)
    expect(parseAnswer('.5')).toBe(0.5)
    expect(parseAnswer('idk')).toBeNull()
    expect(parseAnswer('')).toBeNull()
    expect(parseAnswer('1/0')).toBeNull()
  })

  it('accepts rounding but not wrong answers', () => {
    const quest = { answer: 12.5 }
    expect(checkAnswer(quest, '12.5').ok).toBe(true)
    expect(checkAnswer(quest, '12.50').ok).toBe(true)
    expect(checkAnswer(quest, '25/2').ok).toBe(true)
    expect(checkAnswer(quest, '12').ok).toBe(false)
    expect(checkAnswer(quest, 'twelve').parsed).toBeNull()
  })

  it('awards XP fairly', () => {
    expect(questXp({ level: 1 })).toBe(15)
    expect(questXp({ level: 3 })).toBe(35)
    expect(questXp({ level: 2, hintsUsed: 1 })).toBe(15)
    expect(questXp({ level: 2, attempts: 3 })).toBe(20)
    expect(questXp({ level: 1, hintsUsed: 3 })).toBe(3)
    expect(questXp({ level: 3, revealed: true })).toBe(0)
  })
})

describe('game preferences', () => {
  it('finds games by name, id and alias', () => {
    expect(findGame('minecraft').id).toBe('minecraft')
    expect(findGame('  BOTW ').id).toBe('zelda')
    expect(findGame('Tears of the Kingdom').id).toBe('zelda')
    expect(findGame('Tetris')).toBeNull()
    expect(resolveGame('Tetris').custom).toBe(true)
    expect(genericPack().name).toBe('Any game')
  })

  it('normalises stored preferences', () => {
    expect(normalizeGamePrefs(['mc', 'Minecraft', ' celeste ', '', 'Valorant', 'Roblox'])).toEqual(['Minecraft', 'celeste', 'Valorant'])
    expect(normalizeGamePrefs(null)).toEqual([])
    expect(cleanGameName('Elden\nRing **<script>**')).toBe('Elden Ring script')
    expect(cleanGameName('x'.repeat(100))).toHaveLength(40)
  })
})
