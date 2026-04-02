import './src/backgroundLocation';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, ActivityIndicator, Alert, Platform } from 'react-native';
import { useAuthStore } from './src/stores/authStore';
import { supabase } from './src/lib/supabase';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ProductsScreen from './src/screens/ProductsScreen';
import CartScreen from './src/screens/CartScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import SubscriptionsScreen from './src/screens/SubscriptionsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import TrackingScreen from './src/screens/TrackingScreen';
import DriverMode from './src/screens/DriverMode';
import WalletScreen from './src/screens/WalletScreen';
import SubscribePaymentScreen from './src/screens/SubscribePaymentScreen';

const Stack = createNativeStackNavigator();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const { isAuthenticated, checkSession } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      await checkSession();
      setIsInitializing(false);
    };
    initAuth();

    // Push Notifications Setup
    registerForPushNotificationsAsync();

    const subscription = Notifications.addNotificationReceivedListener((notification: Notifications.Notification) => {
      console.log('Notification Received:', notification);
    });

    const responseSubscription = Notifications.addNotificationResponseReceivedListener((response: Notifications.NotificationResponse) => {
      const data = response.notification.request.content.data;
      const orderId = data?.orderId;
      if (orderId) {
        // Deep link to tracking/orders if needed
        console.log('Notification Tapped, Order ID:', orderId);
      }
    });

    return () => {
      subscription.remove();
      responseSubscription.remove();
    };
  }, [checkSession]);

  async function registerForPushNotificationsAsync() {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }
      
      try {
        const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        if (!projectId) {
            console.log('Project ID not found in expo config');
            return;
        }
        const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        console.log('Push Token:', token);
        
        // Save token to Supabase profile
        if (isAuthenticated && useAuthStore.getState().customer?.id) {
            await supabase
                .from('customers')
                .update({ push_token: token })
                .eq('id', useAuthStore.getState().customer?.id);
        }
      } catch (e) {
        console.log('Error getting push token:', e);
      }
    }
  }

  if (isInitializing) {
    return (
      <View className="flex-1 justify-center items-center bg-[#fdfdfd]">
        <ActivityIndicator size="large" color="#1B4D3E" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="Products" component={ProductsScreen} />
            <Stack.Screen name="Cart" component={CartScreen} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} />
            <Stack.Screen name="Subscriptions" component={SubscriptionsScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Orders" component={OrdersScreen} />
            <Stack.Screen name="Tracking" component={TrackingScreen} />
            <Stack.Screen name="Driver" component={DriverMode} />
            <Stack.Screen name="Wallet" component={WalletScreen} />
            <Stack.Screen name="SubscribePayment" component={SubscribePaymentScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
