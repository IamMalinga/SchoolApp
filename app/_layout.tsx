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
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';

SplashScreen.preventAutoHideAsync();

const AnimatedSplashScreen = () => {
  const [fadeAnim] = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start(() => {
      SplashScreen.hideAsync();
    });
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.title, { opacity: fadeAnim }]}>
        SchoolApp
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 32,
    fontFamily: 'Playwrite-USA-Modern',
  },
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    'Playwrite-USA-Modern': require('../assets/fonts/PlaywriteUSModern-VariableFont_wght.ttf'),
  });
  const [initialRoute, setInitialRoute] = useState('auth/login');
  const [loading, setLoading] = useState(true);

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
      setLoading(false);
    });

    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }

    return () => unsubscribe();
  }, [fontsLoaded]);

  if (!fontsLoaded || loading) {
    return <Loading />;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack initialRouteName={initialRoute}>
        <Stack.Screen name="home/main" options={{ title: 'Home' }} />
        <Stack.Screen name="auth/login" options={{ headerShown: true }} />
        <Stack.Screen name="auth/register" options={{ headerShown: true }} />
        <Stack.Screen name="admin/dashboard" options={{ headerShown: false }} />
        <Stack.Screen name="staff/dashboard" options={{ headerShown: false }} />
        <Stack.Screen name="student/dashboard" options={{ headerShown: false }} />
        <Stack.Screen name="admin/role-management" options={{ title: 'Role Management' }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}
