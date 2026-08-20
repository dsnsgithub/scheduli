// useMMKVState.ts
import { useState, useEffect, useRef } from "react";

import storage from "@/src/utils/storage";

export function useMMKVState<T>(key: string, parser: (value: string) => T) {
  const [state, setState] = useState<T | null>(() => {
    const initialVal = storage.getString(key);
    return initialVal ? parser(initialVal) : null;
  });

  const currentRawRef = useRef<string | null>(storage.getString(key));

  useEffect(() => {
    const listener = (changedKey: string) => {
      if (changedKey === key) {
        const newVal = storage.getString(key);
        if (newVal !== currentRawRef.current) {
          // Defer the state update to avoid updating during render
          setTimeout(() => {
            currentRawRef.current = newVal;
            setState(newVal ? parser(newVal) : null);
          }, 0);
        }
      }
    };

    const unsubscribe = storage.addOnValueChangedListener(listener);

    // Sync to current value in case it changed since the initial read
    const currentVal = storage.getString(key);
    if (currentVal !== currentRawRef.current) {
      currentRawRef.current = currentVal;
      setState(currentVal ? parser(currentVal) : null);
    }

    return () => unsubscribe.remove();
  }, [key, parser]);

  const setMMKVState = (value: T | null) => {
    const newRaw = value ? JSON.stringify(value) : null;
    storage.set(key, newRaw ?? "");
    setState(value);
    currentRawRef.current = newRaw;
  };

  return [state, setMMKVState] as const;
}
