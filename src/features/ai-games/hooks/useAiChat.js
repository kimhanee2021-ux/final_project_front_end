import { useState, useEffect, useRef } from 'react';
import { api } from '../api';
import { useAuth } from '@/features/auth';
export function useAiChat({
  token
}) {
  const {
    signOut
  } = useAuth();
  const [mode, setMode] = useState('recommend');
  const [genre, setGenre] = useState('');
  const [game, setGame] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [found, setFound] = useState([]);
  const [searching, setSearching] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const pending = useRef(false);
  const end = useRef(null);
  const abort = useRef(null);
  const searchId = useRef(0);
  useEffect(() => {
    document.title = 'AI 게임 추천';
    return () => {
      searchId.current += 1;
      abort.current?.abort();
      abort.current = null;
    };
  }, []);
  useEffect(() => {
    end.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest'
    });
  }, [messages, busy]);
  function fail(err) {
    if (err.name === 'AbortError') return;
    if (err.status === 401) {
      signOut();
      setMessages([]);
    }
    setError(err.message);
  }
  function newChat(nextMode = mode, nextGame = null) {
    if (pending.current) return;
    searchId.current += 1;
    setSearching(false);
    setMode(nextMode);
    setGame(nextGame);
    setMessages([]);
    setFound([]);
    setError('');
    setText('');
  }
  async function search(event) {
    event.preventDefault();
    if (!keyword.trim()) return;
    const id = ++searchId.current;
    setSearching(true);
    setError('');
    setFound([]);
    try {
      const results = await api(`/games?keyword=${encodeURIComponent(keyword.trim())}`, {
        token
      });
      if (id === searchId.current) setFound(results);
    } catch (err) {
      if (id === searchId.current) fail(err);
    } finally {
      if (id === searchId.current) setSearching(false);
    }
  }
  async function send(event) {
    event.preventDefault();
    const question = text.trim();
    if (!question || pending.current || mode === 'purchase' && !game) return;
    pending.current = true;
    setBusy(true);
    setError('');
    const controller = new AbortController();
    abort.current = controller;
    try {
      const history = messages.slice(-6).map(m => ({
        role: m.role,
        text: m.text.slice(0, 2000)
      }));
      const result = await api('/chat', {
        token,
        method: 'POST',
        signal: controller.signal,
        body: {
          mode,
          message: question,
          genre,
          gameId: game?.appId,
          history
        }
      });
      if (abort.current !== controller) return;
      setMessages(list => [...list, {
        role: 'user',
        text: question
      }, {
        role: 'model',
        text: result.answer,
        games: result.games
      }]);
      setText('');
    } catch (err) {
      if (abort.current === controller) fail(err);
    } finally {
      if (abort.current === controller) {
        abort.current = null;
        pending.current = false;
        setBusy(false);
      }
    }
  }
  function cancel() {
    abort.current?.abort();
    abort.current = null;
    pending.current = false;
    setBusy(false);
  }
  return {
    mode,
    genre,
    setGenre,
    game,
    keyword,
    setKeyword,
    found,
    searching,
    messages,
    text,
    setText,
    busy,
    error,
    end,
    newChat,
    search,
    send,
    cancel
  };
}
