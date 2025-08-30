import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { AppNavigator } from './src/navigation/AppNavigator';
import { db } from './src/services/database';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function App() {
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize database
        await db.initialize();
        console.log('App initialized successfully');
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        // Hide splash screen
        await SplashScreen.hideAsync();
      }
    };

    initializeApp();
  }, []);

  return (
    <>
      <StatusBar style="dark" backgroundColor="#ffffff" />
      <AppNavigator />
    </>
  );
}
