import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuração do Firebase
// IMPORTANTE: Substitua estas configurações pelas suas próprias do Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyA6C0H7P5b7rJgL8C-Gz4ww9v6_V4dV9kE",
  authDomain: "livro-receitas-5c297.firebaseapp.com",
  projectId: "livro-receitas-5c297",
  storageBucket: "livro-receitas-5c297.appspot.com",
  messagingSenderId: "408849240977",
  appId: "y1:408849240977:web:e79d128e277b03aabbc030" // Você precisa adicionar o App ID
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Auth
const auth = getAuth(app);

// Inicializar Firestore
const db = getFirestore(app);

export { auth, db };
export default app;
