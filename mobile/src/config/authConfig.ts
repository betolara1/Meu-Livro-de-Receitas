// Configurações de autenticação
export const AUTH_CONFIG = {
  // URLs da API - substitua pelas suas URLs reais
  API_BASE_URL: 'https://your-api-url.com/api',
  
  // Google Sign-In Configuration
  GOOGLE: {
    // Substitua pelo seu Web Client ID do Google Console
    WEB_CLIENT_ID: 'YOUR_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com',
    
    // Para desenvolvimento, você pode usar um ID de teste
    // Em produção, use o ID real do seu projeto
  },
  
  // Apple Sign-In Configuration
  APPLE: {
    // O Apple Sign-In é configurado automaticamente no iOS
    // Certifique-se de que o Bundle ID está configurado no Apple Developer Console
  },
  
  // Configurações de armazenamento
  STORAGE: {
    USER_KEY: 'user_data',
    TOKEN_KEY: 'auth_token',
  },
  
  // Configurações de validação
  VALIDATION: {
    MIN_PASSWORD_LENGTH: 6,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
};

// Endpoints da API
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    GOOGLE: '/auth/google',
    APPLE: '/auth/apple',
    RESET_PASSWORD: '/auth/reset-password',
    REFRESH_TOKEN: '/auth/refresh',
    LOGOUT: '/auth/logout',
  },
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
  },
};

// Mensagens de erro
export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Email ou senha inválidos',
  EMAIL_ALREADY_EXISTS: 'Este email já está em uso',
  WEAK_PASSWORD: 'A senha deve ter pelo menos 6 caracteres',
  INVALID_EMAIL: 'Por favor, informe um email válido',
  NETWORK_ERROR: 'Erro de conexão. Verifique sua internet',
  UNKNOWN_ERROR: 'Ocorreu um erro inesperado',
  GOOGLE_SIGNIN_ERROR: 'Erro ao fazer login com Google',
  APPLE_SIGNIN_ERROR: 'Erro ao fazer login com Apple',
  RESET_PASSWORD_ERROR: 'Erro ao enviar email de recuperação',
};
