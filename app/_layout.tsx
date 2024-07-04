// app/_layout.tsx
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, getUserRole } from '../scripts/firebaseConfig';

import useColorScheme from '../hooks/useColorScheme';
import Loading from '../components/Loading';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [initialRoute, setInitialRoute] = useState('auth/login');
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const role = await getUserRole(user.uid);
        if (role === 'admin') {
          setInitialRoute('admin/dashboard');
        } else if (role === 'staff') {
          setInitialRoute('staff/dashboard');
        } else {
          setInitialRoute('student/dashboard');
        }
      } else {
        setInitialRoute('auth/login');
      }
      setLoading(false); // Set loading to false once done
    });

    if (loaded) {
      SplashScreen.hideAsync();
    }

    return () => unsubscribe();
  }, [loaded]);

  if (!loaded || loading) {
    return <Loading />; // Show loading indicator while loading
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack initialRouteName={initialRoute}>
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen name="auth/register" options={{ headerShown: false }} />
        <Stack.Screen name="admin/dashboard" options={{ headerShown: false }} />
        <Stack.Screen name="staff/dashboard" options={{ headerShown: false }} />
        <Stack.Screen name="student/dashboard" options={{ headerShown: false }} />
        <Stack.Screen name="admin/role-management" options={{ title: 'Role Management' }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}
