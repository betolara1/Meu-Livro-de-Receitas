import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithCredential
} from 'firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';
import { User } from '../types/Auth';
import { auth } from '../config/firebase';
import { firebaseService } from './firebaseService';
import { AUTH_ERRORS } from '../config/authConfig';

export class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;
  private authStateListener: (() => void) | null = null;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  constructor() {
    this.setupAuthStateListener();
  }

  // Configurar listener de mudanças de autenticação
  private setupAuthStateListener() {
    this.authStateListener = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        this.currentUser = await this.convertFirebaseUser(firebaseUser);
        // Salvar/atualizar dados do usuário no Firestore
        if (this.currentUser) {
          await firebaseService.createOrUpdateUser(this.currentUser);
        }
      } else {
        this.currentUser = null;
      }
    });
  }

  // Converter Firebase User para nosso tipo User
  private async convertFirebaseUser(firebaseUser: FirebaseUser): Promise<User> {
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuário',
      photo: firebaseUser.photoURL || undefined, // Manter undefined para compatibilidade
      provider: firebaseUser.providerData[0]?.providerId === 'google.com' ? 'google' : 
                firebaseUser.providerData[0]?.providerId === 'apple.com' ? 'apple' : 'email',
      createdAt: new Date(),
    };
  }

  // Verificar se o usuário está autenticado
  async isAuthenticated(): Promise<boolean> {
    return !!auth.currentUser;
  }

  // Obter usuário atual
  async getCurrentUser(): Promise<User | null> {
    if (this.currentUser) {
      return this.currentUser;
    }

    if (auth.currentUser) {
      this.currentUser = await this.convertFirebaseUser(auth.currentUser);
      return this.currentUser;
    }

    return null;
  }

  // Login com email e senha
  async signInWithEmail(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = await this.convertFirebaseUser(userCredential.user);
      
      // Salvar dados do usuário no Firestore
      await firebaseService.createOrUpdateUser(user);
      
      this.currentUser = user;
      return user;
    } catch (error: any) {
      console.error('Erro no login:', error);
      
      // Mapear erros do Firebase para mensagens em português
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          throw new Error(AUTH_ERRORS.INVALID_CREDENTIALS);
        case 'auth/too-many-requests':
          throw new Error('Muitas tentativas. Tente novamente mais tarde.');
        case 'auth/network-request-failed':
          throw new Error(AUTH_ERRORS.NETWORK_ERROR);
        default:
          throw new Error(error.message || AUTH_ERRORS.UNKNOWN_ERROR);
      }
    }
  }

  // Registro com email e senha
  async signUpWithEmail(email: string, password: string, name: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      const user = await this.convertFirebaseUser(userCredential.user);
      // Atualizar o nome do usuário
      user.name = name;
      
      // Salvar dados do usuário no Firestore
      await firebaseService.createOrUpdateUser(user);
      
      this.currentUser = user;
      return user;
    } catch (error: any) {
      console.error('Erro no registro:', error);
      
      // Mapear erros do Firebase para mensagens em português
      switch (error.code) {
        case 'auth/email-already-in-use':
          throw new Error(AUTH_ERRORS.EMAIL_ALREADY_EXISTS);
        case 'auth/weak-password':
          throw new Error(AUTH_ERRORS.WEAK_PASSWORD);
        case 'auth/invalid-email':
          throw new Error(AUTH_ERRORS.INVALID_EMAIL);
        case 'auth/network-request-failed':
          throw new Error(AUTH_ERRORS.NETWORK_ERROR);
        default:
          throw new Error(error.message || AUTH_ERRORS.UNKNOWN_ERROR);
      }
    }
  }

  // Login com Google
  async signInWithGoogle(): Promise<User> {
    try {
      // Configurar Google Sign-In se ainda não foi configurado
      GoogleSignin.configure({
        webClientId: 'YOUR_GOOGLE_WEB_CLIENT_ID', // Substitua pelo seu Web Client ID
        offlineAccess: true,
      });

      await GoogleSignin.hasPlayServices();
      const result = await GoogleSignin.signIn();
      const idToken = result.data?.idToken;
      
      if (!idToken) {
        throw new Error('Falha ao obter token do Google');
      }
      
      const googleCredential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, googleCredential);
      
      const user = await this.convertFirebaseUser(userCredential.user);
      
      // Salvar dados do usuário no Firestore
      await firebaseService.createOrUpdateUser(user);
      
      this.currentUser = user;
      return user;
    } catch (error: any) {
      console.error('Erro no login com Google:', error);
      
      if (error.code === 'auth/account-exists-with-different-credential') {
        throw new Error('Já existe uma conta com este email usando outro método de login.');
      }
      
      throw new Error(AUTH_ERRORS.GOOGLE_SIGNIN_ERROR);
    }
  }

  // Login com Apple
  async signInWithApple(): Promise<User> {
    try {
      if (Platform.OS !== 'ios') {
        throw new Error('Apple Sign-In só está disponível no iOS');
      }

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        throw new Error('Falha ao obter token do Apple');
      }

      // Para Apple Sign-In, precisaríamos implementar a autenticação com Firebase
      // Por enquanto, vamos simular o comportamento
      const user: User = {
        id: credential.user,
        email: credential.email || `${credential.user}@privaterelay.appleid.com`,
        name: credential.fullName ? 
          `${credential.fullName.givenName || ''} ${credential.fullName.familyName || ''}`.trim() :
          credential.email?.split('@')[0] || 'Usuário Apple',
        provider: 'apple',
        createdAt: new Date(),
      };

      // Salvar dados do usuário no Firestore
      await firebaseService.createOrUpdateUser(user);
      
      this.currentUser = user;
      return user;
    } catch (error: any) {
      console.error('Erro no login com Apple:', error);
      throw new Error(AUTH_ERRORS.APPLE_SIGNIN_ERROR);
    }
  }

  // Recuperação de senha
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
      console.log('Email de recuperação enviado para:', email);
    } catch (error: any) {
      console.error('Erro na recuperação de senha:', error);
      
      switch (error.code) {
        case 'auth/user-not-found':
          throw new Error('Nenhuma conta encontrada com este email.');
        case 'auth/invalid-email':
          throw new Error(AUTH_ERRORS.INVALID_EMAIL);
        case 'auth/network-request-failed':
          throw new Error(AUTH_ERRORS.NETWORK_ERROR);
        default:
          throw new Error(AUTH_ERRORS.RESET_PASSWORD_ERROR);
      }
    }
  }

  // Logout
  async signOut(): Promise<void> {
    try {
      // Fazer logout do Google se estiver logado
      try {
        await GoogleSignin.signOut();
      } catch (googleError) {
        // Ignore Google Sign-In errors during logout
        console.log('Google Sign-In not configured or error during logout:', googleError);
      }

      // Fazer logout do Firebase
      await firebaseSignOut(auth);
      
      this.currentUser = null;
    } catch (error) {
      console.error('Erro no logout:', error);
      throw error;
    }
  }

  // Obter token de autenticação
  async getAuthToken(): Promise<string | null> {
    try {
      if (auth.currentUser) {
        return await auth.currentUser.getIdToken();
      }
      return null;
    } catch (error) {
      console.error('Erro ao obter token:', error);
      return null;
    }
  }

  // Limpar listener quando necessário
  destroy() {
    if (this.authStateListener) {
      this.authStateListener();
      this.authStateListener = null;
    }
  }
}

// Singleton instance
export const authService = AuthService.getInstance();