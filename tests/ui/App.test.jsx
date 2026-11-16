// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../src/App.jsx'
import { makePractice } from '../../src/lib/practice.js'

/**
 * Whole-app tests in a simulated browser. `fetch` is replaced, so these cover
 * both demo mode (no AI key) and live mode (a streamed reply).
 */

let posts = []

function mockBackend({ live, reply = '' }) {
  posts = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (_url, init) => {
      if (!init?.method || init.method === 'GET') {
        return new Response(JSON.stringify({ live, model: 'test-model' }), { headers: { 'content-type': 'application/json' } })
      }
      posts.push(JSON.parse(init.body))
      if (!live) return new Response(JSON.stringify({ error: 'No AI key configured.' }), { status: 503 })
      const stream = new ReadableStream({
        start(controller) {
          const half = Math.ceil(reply.length / 2)
          controller.enqueue(new TextEncoder().encode(reply.slice(0, half)))
          controller.enqueue(new TextEncoder().encode(reply.slice(half)))
          controller.close()
        },
      })
      return new Response(stream, { headers: { 'content-type': 'text/plain' } })
    }),
  )
}

/** Look up the right answer for an exercise on screen from its id. */
function answerFor(card) {
  const [, game, topic, level, seed] = card.dataset.quest.match(/^(.*)-(\w+)-(\d)-(\d+)$/)
  return makePractice({ game: game === 'generic' ? '' : game, topic, level: Number(level), seed: Number(seed) }).answer
}

const returningPlayer = (games = ['Minecraft']) => {
  localStorage.setItem('sveti-game-prefs', JSON.stringify(games))
  localStorage.setItem('sveti-game-asked', 'true')
}

const send = async (user, text) => {
  await user.type(screen.getByLabelText('Message Sveti'), `${text}{Enter}`)
}

beforeEach(() => {
  Element.prototype.scrollTo = () => {}
  vi.spyOn(window, 'confirm').mockReturnValue(true)
})
afterEach(() => vi.unstubAllGlobals())

describe('first visit', () => {
  it('asks what you play, then personalises the app', async () => {
    mockBackend({ live: false })
    const user = userEvent.setup()
    render(<App />)

    const dialog = screen.getByRole('dialog', { name: 'What do you play?' })
    await user.click(within(dialog).getByRole('button', { name: /Minecraft/ }))
    await user.click(within(dialog).getByRole('button', { name: /Valorant/ }))
    await user.type(within(dialog).getByLabelText('Play something else?'), 'Hollow Knight{Enter}')
    expect(within(dialog).getByText('3 of 3 selected')).toBeInTheDocument()
    // a fourth game can't be added
    expect(within(dialog).getByRole('button', { name: /Fortnite/ })).toBeDisabled()
    await user.click(within(dialog).getByRole('button', { name: "Let's go" }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem('sveti-game-prefs'))).toEqual(['Minecraft', 'Valorant', 'Hollow Knight'])
    expect(screen.getByText('Explain ratios using crafting recipes')).toBeInTheDocument()
    expect(await screen.findByText('Demo mode')).toBeInTheDocument()
  })

  it('can be skipped and does not nag again', async () => {
    mockBackend({ live: false })
    const user = userEvent.setup()
    const { unmount } = render(<App />)
    await user.click(screen.getByRole('button', { name: 'Skip for now' }))
    expect(screen.getByRole('button', { name: /Choose your games/ })).toBeInTheDocument()
    unmount()
    render(<App />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

describe('demo mode', () => {
  it('answers a practice request with a live quest, and solving it earns XP once', async () => {
    mockBackend({ live: false })
    returningPlayer(['Fortnite'])
    const user = userEvent.setup()
    const { unmount } = render(<App />)
    await screen.findByText('Demo mode')

    await send(user, 'give me a practice problem on percentages')
    const log = await screen.findByRole('log')
    const card = await within(log).findByRole('region', { name: 'Percentages exercise' }, { timeout: 3000 })
    expect(within(card).getAllByText(/V-Bucks/).length).toBeGreaterThan(0)
    expect(posts).toHaveLength(0) // no AI call in demo mode

    await user.type(within(card).getByLabelText('Your answer'), `${answerFor(card)}{Enter}`)
    expect(within(card).getByText('+25 XP')).toBeInTheDocument()
    expect(within(screen.getByRole('region', { name: 'Your progress' })).getByText('25 XP')).toBeInTheDocument()

    const saved = JSON.parse(localStorage.getItem('sveti-progress'))
    expect(saved).toMatchObject({ xp: 25, streak: 1, solved: 1, topics: { percent: { solved: 1, missed: 0 } } })

    // After a reload the quest is still solved and can't be answered again.
    unmount()
    render(<App />)
    const again = await screen.findByRole('region', { name: 'Percentages exercise' })
    expect(within(again).getByText('+25 XP')).toBeInTheDocument()
    expect(within(again).getByLabelText('Your answer')).toBeDisabled()
    expect(JSON.parse(localStorage.getItem('sveti-progress')).xp).toBe(25)
  })

  it('keeps a separate conversation per subject', async () => {
    mockBackend({ live: false })
    returningPlayer()
    const user = userEvent.setup()
    render(<App />)
    await screen.findByText('Demo mode')

    await send(user, 'explain percentages')
    await screen.findByText(/Answer: /, {}, { timeout: 3000 })

    await user.click(screen.getByRole('button', { name: 'English' }))
    expect(screen.queryByRole('log')).not.toBeInTheDocument()
    expect(screen.getByText(/Survival or Creative/)).toBeInTheDocument()
    expect(localStorage.getItem('sveti-messages-english')).toBeNull()

    await user.click(screen.getByRole('button', { name: 'Algebra' }))
    expect(within(screen.getByRole('log')).getByText('explain percentages')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Clear conversation' }))
    expect(screen.queryByRole('log')).not.toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem('sveti-messages-algebra'))).toEqual([])
  })
})

describe('Quests page', () => {
  it('serves algebra quests and English drills, and tracks each topic', async () => {
    mockBackend({ live: false })
    returningPlayer(['Stardew Valley'])
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Quests' }))
    await user.click(screen.getByRole('button', { name: /Ratios & proportions/ }))
    await user.click(screen.getByRole('button', { name: 'Hard' }))
    let card = screen.getByRole('region', { name: 'Ratios & proportions exercise' })
    expect(within(card).getByText(/Sprinkler/)).toBeInTheDocument()
    await user.type(within(card).getByLabelText('Your answer'), `${answerFor(card)}{Enter}`)
    expect(within(card).getByText('+35 XP')).toBeInTheDocument()
    expect(within(screen.getByRole('button', { name: /Ratios & proportions/ })).getByText('1 solved')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'English' }))
    expect(screen.queryByRole('group', { name: 'Difficulty' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Strong thesis/ }))
    card = screen.getByRole('region', { name: 'Strong thesis exercise' })
    await user.click(within(card).getByRole('button', { name: answerFor(card) }))
    expect(within(card).getByText('The rule')).toBeInTheDocument()

    expect(JSON.parse(localStorage.getItem('sveti-progress'))).toMatchObject({
      xp: 50,
      streak: 2,
      topics: { ratio: { solved: 1 }, thesis: { solved: 1 } },
    })
  })

  it('hands a quest over to the chat', async () => {
    mockBackend({ live: false })
    returningPlayer()
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Quests' }))
    await user.click(screen.getByRole('button', { name: /Ask Sveti/ }))
    expect(screen.getByLabelText('Message Sveti').value).toMatch(/^I'm stuck on this Minecraft quest:/)
  })
})

describe('live mode', () => {
  it('streams the reply, renders the quest it contains, and reports the result back', async () => {
    mockBackend({ live: true, reply: 'Let\'s check that.\n\n[[quest:system:1]]\n\nTake your time.' })
    returningPlayer(['Pokémon'])
    const user = userEvent.setup()
    render(<App />)
    await screen.findByText('AI live')

    await user.click(screen.getByRole('button', { name: 'Practice' }))
    await user.type(screen.getByLabelText('Message Sveti'), 'systems{Enter}')

    const card = await screen.findByRole('region', { name: 'Systems of equations exercise' })
    expect(screen.getByText("Let's check that.")).toBeInTheDocument()
    expect(screen.getByText('Take your time.')).toBeInTheDocument()
    expect(screen.queryByText(/\[\[quest/)).not.toBeInTheDocument()

    expect(posts[0]).toMatchObject({
      subject: 'algebra',
      learningStyle: 'visual',
      action: 'practice',
      intent: 'practice',
      games: ['Pokémon'],
      messages: [{ role: 'user', content: 'Give me practice problems on: systems' }],
    })

    const answer = answerFor(card)
    await user.type(within(card).getByLabelText('Your answer'), `${answer}{Enter}`)
    await waitFor(() => expect(JSON.parse(localStorage.getItem('sveti-progress')).solved).toBe(1))

    // The next request shows the AI the real exercise, its answer and the result.
    await send(user, 'how did I do?')
    await waitFor(() => expect(posts).toHaveLength(2))
    const tutorTurn = posts[1].messages.find((m) => m.role === 'assistant').content
    expect(tutorTurn).toMatch(/Great Balls/)
    expect(tutorTurn).toContain(`Correct answer: ${answer}.`)
    expect(tutorTurn).toMatch(/Student result: solved \(1 attempt\)/)
    expect(tutorTurn).not.toMatch(/\[\[quest/)
    expect(posts[1].practice.topics).toEqual({ system: { solved: 1, missed: 0 } })
    expect(posts[1].practice.recent).toHaveLength(1)
  })

  it('shows a readable error when the server fails', async () => {
    mockBackend({ live: true })
    fetch.mockImplementation(async (_url, init) =>
      init?.method === 'POST'
        ? new Response(JSON.stringify({ error: 'Sveti is getting a lot of questions right now.' }), { status: 429 })
        : new Response(JSON.stringify({ live: true, model: 'm' })),
    )
    returningPlayer()
    const user = userEvent.setup()
    render(<App />)
    await screen.findByText('AI live')

    await send(user, 'explain slope')
    expect(await screen.findByText("Couldn't get a reply")).toBeInTheDocument()
    expect(screen.getByText(/getting a lot of questions/)).toBeInTheDocument()
    // the composer is usable again
    await user.type(screen.getByLabelText('Message Sveti'), 'x')
    expect(screen.getByRole('button', { name: 'Send message' })).toBeEnabled()
  })
})

describe('preferences', () => {
  it('remembers theme, subject and learning style', async () => {
    mockBackend({ live: false })
    returningPlayer()
    const user = userEvent.setup()
    const { unmount } = render(<App />)

    await user.click(screen.getByRole('button', { name: 'Light mode' }))
    expect(document.documentElement).not.toHaveClass('dark')
    await user.click(screen.getByRole('radio', { name: /Socratic/ }))
    await user.click(screen.getByRole('button', { name: 'English' }))
    unmount()

    render(<App />)
    expect(document.documentElement).not.toHaveClass('dark')
    expect(screen.getByRole('radio', { name: /Socratic/ })).toBeChecked()
    expect(screen.getByRole('button', { name: 'English' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Dark mode' })).toBeInTheDocument()
  })
})
