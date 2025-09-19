import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService } from '../services/authService';
import { firebaseService } from '../services/firebaseService';
import { User, AuthContextType } from '../types/Auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      console.log('[AuthContext] Verificando estado de autenticação...');
      setIsLoading(true);
      
      // Aguarda o Firebase reidratar a sessão persistida, se disponível
      try {
        const { auth } = await import('../config/firebase');
        const anyAuth = auth as unknown as { authStateReady?: () => Promise<void> };
        if (typeof anyAuth.authStateReady === 'function') {
          await anyAuth.authStateReady();
        }
      } catch (_) {}
      
      const isAuthenticated = await authService.isAuthenticated();
      
      console.log('[AuthContext] Usuário autenticado:', isAuthenticated);
      
      if (isAuthenticated) {
        const currentUser = await authService.getCurrentUser();
        console.log('[AuthContext] Usuário carregado:', currentUser?.email);
        
        // Verificar se o usuário está realmente autenticado no Firebase
        if (currentUser && authService.isFirebaseAuthenticated()) {
          setUser(currentUser);
          await initializeUserData(currentUser.id);
        } else {
          // Se não está autenticado no Firebase, limpar dados locais
          console.log('[AuthContext] Usuário não autenticado no Firebase, limpando dados locais');
          setUser(null);
          await authService.signOut();
        }
      } else {
        console.log('[AuthContext] Nenhum usuário autenticado');
        setUser(null);
      }
    } catch (error) {
      console.error('[AuthContext] Erro ao verificar estado de autenticação:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeUserData = async (userId: string) => {
    try {
      // Verificar se o usuário já tem categorias
      const categories = await firebaseService.getCategories(userId);
      
      if (categories.length === 0) {
        // Criar categorias padrão (mesmas da página web)
        const defaultCategories = [
          { name: 'Pratos Principais', slug: 'pratos-principais' },
          { name: 'Sobremesas', slug: 'sobremesas' },
          { name: 'Entradas', slug: 'entradas' },
          { name: 'Bebidas', slug: 'bebidas' },
          { name: 'Vegetariano', slug: 'vegetariano' },
          { name: 'Doces', slug: 'doces' },
        ];

        for (const category of defaultCategories) {
          await firebaseService.createCategory(userId, category.name, category.slug);
        }
        
        console.log('[AuthContext] Categorias padrão criadas para o usuário');
      }
    } catch (error) {
      console.error('[AuthContext] Erro ao inicializar dados do usuário:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const userData = await authService.signInWithEmail(email, password);
      setUser(userData);
      
      // Inicializar dados do usuário
      await initializeUserData(userData.id);
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      const userData = await authService.signUpWithEmail(email, password, name);
      setUser(userData);
      
      // Inicializar dados do usuário
      await initializeUserData(userData.id);
    } catch (error) {
      console.error('Erro no registro:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      const userData = await authService.signInWithGoogle();
      setUser(userData);
      
      // Inicializar dados do usuário
      await initializeUserData(userData.id);
    } catch (error) {
      console.error('Erro no login com Google:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithApple = async () => {
    try {
      setIsLoading(true);
      const userData = await authService.signInWithApple();
      setUser(userData);
      
      // Inicializar dados do usuário
      await initializeUserData(userData.id);
    } catch (error) {
      console.error('Erro no login com Apple:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await authService.signOut();
      setUser(null);
    } catch (error) {
      console.error('Erro no logout:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await authService.resetPassword(email);
    } catch (error) {
      console.error('Erro na recuperação de senha:', error);
      throw error;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await authService.changePassword(currentPassword, newPassword);
    } catch (error) {
      console.error('Erro na alteração de senha:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signInWithGoogle,
    signInWithApple,
    signOut,
    resetPassword,
    changePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
