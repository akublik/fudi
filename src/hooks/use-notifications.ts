
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
        const messaging = getMessaging(app);
        
        console.log('Requesting notification permission...');
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
            // Here you would typically send the token to your server
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
      if (typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator && getMessaging(app)) {
        const permissionStatus = Notification.permission;
        if (permissionStatus === 'default') {
            toast({
                title: '¡No te pierdas de nada!',
                description: 'Activa las notificaciones para recibir las últimas recetas y consejos de Fudi Chef.',
                duration: 10000,
                action: (
                    <ToastAction altText="Activar" onClick={requestPermission}>
                        Activar
                    </ToastAction>
                ),
            });
        } else if (permissionStatus === 'granted') {
            // If permission is already granted, we can just get the token silently
            requestPermission();
        } else {
            console.log("Notification permission was denied.");
        }
      }
    };
    
    // Check after a small delay to not bombard the user on page load
    const timer = setTimeout(() => {
        checkAndPromptForPermission();
    }, 5000);


    // Handle foreground messages
    const messagingInstance = getMessaging(app);
    let unsubscribe: () => void = () => {};

    if(messagingInstance) {
        unsubscribe = onMessage(messagingInstance, (payload) => {
          console.log('Message received in foreground. ', payload);
          toast({
            title: payload.notification?.title,
            description: payload.notification?.body,
          });
        });
    }
    
    return () => {
      clearTimeout(timer);
      unsubscribe();
    };

  }, [toast]);
};

export default useNotifications;
