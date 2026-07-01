import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

import { useAuth } from '../context/AuthContext';

// Auth
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import RecoveryScreen from '../screens/auth/RecoveryScreen';

// Dashboard
import HomeScreen from '../screens/dashboard/HomeScreen';
import TicketDetailScreen from '../screens/dashboard/TicketDetailScreen';
import NewTicketScreen from '../screens/dashboard/NewTicketScreen';

import MediaScreen from '../screens/dashboard/MediaScreen';
import TimelineScreen from '../screens/dashboard/TimelineScreen';
import HistoryScreen from '../screens/dashboard/HistoryScreen';
import ProfileScreen from '../screens/dashboard/ProfileScreen';
import UserManagementScreen from '../screens/admin/UserManagementScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="Recovery" component={RecoveryScreen} />
  </Stack.Navigator>
);

function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: {
          backgroundColor: '#1A202C',
        },

        headerTintColor: '#FFFFFF',

        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          height: 65,
          paddingBottom: 8,
        },

        tabBarActiveTintColor: '#1A202C',
        tabBarInactiveTintColor: '#718096',

        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Inicio') {
            iconName = 'home';
          } else if (route.name === 'Multimedia') {
            iconName = 'camera';
          } else if (route.name === 'Seguimiento') {
            iconName = 'time';
          } else if (route.name === 'Historial') {
            iconName = 'stats-chart';
          } else if (route.name === 'Perfil') { // NUEVO ICONO
            iconName = 'person';
          }

          return (
            <Ionicons
              name={iconName}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="Inicio"
        component={HomeScreen}
      />

      <Tab.Screen
        name="Multimedia"
        component={MediaScreen}
      />

      <Tab.Screen
        name="Seguimiento"
        component={TimelineScreen}
      />

      <Tab.Screen
        name="Historial"
        component={HistoryScreen}
      />

      {/* NUEVA PESTAÑA DE PERFIL */}
      <Tab.Screen
        name="Perfil"
        component={ProfileScreen}
      />
    </Tab.Navigator>
  );
}

const MainStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="MainTabs"
      component={BottomTabs}
      options={{ headerShown: false }}
    />

    <Stack.Screen
      name="TicketDetail"
      component={TicketDetailScreen}
      options={{
        title: 'Detalle del Ticket',
        headerStyle: {
          backgroundColor: '#1A202C',
        },
        headerTintColor: '#FFFFFF',
      }}
    />

    <Stack.Screen
      name="NewTicket"
      component={NewTicketScreen}
      options={{
        title: 'Nuevo Ticket',
        headerStyle: {
          backgroundColor: '#1A202C',
        },
        headerTintColor: '#FFFFFF',
      }}
    />

    <Stack.Screen
      name="UserManagement"
      component={UserManagementScreen}
      options={{
        title: 'Usuarios',
        headerStyle: {
          backgroundColor: '#1A202C',
        },
        headerTintColor: '#FFFFFF',
      }}
    />
  </Stack.Navigator>
);

const SplashScreen = () => (
  <View style={styles.splash}>
    <ActivityIndicator
      size="large"
      color="#1A202C"
    />
  </View>
);

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