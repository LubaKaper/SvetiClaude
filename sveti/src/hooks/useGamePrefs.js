import { useCallback, useMemo, useState } from "react";

const LS_KEYS = {
  prefs: "sveti-game-prefs",      // JSON array of strings (max 2)
  asked: "sveti-game-asked",      // "true" once we've asked
  prefers: "sveti-prefers-games", // "true" | "false" | ""
};

function readJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}

export function useGamePrefs() {
  const [gamePrefs, setGamePrefsState] = useState(() => readJSON(LS_KEYS.prefs, []));
  const [asked, setAskedState] = useState(() => localStorage.getItem(LS_KEYS.asked) === "true");
  const [prefersGames, setPrefersState] = useState(() => {
    const v = localStorage.getItem(LS_KEYS.prefers);
    return v === "true" ? true : v === "false" ? false : null;
  });

  const save = useCallback((key, value) => {
    if (value === undefined) return;
    localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
  }, []);

  const setGamePrefs = useCallback((arr) => {
    const deduped = Array.from(new Set((arr || []).map(s => s.trim()))).filter(Boolean).slice(0, 2);
    setGamePrefsState(deduped);
    save(LS_KEYS.prefs, deduped);
  }, [save]);

  const setAsked = useCallback((v) => { setAskedState(!!v); save(LS_KEYS.asked, !!v ? "true" : "false"); }, [save]);
  const setPrefers = useCallback((v) => { setPrefersState(v); save(LS_KEYS.prefers, v === null ? "" : v ? "true" : "false"); }, [save]);

  // split by commas or the word "and"
  const parseGamesFromText = useCallback((text) => {
    if (!text) return [];
    const lowered = text.toLowerCase();
    if (/\b(no|none|not|nah|nope)\b/.test(lowered)) return [];
    return text.split(/,| and /i).map(s => s.trim()).filter(Boolean).slice(0, 2);
  }, []);

  const hasPrefs = useMemo(() => (gamePrefs && gamePrefs.length > 0), [gamePrefs]);

  // Reset function that clears both localStorage and React state
  const resetGamePrefs = useCallback(() => {
    // Clear localStorage
    localStorage.removeItem(LS_KEYS.prefs);
    localStorage.removeItem(LS_KEYS.asked);
    localStorage.removeItem(LS_KEYS.prefers);
    
    // Reset React state to initial values
    setGamePrefsState([]);
    setAskedState(false);
    setPrefersState(null);
    
    console.log("🧼 Cleared all sveti- game preference keys and reset state.");
  }, []);

  return { gamePrefs, setGamePrefs, asked, setAsked, prefersGames, setPrefers, parseGamesFromText, hasPrefs, resetGamePrefs, LS_KEYS };
}

