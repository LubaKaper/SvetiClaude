// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PracticeCard from '../../src/components/PracticeCard.jsx'
import { makePractice } from '../../src/lib/practice.js'

const quest = makePractice({ topic: 'linear', level: 2, game: 'Rocket League', seed: 4 })
const drill = makePractice({ topic: 'homophones', game: 'Minecraft', seed: 3 })

describe('PracticeCard — typed answer', () => {
  it('walks through unreadable, wrong, hint and correct', async () => {
    const user = userEvent.setup()
    const onFinish = vi.fn()
    render(<PracticeCard item={quest} onFinish={onFinish} />)

    expect(screen.getByText(/Rocket League · Linear equations/)).toBeInTheDocument()
    const input = screen.getByLabelText('Your answer')
    expect(screen.getByRole('button', { name: 'Check' })).toBeDisabled()

    await user.type(input, 'no idea{Enter}')
    expect(screen.getByText(/couldn't read a number/)).toBeInTheDocument()
    // focus stays in the box so the student can retype straight away
    expect(input).toHaveFocus()

    await user.clear(input)
    await user.type(input, `${quest.answer + 1}{Enter}`)
    expect(screen.getByText(/Not quite/)).toBeInTheDocument()
    expect(onFinish).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: /Hint 1 of 3/ }))
    expect(screen.getByRole('button', { name: /Hint 2 of 3/ })).toBeInTheDocument()

    await user.clear(input)
    await user.type(input, `x = ${quest.answer}{Enter}`)
    // medium quest (20 XP), one hint (-25%), not first try (no bonus)
    expect(onFinish).toHaveBeenCalledExactlyOnceWith({ outcome: 'solved', xp: 15, hints: 1, attempts: 2 })
    expect(screen.getByText('+15 XP')).toBeInTheDocument()
    expect(screen.getByText('How it works')).toBeInTheDocument()
    expect(input).toBeDisabled()
    expect(screen.queryByRole('button', { name: /Hint/ })).not.toBeInTheDocument()
  })

  it('gives the first-try bonus and offers Next when asked to', async () => {
    const user = userEvent.setup()
    const onFinish = vi.fn()
    const onNext = vi.fn()
    render(<PracticeCard item={quest} onFinish={onFinish} onNext={onNext} />)

    await user.type(screen.getByLabelText('Your answer'), `${quest.answer}{Enter}`)
    expect(onFinish).toHaveBeenCalledWith({ outcome: 'solved', xp: 25, hints: 0, attempts: 1 })
    await user.click(screen.getByRole('button', { name: /Next quest/ }))
    expect(onNext).toHaveBeenCalledOnce()
  })

  it('only offers the solution after two tries, and awards nothing for it', async () => {
    const user = userEvent.setup()
    const onFinish = vi.fn()
    render(<PracticeCard item={quest} onFinish={onFinish} />)
    const input = screen.getByLabelText('Your answer')

    expect(screen.queryByRole('button', { name: /Show solution/ })).not.toBeInTheDocument()
    await user.type(input, '100000{Enter}')
    await user.clear(input)
    await user.type(input, '200000{Enter}')
    await user.click(screen.getByRole('button', { name: /Show solution/ }))

    expect(onFinish).toHaveBeenCalledWith({ outcome: 'revealed', xp: 0, hints: 0, attempts: 2 })
    expect(screen.getByText(/The answer is/)).toBeInTheDocument()
    expect(screen.queryByText(/\+\d+ XP/)).not.toBeInTheDocument()
  })

  it('renders an already-finished exercise as finished', () => {
    render(<PracticeCard item={quest} initial={{ outcome: 'solved', xp: 15, hints: 1, attempts: 2 }} onFinish={vi.fn()} />)
    expect(screen.getByText('+15 XP')).toBeInTheDocument()
    expect(screen.getByLabelText('Your answer')).toBeDisabled()
    expect(screen.getByLabelText('Your answer')).toHaveValue(String(quest.answer))
  })
})

describe('PracticeCard — multiple choice', () => {
  const choices = () => within(screen.getByRole('group', { name: 'Answer choices' })).getAllByRole('button')

  it('strikes out a wrong pick and accepts the right one', async () => {
    const user = userEvent.setup()
    const onFinish = vi.fn()
    render(<PracticeCard item={drill} onFinish={onFinish} />)

    expect(screen.getByText(drill.sentence)).toBeInTheDocument()
    const wrongIndex = drill.answerIndex === 0 ? 1 : 0
    await user.click(choices()[wrongIndex])
    expect(choices()[wrongIndex]).toBeDisabled()
    expect(screen.getByText(/Not quite/)).toBeInTheDocument()

    await user.click(choices()[drill.answerIndex])
    expect(onFinish).toHaveBeenCalledExactlyOnceWith({ outcome: 'solved', xp: 10, hints: 0, attempts: 2 })
    expect(screen.getByText('The rule')).toBeInTheDocument()
    // the blank is filled in once solved
    expect(screen.getByText(drill.sentence.replace('___', drill.answer))).toBeInTheDocument()
    for (const button of choices()) expect(button).toBeDisabled()
  })

  it('has a single hint', async () => {
    const user = userEvent.setup()
    render(<PracticeCard item={drill} onFinish={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: 'Hint' }))
    expect(screen.getByRole('button', { name: /No more hints/ })).toBeDisabled()
    expect(screen.getByRole('button', { name: /Show solution/ })).toBeInTheDocument()
  })
})
