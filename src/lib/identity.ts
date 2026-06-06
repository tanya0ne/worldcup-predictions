// "Who am I" + PIN, stored in localStorage. The PIN gates writes server-side
// (Supabase RPC) so a player can't edit the other's bets.
import { useCallback, useState } from 'react';

const KEY = 'worldcup:identity';

export interface Identity {
  playerId: number;
  pin: string;
}

function read(): Identity | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as Partial<Identity>;
    if (typeof o.playerId === 'number' && typeof o.pin === 'string') {
      return { playerId: o.playerId, pin: o.pin };
    }
    return null;
  } catch {
    return null;
  }
}

export function useIdentity(): {
  identity: Identity | null;
  signIn: (playerId: number, pin: string) => void;
  clear: () => void;
} {
  const [identity, setState] = useState<Identity | null>(read);

  const signIn = useCallback((playerId: number, pin: string) => {
    const id = { playerId, pin };
    localStorage.setItem(KEY, JSON.stringify(id));
    setState(id);
  }, []);

  const clear = useCallback(() => {
    localStorage.removeItem(KEY);
    setState(null);
  }, []);

  return { identity, signIn, clear };
}
