// "Who am I" — honor-system identity stored in localStorage, no login (DECISIONS.md D2).
import { useCallback, useState } from 'react';

const KEY = 'worldcup:playerId';

function read(): number | null {
  const raw = localStorage.getItem(KEY);
  if (raw === null) return null;
  const id = Number(raw);
  return Number.isInteger(id) ? id : null;
}

export function useIdentity(): {
  playerId: number | null;
  setPlayerId: (id: number) => void;
  clear: () => void;
} {
  const [playerId, setState] = useState<number | null>(read);

  const setPlayerId = useCallback((id: number) => {
    localStorage.setItem(KEY, String(id));
    setState(id);
  }, []);

  const clear = useCallback(() => {
    localStorage.removeItem(KEY);
    setState(null);
  }, []);

  return { playerId, setPlayerId, clear };
}
