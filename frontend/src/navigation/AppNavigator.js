import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';

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

import TimelineScreen from '../screens/dashboard/TimelineScreen';
import HistoryScreen from '../screens/dashboard/HistoryScreen';
import ProfileScreen from '../screens/dashboard/ProfileScreen';
import UserManagementScreen from '../screens/admin/UserManagementScreen';
import AdminReportScreen from '../screens/dashboard/AdminReportScreen';
import NotificationPanel from '../components/NotificationPanel';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="Recovery" component={RecoveryScreen} />
  </Stack.Navigator>
);

function BottomTabs({ showNotifications, unreadCount }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: '#1A202C' },
        headerTintColor: '#FFFFFF',
        headerRight: () => (
          <TouchableOpacity
            onPress={showNotifications}
            style={styles.bellButton}
          >
            <Ionicons name="notifications" size={22} color="#FFFFFF" />
            {unreadCount > 0 && (
              <View style={styles.bellBadge}>
                <Text style={styles.bellBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        ),
        tabBarStyle: { backgroundColor: '#FFFFFF', height: 65, paddingBottom: 8 },
        tabBarActiveTintColor: '#1A202C',
        tabBarInactiveTintColor: '#718096',
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Inicio') iconName = 'home';
          else if (route.name === 'Seguimiento') iconName = 'time';
          else if (route.name === 'Historial') iconName = 'stats-chart';
          else if (route.name === 'Perfil') iconName = 'person';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Inicio" component={HomeScreen} />
      <Tab.Screen name="Seguimiento" component={TimelineScreen} />
      <Tab.Screen name="Historial" component={HistoryScreen} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const SplashScreen = () => (
  <View style={styles.splash}>
    <ActivityIndicator size="large" color="#1A202C" />
  </View>
);

export default function AppNavigator() {
  const { isAuthenticated, isInitializing } = useAuth();
  const [notifVisible, setNotifVisible] = useState(false);
  const navigationRef = React.useRef(null);

  if (isInitializing) return <SplashScreen />;

  return (
    <NavigationContainer ref={navigationRef}>
      {isAuthenticated ? (
        <MainStackNavigator
          onBellPress={() => setNotifVisible(true)}
          onNotificationNavigate={(screen, params) => {
            setNotifVisible(false);
            navigationRef.current?.navigate(screen, params);
          }}
          notifVisible={notifVisible}
          onCloseNotif={() => setNotifVisible(false)}
        />
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
}

function MainStackNavigator({ onBellPress, onNotificationNavigate, notifVisible, onCloseNotif }) {
  const { unreadCount } = useAuth();

  return (
    <>
      <Stack.Navigator>
        <Stack.Screen
          name="MainTabs"
          options={{ headerShown: false }}
        >
          {() => <BottomTabs showNotifications={onBellPress} unreadCount={unreadCount} />}
        </Stack.Screen>
        <Stack.Screen
          name="TicketDetail"
          component={TicketDetailScreen}
          options={{
            title: 'Detalle del Ticket',
            headerStyle: { backgroundColor: '#1A202C' },
            headerTintColor: '#FFFFFF',
          }}
        />
        <Stack.Screen
          name="NewTicket"
          component={NewTicketScreen}
          options={{
            title: 'Nuevo Ticket',
            headerStyle: { backgroundColor: '#1A202C' },
            headerTintColor: '#FFFFFF',
          }}
        />
        <Stack.Screen
          name="UserManagement"
          component={UserManagementScreen}
          options={{
            title: 'Usuarios',
            headerStyle: { backgroundColor: '#1A202C' },
            headerTintColor: '#FFFFFF',
          }}
        />
        <Stack.Screen
          name="AdminReport"
          component={AdminReportScreen}
          options={{
            title: 'Reporte',
            headerStyle: { backgroundColor: '#1A202C' },
            headerTintColor: '#FFFFFF',
          }}
        />
      </Stack.Navigator>
      <NotificationPanel
        visible={notifVisible}
        onClose={onCloseNotif}
        onNavigate={onNotificationNavigate}
      />
    </>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F4F5F7' },
  bellButton: { marginRight: 12, position: 'relative' },
  bellBadge: {
    position: 'absolute', top: -4, right: -6,
    backgroundColor: '#E53E3E', borderRadius: 8,
    minWidth: 16, height: 16, justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 3,
  },
  bellBadgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
});