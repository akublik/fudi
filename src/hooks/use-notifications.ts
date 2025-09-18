
"use client";

import { useEffect } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { app } from '@/lib/firebase';
import { useToast } from './use-toast';
import { ToastAction } from '@/components/ui/toast';

const useNotifications = () => {
  const { toast } = useToast();

  useEffect(() => {
    const requestPermission = async () => {
      try {
        if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !app) {
          return;
        }

        const messaging = getMessaging(app);
        
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
          console.log('Notification permission granted.');

          const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
          if (!vapidKey) {
            console.error("VAPID key is missing. Cannot get FCM token.");
            return;
          }

          const currentToken = await getToken(messaging, { 
            vapidKey: vapidKey 
          });

          if (currentToken) {
            console.log('FCM Token:', currentToken);
          } else {
            console.log('No registration token available. Request permission to generate one.');
          }
        } else {
          console.log('Unable to get permission to notify.');
        }
      } catch (error) {
        console.error('An error occurred while retrieving token. ', error);
      }
    };
    
    const checkAndPromptForPermission = () => {
      if (typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator) {
         try {
            getMessaging(app); // This will throw if not supported
            const permissionStatus = Notification.permission;
            if (permissionStatus === 'default') {
                toast({
                    title: '¡No te pierdas de nada!',
                    description: 'Activa las notificaciones para recibir las últimas recetas y consejos de Fudi Chef.',
                    duration: 10000,
                    action: <ToastAction onClick={requestPermission}>Activar</ToastAction>,
                });
            } else if (permissionStatus === 'granted') {
                requestPermission();
            } else {
                console.log("Notification permission was denied.");
            }
        } catch(e) {
            console.log('Firebase Messaging not supported.');
        }
      }
    };
    
    const timer = setTimeout(() => {
        checkAndPromptForPermission();
    }, 5000);

    let unsubscribe: () => void = () => {};
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        try {
            const messagingInstance = getMessaging(app);
            unsubscribe = onMessage(messagingInstance, (payload) => {
              console.log('Message received in foreground. ', payload);
              toast({
                title: payload.notification?.title,
                description: payload.notification?.body,
              });
            });
        } catch (e) {
             console.log('Firebase Messaging not supported, cannot listen for foreground messages.');
        }
    }
    
    return () => {
      clearTimeout(timer);
      unsubscribe();
    };

  }, [toast]);
};

export default useNotifications;
