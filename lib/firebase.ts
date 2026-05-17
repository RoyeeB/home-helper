import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace these with your actual Firebase project config from the Firebase Console
const firebaseConfig = {
  apiKey: 'AIzaSyDKcE0SKb9IauZW1uxBgc4ciREwn2s1ROE',
  authDomain: 'home-helper-2b944.firebaseapp.com',
  projectId: 'home-helper-2b944',
  storageBucket: 'home-helper-2b944.firebasestorage.app',
  messagingSenderId: '265514618886',
  appId: '1:265514618886:ios:6c8e761ca50a2f5bab7387',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

function getFirebaseAuth() {
  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    return getAuth(app);
  }
}

export const auth = getFirebaseAuth();
export const db = getFirestore(app);
