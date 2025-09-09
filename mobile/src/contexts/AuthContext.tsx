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
      setIsLoading(true);
      const isAuthenticated = await authService.isAuthenticated();
      
      if (isAuthenticated) {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
        
        // Inicializar categorias padrão para o usuário logado
        if (currentUser) {
          await initializeUserData(currentUser.id);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Erro ao verificar estado de autenticação:', error);
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
        // Criar categorias padrão
        const defaultCategories = [
          { name: 'Pratos Principais', slug: 'pratos-principais' },
          { name: 'Sobremesas', slug: 'sobremesas' },
          { name: 'Entradas', slug: 'entradas' },
          { name: 'Bebidas', slug: 'bebidas' },
          { name: 'Lanches', slug: 'lanches' },
          { name: 'Saladas', slug: 'saladas' },
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
