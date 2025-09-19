import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithCredential,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AUTH_CONFIG } from '../config/authConfig';
import { User } from '../types/Auth';
import { auth } from '../config/firebase';
import { firebaseService } from './firebaseService';
import { AUTH_ERRORS } from '../config/authConfig';

// Chaves para AsyncStorage
const STORAGE_KEYS = {
  USER_DATA: '@recipe_app_user_data',
  AUTH_STATE: '@recipe_app_auth_state',
  AUTH_TOKEN: '@recipe_app_auth_token',
} as const;

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

  // Métodos de persistência com AsyncStorage
  private async saveUserData(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_STATE, 'true');
      
      // Salvar token de autenticação se disponível
      if (auth.currentUser) {
        const token = await auth.currentUser.getIdToken();
        await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      }
      
      console.log('[AuthService] Dados do usuário salvos no AsyncStorage');
    } catch (error) {
      console.error('[AuthService] Erro ao salvar dados do usuário:', error);
    }
  }

  private async loadUserData(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      const authState = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_STATE);
      
      console.log('[AuthService] Verificando dados salvos:', { 
        hasUserData: !!userData, 
        authState 
      });
      
      if (userData && authState === 'true') {
        const user = JSON.parse(userData) as User;
        console.log('[AuthService] Dados do usuário carregados do AsyncStorage:', user.email);
        return user;
      }
      
      console.log('[AuthService] Nenhum dado de usuário encontrado no AsyncStorage');
      return null;
    } catch (error) {
      console.error('[AuthService] Erro ao carregar dados do usuário:', error);
      return null;
    }
  }

  private async clearUserData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_STATE);
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      console.log('[AuthService] Dados do usuário removidos do AsyncStorage');
    } catch (error) {
      console.error('[AuthService] Erro ao limpar dados do usuário:', error);
    }
  }

  // Configurar listener de mudanças de autenticação
  private setupAuthStateListener() {
    this.authStateListener = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('[AuthService] Mudança de estado de autenticação:', firebaseUser ? 'Usuário logado' : 'Usuário deslogado');
      
      if (firebaseUser) {
        this.currentUser = await this.convertFirebaseUser(firebaseUser);
        // Salvar/atualizar dados do usuário no Firestore
        if (this.currentUser) {
          await firebaseService.createOrUpdateUser(this.currentUser);
          // Salvar dados do usuário no AsyncStorage
          await this.saveUserData(this.currentUser);
        }
      } else {
        // Só limpar dados se o usuário fez logout explicitamente
        // Não limpar quando o Firebase perde a sessão por fechamento do app
        console.log('[AuthService] Firebase perdeu a sessão, mas mantendo dados no AsyncStorage');
        this.currentUser = null;
      }
    });
  }

  // Tentar reautenticar o usuário no Firebase
  private async tryReauthenticate(user: User): Promise<void> {
    try {
      console.log('[AuthService] Tentando reautenticar usuário no Firebase...');
      
      // Se o usuário está logado localmente mas não no Firebase,
      // precisamos forçar um novo login
      if (!auth.currentUser) {
        console.log('[AuthService] Firebase perdeu a sessão, forçando logout local');
        await this.clearUserData();
        this.currentUser = null;
        return;
      }
      
      // Se chegou até aqui, o usuário está autenticado no Firebase
      console.log('[AuthService] Usuário reautenticado com sucesso no Firebase');
    } catch (error) {
      console.error('[AuthService] Erro ao tentar reautenticar:', error);
      // Em caso de erro, limpar dados locais
      await this.clearUserData();
      this.currentUser = null;
    }
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

  // Verificar se o usuário está autenticado no Firebase
  isFirebaseAuthenticated(): boolean {
    return auth.currentUser !== null;
  }

  // Verificar se precisa fazer login novamente
  async needsReauthentication(): Promise<boolean> {
    try {
      // Se não há usuário no Firebase, precisa reautenticar
      if (!auth.currentUser) {
        return true;
      }

      // Verificar se o token ainda é válido
      try {
        await auth.currentUser.getIdToken(true); // Force refresh
        return false;
      } catch (error) {
        console.log('[AuthService] Token inválido, precisa reautenticar');
        return true;
      }
    } catch (error) {
      console.error('[AuthService] Erro ao verificar reautenticação:', error);
      return true;
    }
  }

  // Verificar se o usuário está autenticado
  async isAuthenticated(): Promise<boolean> {
    console.log('[AuthService] Verificando autenticação...');

    // Aguarda o Firebase reidratar a sessão persistida (React Native persistence)
    // auth.authStateReady() está disponível no SDK v10+ e resolve quando o estado está carregado
    try {
      const anyAuth = auth as unknown as { authStateReady?: () => Promise<void> };
      if (typeof anyAuth.authStateReady === 'function') {
        await anyAuth.authStateReady();
      }
    } catch (_) {
      // Ignorar caso não esteja disponível
    }

    // Após reidratação, verifica usuário atual
    if (auth.currentUser) {
      console.log('[AuthService] Usuário encontrado no Firebase:', auth.currentUser.email);

      const needsReauth = await this.needsReauthentication();
      if (needsReauth) {
        console.log('[AuthService] Usuário precisa reautenticar, limpando dados');
        await this.clearUserData();
        this.currentUser = null;
        return false;
      }
      return true;
    }

    console.log('[AuthService] Nenhum usuário no Firebase, verificando AsyncStorage...');

    // Fallback: verificar usuário salvo localmente
    const savedUser = await this.loadUserData();
    if (savedUser) {
      console.log('[AuthService] Usuário carregado do AsyncStorage:', savedUser.email);

      // Sem currentUser no Firebase após reidratação, considerar sessão inválida
      await this.clearUserData();
      this.currentUser = null;
      return false;
    }

    console.log('[AuthService] Usuário não autenticado');
    return false;
  }

  // Obter usuário atual
  async getCurrentUser(): Promise<User | null> {
    // Se já temos o usuário em memória, retornar
    if (this.currentUser) {
      return this.currentUser;
    }

    // Se há usuário no Firebase, converter e salvar
    // Garante que estado de auth foi reidratado antes de consultar
    try {
      const anyAuth = auth as unknown as { authStateReady?: () => Promise<void> };
      if (typeof anyAuth.authStateReady === 'function') {
        await anyAuth.authStateReady();
      }
    } catch (_) {}

    if (auth.currentUser) {
      this.currentUser = await this.convertFirebaseUser(auth.currentUser);
      // Salvar dados do usuário no AsyncStorage
      await this.saveUserData(this.currentUser);
      return this.currentUser;
    }

    // Se não há usuário no Firebase, tentar carregar do AsyncStorage
    const savedUser = await this.loadUserData();
    if (savedUser) {
      this.currentUser = savedUser;
      return savedUser;
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
      
      // Salvar dados do usuário no AsyncStorage
      await this.saveUserData(user);
      
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
      
      // Salvar dados do usuário no AsyncStorage
      await this.saveUserData(user);
      
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
      // No construtor ou método de inicialização
      GoogleSignin.configure({
        webClientId: AUTH_CONFIG.GOOGLE.WEB_CLIENT_ID,
        offlineAccess: true,
        hostedDomain: '',
        forceCodeForRefreshToken: true,
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
      
      // Salvar dados do usuário no AsyncStorage
      await this.saveUserData(user);
      
      this.currentUser = user;
      return user;
    } catch (error: any) {
      console.error('Erro no login com Google:', error);
      
      // Mapear erros específicos do Google Sign-In
      if (error.code === 'DEVELOPER_ERROR') {
        throw new Error('Erro de configuração do Google Sign-In. Verifique as configurações.');
      } else if (error.code === 'SIGN_IN_CANCELLED') {
        throw new Error('Login cancelado pelo usuário');
      } else if (error.code === 'IN_PROGRESS') {
        throw new Error('Login já em progresso');
      } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
        throw new Error('Google Play Services não disponível');
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        throw new Error('Já existe uma conta com este email usando outro método de login.');
      } else {
        throw new Error(AUTH_ERRORS.GOOGLE_SIGNIN_ERROR);
      }
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
      
      // Salvar dados do usuário no AsyncStorage
      await this.saveUserData(user);
      
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
      
      // Limpar dados do AsyncStorage
      await this.clearUserData();
      
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

  // Alterar senha do usuário
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      if (!auth.currentUser) {
        throw new Error('Usuário não autenticado');
      }

      // Verificar se o usuário foi criado com email/senha
      const user = auth.currentUser;
      const providerData = user.providerData;
      
      // Verificar se o usuário tem provedor de email/senha
      const hasEmailProvider = providerData.some(provider => 
        provider.providerId === 'password'
      );

      if (!hasEmailProvider) {
        throw new Error('A alteração de senha só está disponível para contas criadas com email e senha');
      }

      // Reautenticar o usuário com a senha atual
      const credential = EmailAuthProvider.credential(user.email!, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Atualizar a senha
      await updatePassword(user, newPassword);
      
      console.log('[AuthService] Senha alterada com sucesso');
    } catch (error: any) {
      console.error('[AuthService] Erro ao alterar senha:', error);
      
      // Mapear erros do Firebase para mensagens em português
      switch (error.code) {
        case 'auth/wrong-password':
          throw new Error('Senha atual incorreta');
        case 'auth/weak-password':
          throw new Error('A nova senha é muito fraca');
        case 'auth/requires-recent-login':
          throw new Error('É necessário fazer login novamente para alterar a senha');
        case 'auth/network-request-failed':
          throw new Error('Erro de conexão. Verifique sua internet');
        default:
          throw new Error(error.message || 'Não foi possível alterar a senha');
      }
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