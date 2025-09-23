import { appleAuth } from '@invertase/react-native-apple-authentication';
import { Platform } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

export interface AppleAuthResult {
  user: {
    id: string;
    email?: string;
    fullName?: {
      givenName?: string;
      familyName?: string;
    };
  };
  identityToken?: string;
  authorizationCode?: string;
}

class AppleAuthService {
  /**
   * Verifica se o Apple Sign In está disponível no dispositivo
   */
  async isAvailable(): Promise<boolean> {
    if (Platform.OS !== 'ios') {
      return false;
    }
    
    try {
      return await appleAuth.isAvailable;
    } catch (error) {
      console.error('Erro ao verificar disponibilidade do Apple Sign In:', error);
      return false;
    }
  }

  /**
   * Realiza o login com Apple
   */
  async signIn(): Promise<AppleAuthResult> {
    try {
      // Verifica se está disponível
      const isAvailable = await this.isAvailable();
      if (!isAvailable) {
        throw new Error('Apple Sign In não está disponível neste dispositivo');
      }

      // Inicia o processo de autenticação
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

      // Verifica se a autenticação foi bem-sucedida
      if (!appleAuthRequestResponse.identityToken) {
        throw new Error('Falha na autenticação com Apple');
      }

      // Retorna os dados do usuário
      return {
        user: {
          id: appleAuthRequestResponse.user,
          email: appleAuthRequestResponse.email || undefined,
          fullName: appleAuthRequestResponse.fullName || undefined,
        },
        identityToken: appleAuthRequestResponse.identityToken,
        authorizationCode: appleAuthRequestResponse.authorizationCode || undefined,
      };
    } catch (error: any) {
      console.error('Erro no Apple Sign In:', error);
      
      // Trata erros específicos
      if (error.code === 'ERR_CANCELED') {
        throw new Error('Login cancelado pelo usuário');
      } else if (error.code === 'ERR_REQUEST_NOT_HANDLED') {
        throw new Error('Apple Sign In não configurado corretamente');
      } else if (error.code === 'ERR_REQUEST_NOT_INTERACTIVE') {
        throw new Error('Apple Sign In não está disponível');
      }
      
      throw new Error('Erro ao fazer login com Apple: ' + error.message);
    }
  }

  /**
   * Realiza o logout
   */
  async signOut(): Promise<void> {
    try {
      // O Apple Sign In não requer logout explícito
      // O usuário pode revogar o acesso nas configurações do iOS
      console.log('Apple Sign In logout - usuário deve revogar acesso nas configurações do iOS');
    } catch (error) {
      console.error('Erro no logout do Apple Sign In:', error);
      throw new Error('Erro ao fazer logout com Apple');
    }
  }

  /**
   * Obtém o estado de autenticação
   */
  async getCredentialState(userID: string): Promise<number> {
    try {
      return await appleAuth.getCredentialStateForUser(userID);
    } catch (error) {
      console.error('Erro ao obter estado da credencial Apple:', error);
      return appleAuth.State.UNKNOWN;
    }
  }

  /**
   * Verifica se o usuário está autenticado
   */
  async isSignedIn(): Promise<boolean> {
    try {
      const credentialState = await appleAuth.getCredentialStateForUser('currentUser');
      return credentialState === appleAuth.State.AUTHORIZED;
    } catch (error) {
      console.error('Erro ao verificar se está logado com Apple:', error);
      return false;
    }
  }
}

export default new AppleAuthService();
