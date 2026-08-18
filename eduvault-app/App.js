import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SecureStore from 'expo-secure-store';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { ActivityIndicator, View, StatusBar } from 'react-native';
import colors from './src/theme/colors';

import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import MyDataScreen from './src/screens/MyDataScreen';
import EditDataScreen from './src/screens/EditDataScreen';
import AdminHomeScreen from './src/screens/AdminHomeScreen';
import AdminListScreen from './src/screens/AdminListScreen';
import AdminDetailScreen from './src/screens/AdminDetailScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);

  let [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await SecureStore.getItemAsync('jwt_token');
        const role = await SecureStore.getItemAsync('user_role');

        if (token && role) {
          if (role === 'ADMIN') {
            setInitialRoute('AdminHome');
          } else {
            setInitialRoute('StudentHome');
          }
        } else {
          setInitialRoute('Login');
        }
      } catch (e) {
        setInitialRoute('Login');
      }
    };
    checkAuth();
  }, []);

  if (!fontsLoaded || !initialRoute) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{ headerShown: false }}
        >
          {/* Auth */}
          <Stack.Screen name="Login" component={LoginScreen} />

          {/* Fluxo Student */}
          <Stack.Screen name="StudentHome" component={HomeScreen} />
          <Stack.Screen name="MyData" component={MyDataScreen} />
          <Stack.Screen name="EditData" component={EditDataScreen} />

          {/* Fluxo Admin */}
          <Stack.Screen name="AdminHome" component={AdminHomeScreen} />
          <Stack.Screen name="AdminList" component={AdminListScreen} />
          <Stack.Screen name="AdminDetail" component={AdminDetailScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
