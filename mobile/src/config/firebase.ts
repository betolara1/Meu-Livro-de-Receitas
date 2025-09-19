import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuração do Firebase
// IMPORTANTE: Substitua estas configurações pelas suas próprias do Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyBxEx7DznytOCXJiovsb-MhXZraUkWVf1I",
  authDomain: "livro-receitas-mobile.firebaseapp.com",
  projectId: "livro-receitas-mobile",
  storageBucket: "livro-receitas-mobile.firebasestorage.app",
  messagingSenderId: "1067379841978",
  appId: "1:1067379841978:web:bcdc2bf2f8dde889d1db83",
  measurementId: "G-W1JWB37M7E"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Auth com persistência AsyncStorage
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Inicializar Firestore
const db = getFirestore(app);

export { auth, db };
export default app;
