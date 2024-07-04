import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, Title, Paragraph, FAB } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { db } from '../../scripts/firebaseConfig';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

export default function StaffDashboardScreen() {
  const navigation = useNavigation();
  const [motivations, setMotivations] = useState([]);

  useEffect(() => {
    const fetchMotivationsAndUsers = async () => {
      const motivationSnapshot = await getDocs(collection(db, 'motivations'));
      const motivationsData = motivationSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Fetch user details
      const userDetails = {};
      for (const motivation of motivationsData) {
        if (!userDetails[motivation.userId]) {
          const userDoc = await getDoc(doc(db, 'users', motivation.userId));
          if (userDoc.exists()) {
            userDetails[motivation.userId] = userDoc.data().name;
          }
        }
      }

      // Map user names to motivations
      const motivationsWithUserNames = motivationsData.map(motivation => ({
        ...motivation,
        userName: userDetails[motivation.userId]
      }));

      setMotivations(motivationsWithUserNames);
    };

    fetchMotivationsAndUsers();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Staff Dashboard</Text>
      <FlatList
        data={motivations.sort((a, b) => b.timestamp - a.timestamp)}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.motivationItem}>
                <View style={styles.motivationContent}>
                  <Title style={styles.title}>{item.userName}</Title>
                  <Paragraph style={styles.paragraph}>{item.motivation}</Paragraph>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}
      />
      <FAB
        style={styles.fab}
        small
        icon="home"
        onPress={() => navigation.navigate('index')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 50,
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  card: {
    marginVertical: 10,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
    elevation: 5,
    backgroundColor: '#fff',
  },
  motivationItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  motivationContent: {
    flex: 1,
    paddingLeft: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  paragraph: {
    fontSize: 14,
    color: '#666',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ea',
  },
});
