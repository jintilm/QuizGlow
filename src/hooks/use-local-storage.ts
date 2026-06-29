import { useState, useCallback, useEffect } from 'react';
import { getAppId, logger } from '@lark-apaas/client-toolkit-lite';

function getStorageKey(key: string): string {
  const appId = getAppId() ?? 'qbank-app';
  return `${appId}:${key}`;
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const fullKey = getStorageKey(key);
      const item = window.localStorage.getItem(fullKey);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      logger.error('useLocalStorage read error:', String(error));
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const fullKey = getStorageKey(key);
        setStoredValue((prev) => {
          const valueToStore = value instanceof Function ? value(prev) : value;
          window.localStorage.setItem(fullKey, JSON.stringify(valueToStore));
          return valueToStore;
        });
      } catch (error) {
        logger.error('useLocalStorage write error:', String(error));
      }
    },
    [key]
  );

  const removeValue = useCallback(() => {
    try {
      const fullKey = getStorageKey(key);
      window.localStorage.removeItem(fullKey);
      setStoredValue(initialValue);
    } catch (error) {
      logger.error('useLocalStorage remove error:', String(error));
    }
  }, [key, initialValue]);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      const fullKey = getStorageKey(key);
      if (e.key === fullKey && e.newValue) {
        try {
          setStoredValue(JSON.parse(e.newValue) as T);
        } catch {
          setStoredValue(initialValue);
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

export function readLocalStorage<T>(key: string, fallback: T): T {
  try {
    const fullKey = getStorageKey(key);
    const item = window.localStorage.getItem(fullKey);
    return item ? (JSON.parse(item) as T) : fallback;
  } catch (error) {
    logger.error('readLocalStorage error:', String(error));
    return fallback;
  }
}

export function writeLocalStorage<T>(key: string, value: T): void {
  try {
    const fullKey = getStorageKey(key);
    window.localStorage.setItem(fullKey, JSON.stringify(value));
  } catch (error) {
    logger.error('writeLocalStorage error:', String(error));
  }
}
