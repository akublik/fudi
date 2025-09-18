
"use client";

import { useEffect } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { app } from '@/lib/firebase';
import { useToast } from './use-toast';
import { ToastAction } from '@/components/ui/toast';

const useNotifications = () => {
  const { toast } = useToast();

  useEffect(() => {
    // This function will be called by the toast action
    const requestPermission = async () => {
      try {
        const messaging = getMessaging(app);
        
        console.log('Requesting notification permission...');
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
          console.log('Notification permission granted.');

          const currentToken = await getToken(messaging, { 
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY 
          });

          if (currentToken) {
            console.log('FCM Token:', currentToken);
            // Here you would typically send this token to your server.
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
    
    // Function to check and prompt for notification permission
    const checkAndPromptForPermission = () => {
      if (typeof window !== 'undefined' && 'Notification' in window && getMessaging(app)) {
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
        } else if (permissionStatus === 'denied') {
            console.log("Notification permission was denied.");
        } else {
            // If permission is already granted, we can try to get the token silently.
            requestPermission();
        }
      }
    };
    
    checkAndPromptForPermission();

    // Handle foreground messages
    const messagingInstance = getMessaging(app);
    if(messagingInstance) {
        const unsubscribe = onMessage(messagingInstance, (payload) => {
          console.log('Message received in foreground. ', payload);
          toast({
            title: payload.notification?.title,
            description: payload.notification?.body,
          });
        });

        return () => {
          unsubscribe();
        };
    }
  }, [toast]);
};

export default useNotifications;
