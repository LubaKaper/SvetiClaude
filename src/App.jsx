import { useCallback, useEffect, useState } from 'react'
import { Menu, MessageCircle, Swords, Trash2 } from 'lucide-react'
import Sidebar from './components/Sidebar'
import ChatView from './components/ChatView'
import QuestView from './components/QuestView'
import GamePicker from './components/GamePicker'
import { useChat } from './hooks/useChat'
import { useGamePrefs } from './hooks/useGamePrefs'
import { useProgress } from './hooks/useProgress'
import { useLocalStorage } from './hooks/useLocalStorage'
import { learningStyles, DEFAULT_STYLE } from './config/learningStyles'
import { SUBJECTS, DEFAULT_SUBJECT } from './config/prompts'

function StatusPill({ status }) {
  if (status.live === null) return null
  return status.live ? (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-good/40 bg-good/10 px-2.5 py-1 text-xs font-semibold text-good" title={`Connected to ${status.model}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-good" /> AI live
    </span>
  ) : (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent-text"
      title="No AI key on the server. Quests work fully; chat replies are built-in worked examples."
    >
      <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Demo mode
    </span>
  )
}

export default function App() {
  const [theme, setTheme] = useLocalStorage('sveti-theme', 'dark')
  const [storedSubject, setSubject] = useLocalStorage('sveti-subject', DEFAULT_SUBJECT)
  const [storedStyle, setLearningStyle] = useLocalStorage('sveti-learning-style', DEFAULT_STYLE)
  const [view, setView] = useState('chat')
  const [menuOpen, setMenuOpen] = useState(false)
  const [draft, setDraft] = useState(null)

  const subject = SUBJECTS[storedSubject] ? storedSubject : DEFAULT_SUBJECT
  const learningStyle = learningStyles[storedStyle] ? storedStyle : DEFAULT_STYLE

  const { games, packs, setGames, asked, setAsked } = useGamePrefs()
  const [pickerOpen, setPickerOpen] = useState(() => !asked && games.length === 0)
  const firstRun = !asked && games.length === 0

  const progress = useProgress()
  const chat = useChat({ subject, learningStyle, games, progress })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme !== 'light')
  }, [theme])

  // An exercise the tutor placed in the chat was finished: save the result on
  // the message (so it stays finished after a reload) and count it as progress.
  const { setQuestResult } = chat
  const { record } = progress
  const onQuestFinish = useCallback(
    (message, part, result) => {
      setQuestResult(message.id, part.index, result)
      record({ topic: part.topic, level: part.level, game: message.game || '', ...result })
    },
    [setQuestResult, record],
  )

  const closePicker = useCallback(() => {
    setPickerOpen(false)
    setAsked(true)
  }, [setAsked])

  const askSveti = (text) => {
    setDraft({ text, at: Date.now() })
    setView('chat')
  }

  const clearChat = () => {
    if (window.confirm(`Clear your ${SUBJECTS[subject].name} conversation? Your games and XP are kept.`)) chat.clearMessages()
  }

  const tabs = [
    { id: 'chat', label: 'Chat', icon: MessageCircle },
    { id: 'quests', label: 'Quests', icon: Swords },
  ]

  return (
    <div className="flex h-dvh overflow-hidden">
      <Sidebar
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        progress={progress}
        packs={packs}
        onPickGames={() => {
          setMenuOpen(false)
          setPickerOpen(true)
        }}
        subject={subject}
        onSubject={(s) => {
          setSubject(s)
          setDraft(null)
        }}
        learningStyle={learningStyle}
        onLearningStyle={setLearningStyle}
        theme={theme === 'light' ? 'light' : 'dark'}
        onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      />

      <main className="backdrop flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-2 border-b border-line bg-bg/70 px-3 py-2.5 backdrop-blur sm:px-6">
          <button type="button" onClick={() => setMenuOpen(true)} className="icon-btn lg:hidden" aria-label="Open menu">
            <Menu size={20} />
          </button>

          <nav className="flex gap-1 rounded-xl border border-line bg-panel p-1" aria-label="Mode">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setView(id)}
                aria-current={view === id ? 'page' : undefined}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                  view === id ? 'bg-raised text-fg' : 'text-muted hover:text-fg'
                }`}
              >
                <Icon size={15} /> {label}
              </button>
            ))}
          </nav>

          <span className="ml-1 hidden text-sm text-muted sm:inline">
            {SUBJECTS[subject].name} · {learningStyles[learningStyle].name}
          </span>

          <div className="ml-auto flex items-center gap-1.5">
            <StatusPill status={chat.status} />
            {view === 'chat' && chat.messages.length > 0 && (
              <button type="button" onClick={clearChat} className="icon-btn" aria-label="Clear conversation" title="Clear conversation">
                <Trash2 size={17} />
              </button>
            )}
          </div>
        </header>

        {view === 'quests' ? (
          <QuestView subject={subject} packs={packs} progress={progress} onAskSveti={askSveti} onPickGames={() => setPickerOpen(true)} />
        ) : (
          <ChatView chat={chat} subject={subject} packs={packs} draft={draft} onPickGames={() => setPickerOpen(true)} onQuestFinish={onQuestFinish} />
        )}
      </main>

      {pickerOpen && (
        <GamePicker
          initial={games}
          firstRun={firstRun}
          onClose={closePicker}
          onSave={(list) => {
            setGames(list)
            setPickerOpen(false)
          }}
        />
      )}
    </div>
  )
}
