import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { db } from './src/services/database';
import './src/config/firebase'; // Inicializar Firebase

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🚀 Inicializando aplicativo...');
        
        // Initialize database with timeout
        const initPromise = db.initialize();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout na inicialização')), 10000)
        );
        
        await Promise.race([initPromise, timeoutPromise]);
        
        console.log('✅ App inicializado com sucesso');
        setIsReady(true);
      } catch (error) {
        console.error('❌ Erro ao inicializar app:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
        setIsReady(true); // Mostrar interface mesmo com erro
      } finally {
        // Hide splash screen
        await SplashScreen.hideAsync();
      }
    };

    initializeApp();
  }, []);

  const handleRetry = () => {
    setError(null);
    setIsReady(false);
    // Recarregar o app
    window.location?.reload?.();
  };

  if (!isReady) {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" backgroundColor="#ffffff" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" backgroundColor="#ffffff" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Erro ao carregar o app</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <AuthProvider>
      <StatusBar style="dark" backgroundColor="#ffffff" />
      <AppNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
