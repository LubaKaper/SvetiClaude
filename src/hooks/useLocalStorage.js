import { useCallback, useState } from 'react'

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // storage full or blocked: keep working in memory
  }
}

/**
 * useState that persists to localStorage as JSON.
 *
 * The key may change between renders (e.g. one chat history per subject): the
 * value is re-read for the new key, and a setter created for an older key
 * keeps writing to that older key instead of leaking into the current one.
 */
export function useLocalStorage(key, fallback) {
  const [state, setState] = useState(() => ({ key, value: read(key, fallback) }))

  let current = state
  if (state.key !== key) {
    current = { key, value: read(key, fallback) }
    setState(current)
  }

  const set = useCallback(
    (next) => {
      const resolve = (prev) => (typeof next === 'function' ? next(prev) : next)
      setState((prev) => {
        if (prev.key !== key) {
          write(key, resolve(read(key, fallback)))
          return prev
        }
        const value = resolve(prev.value)
        write(key, value)
        return { key, value }
      })
    },
    // `fallback` is only a default for missing data; callers pass a constant.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  )

  return [current.value, set]
}
