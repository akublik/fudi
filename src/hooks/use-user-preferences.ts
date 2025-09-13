
"use client";

import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { UserPreferences } from '@/lib/types';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

export function useUserPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>({ restrictions: [], cuisines: [], otherCuisines: '' });
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchPreferences = useCallback(async () => {
    if (!user) {
      setIsLoaded(true);
      return;
    }
    setIsLoaded(false);
    try {
      const docRef = doc(db, 'userPreferences', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as UserPreferences;
        // Ensure defaults if fields are missing
        setPreferences({ 
            restrictions: [], 
            cuisines: [], 
            otherCuisines: '', 
            ...data 
        });
      }
    } catch (error) {
      console.error("Failed to load user preferences from Firestore", error);
    } finally {
      setIsLoaded(true);
    }
  }, [user]);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const savePreferences = useCallback(async (newPreferences: UserPreferences) => {
    if (!user) return;
    
    try {
      const docRef = doc(db, 'userPreferences', user.uid);
      await setDoc(docRef, newPreferences, { merge: true });
      // After saving, update the local state to match what's in the DB
      setPreferences(newPreferences);
    } catch (error) {
      console.error("Failed to save user preferences to Firestore", error);
      // Optionally re-fetch or revert state on error
    }
  }, [user]);

  return { preferences, savePreferences, isLoaded, refetch: fetchPreferences };
}
