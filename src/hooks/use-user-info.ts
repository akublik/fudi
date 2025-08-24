"use client";

import { useState, useEffect, useCallback } from 'react';
import type { UserInfo } from '@/lib/types';

const USER_INFO_KEY = 'daily-chef-user-info';

export function useUserInfo() {
  const [userInfo, setUserInfoState] = useState<UserInfo>({ name: '', address: '', whatsapp: '' });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(USER_INFO_KEY);
      if (item) {
        setUserInfoState(JSON.parse(item));
      }
    } catch (error) {
      console.error("Failed to load user info from localStorage", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const setUserInfo = useCallback((newInfo: UserInfo) => {
    setUserInfoState(newInfo);
    if (isLoaded) {
      try {
        window.localStorage.setItem(USER_INFO_KEY, JSON.stringify(newInfo));
      } catch (error) {
        console.error("Failed to save user info to localStorage", error);
      }
    }
  }, [isLoaded]);

  return { userInfo, setUserInfo, isLoaded };
}
