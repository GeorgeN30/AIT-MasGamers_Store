import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

import { useAuth } from '../context/AuthContext';

// Pantallas de autenticación
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import RecoveryScreen from '../screens/auth/RecoveryScreen';

// Pantallas del dashboard
import HomeScreen from '../screens/dashboard/HomeScreen';
import TicketDetailScreen from '../screens/dashboard/TicketDetailScreen';
import NewTicketScreen from '../screens/dashboard/NewTicketScreen';

const Stack = createNativeStackNavigator();

// Stack de no-autenticado
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="Recovery" component={RecoveryScreen} />
  </Stack.Navigator>
);

// Stack de autenticado
const MainStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: '#1A202C' },
      headerTintColor: '#FFFFFF',
      headerTitleStyle: { fontWeight: 'bold' },
    }}
  >
    <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'MG Soporte' }} />
    <Stack.Screen name="TicketDetail" component={TicketDetailScreen} options={{ title: 'Detalle del Ticket' }} />
    <Stack.Screen name="NewTicket" component={NewTicketScreen} options={{ title: 'Nuevo Ticket' }} />
  </Stack.Navigator>
);

// Pantalla de splash mientras se inicializa la sesión
const SplashScreen = () => (
  <View style={styles.splash}>
    <ActivityIndicator size="large" color="#1A202C" />
  </View>
);

// Navigator principal — decide qué stack mostrar
export default function AppNavigator() {
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) return <SplashScreen />;

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F5F7',
  },
});
