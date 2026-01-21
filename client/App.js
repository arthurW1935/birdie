import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { StatusBar } from 'expo-status-bar';
import AppNav from './src/navigation/AppNav';

export default function App() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <AppNav />
        <StatusBar style="light" /> 
      </SafeAreaProvider>
    </AuthProvider>
  );
}