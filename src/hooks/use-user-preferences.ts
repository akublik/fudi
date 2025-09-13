
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { UserPreferences } from '@/lib/types';

const USER_PREFERENCES_KEY = 'daily-chef-user-preferences';

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>({ restrictions: [], cuisines: [] });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(USER_PREFERENCES_KEY);
      if (item) {
        const parsed = JSON.parse(item);
        if (parsed.restrictions && parsed.cuisines) {
            setPreferences(parsed);
        }
      }
    } catch (error) {
      console.error("Failed to load user preferences from localStorage", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const savePreferences = useCallback((newPreferences: UserPreferences) => {
    setPreferences(newPreferences);
    if (isLoaded) {
      try {
        window.localStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(newPreferences));
      } catch (error) {
        console.error("Failed to save user preferences to localStorage", error);
      }
    }
  }, [isLoaded]);

  return { preferences, savePreferences, isLoaded };
}
