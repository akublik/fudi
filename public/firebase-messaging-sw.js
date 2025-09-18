// Scripts for firebase and firebase messaging
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

// Initialize the Firebase app in the service worker by passing in the messagingSenderId.
// This script has access to the environment variables starting with NEXT_PUBLIC_
firebase.initializeApp({
    apiKey: self.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: self.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: self.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: self.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: self.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: self.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: self.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
});


// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon.png'
  };

  self.registration.showNotification(notificationTitle,
    notificationOptions);
});
