// app/(tabs)/dashboard.tsx
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { auth, getUserRole } from '../../scripts/firebaseConfig';

export default function Dashboard() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('');

  useEffect(() => {
    const fetchUserRole = async () => {
      if (auth.currentUser) {
        const userRole = await getUserRole(auth.currentUser.uid);
        setRole(userRole);
        navigateToDashboard(userRole);
      }
      setLoading(false);
    };

    const navigateToDashboard = (role) => {
      if (role === 'admin') {
        navigation.navigate('admin/dashboard');
      } else if (role === 'staff') {
        navigation.navigate('staff/dashboard');
      } else {
        navigation.navigate('student/dashboard');
      }
    };

    fetchUserRole();
  }, [navigation]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
