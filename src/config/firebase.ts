import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from "firebase/storage"; // <-- AÑADIR ESTA LÍNEA
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDHkfrSIvQdZ2X9FmPkurLvrvQYvi5zl5M",
  authDomain: "northpadel-5a21e.firebaseapp.com",
  projectId: "northpadel-5a21e",
  storageBucket: "northpadel-5a21e.appspot.com", // OJO: Generalmente no lleva 'firebasestorage'
  messagingSenderId: "91155734343",
  appId: "1:91155734343:web:452a6ea55b944279cbf662",
  measurementId: "G-QV185EPXME"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Auth con persistencia en AsyncStorage
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Inicializar Firestore
const db = getFirestore(app);

// Inicializar Storage
const storage = getStorage(app); // <-- Ahora esto funcionará

export { auth, db, storage };
export default app;