import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { Button, Text, Card } from 'react-native-paper';
import { auth, db } from '../../scripts/firebaseConfig';
import { signOut } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import HomeIcon from '../../assets/home.svg';

export default function HomeScreen() {
  const navigation = useNavigation();
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserDetails(userDoc.data());
          }
        } catch (error) {
          console.error('Error fetching user details:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setUserDetails(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth(); // Cleanup function for unsubscribing from the listener
  }, []);

  const logout = async () => {
    await signOut(auth);
    navigation.navigate('auth/login');
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {userDetails?.profilePic ? (
        <Image source={{ uri: userDetails.profilePic }} style={styles.profilePic} />
      ) : (
        <HomeIcon width={300} height={300} style={styles.icon} />
      )}
      <Text style={styles.header}>
        Hello {userDetails?.name || 'User'}, welcome to the School App!
      </Text>
      <Card style={styles.card}>
        <Card.Content>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('motivation')}
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            Log Motivation
          </Button>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('dashboard')}
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            View Dashboard
          </Button>
          <Button
            mode="outlined"
            onPress={logout}
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            Logout
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  icon: {
    marginBottom: 20,
  },
  profilePic: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 4,
  },
  button: {
    marginTop: 10,
    width: '100%',
  },
  buttonContent: {
    height: 50,
  },
  buttonLabel: {
    fontSize: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
