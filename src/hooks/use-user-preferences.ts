
"use client";

import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { UserPreferences } from '@/lib/types';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

export function useUserPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>({ restrictions: [], cuisines: [] });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const fetchPreferences = async () => {
      if (!user) {
        setIsLoaded(true);
        return;
      }
      try {
        const docRef = doc(db, 'userPreferences', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as UserPreferences;
           if (data.restrictions && data.cuisines) {
            setPreferences(data);
          }
        }
      } catch (error) {
        console.error("Failed to load user preferences from Firestore", error);
      } finally {
        setIsLoaded(true);
      }
    };

    fetchPreferences();
  }, [user]);

  const savePreferences = useCallback(async (newPreferences: UserPreferences) => {
    if (!user) return;
    setPreferences(newPreferences);
    try {
      const docRef = doc(db, 'userPreferences', user.uid);
      await setDoc(docRef, newPreferences, { merge: true });
    } catch (error) {
      console.error("Failed to save user preferences to Firestore", error);
    }
  }, [user]);

  return { preferences, savePreferences, isLoaded };
}
