import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TextInput } from 'react-native';
import { Text, Card, Title, Paragraph, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { db } from '../../scripts/firebaseConfig';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import Loading from '../Loading'; // Import Loading component

export default function AdminDashboardScreen() {
  const [motivations, setMotivations] = useState([]);
  const [newMotivation, setNewMotivation] = useState('');
  const [loading, setLoading] = useState(true); // Add loading state
  const navigation = useNavigation();

  useEffect(() => {
    const fetchMotivations = async () => {
      const motivationSnapshot = await getDocs(collection(db, 'motivations'));
      const motivationsData = motivationSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMotivations(motivationsData);
      setLoading(false); // Set loading to false once done
    };

    fetchMotivations();
  }, []);

  const handleUpdateMotivation = async (docId: string) => {
    try {
      await updateDoc(doc(db, 'motivations', docId), {
        motivation: newMotivation,
      });
      setNewMotivation('');
      // Refresh motivations
      const motivationSnapshot = await getDocs(collection(db, 'motivations'));
      const motivationsData = motivationSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMotivations(motivationsData);
    } catch (error) {
      console.error('Error updating motivation:', error);
    }
  };

  const handleDeleteMotivation = async (docId: string) => {
    try {
      await deleteDoc(doc(db, 'motivations', docId));
      setMotivations((prev) => prev.filter((motivation) => motivation.id !== docId));
    } catch (error) {
      console.error('Error deleting motivation:', error);
    }
  };

  if (loading) {
    return <Loading />; // Show loading indicator while loading
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Admin Dashboard</Text>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('admin/role-management')}
      >
        Manage Roles
      </Button>
      <FlatList
        data={motivations}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.motivationItem}>
                <View style={styles.motivationContent}>
                  <Title style={styles.title}>{item.userId}</Title>
                  <Paragraph style={styles.paragraph}>{item.motivation}</Paragraph>
                  <TextInput
                    style={styles.input}
                    placeholder="Update Motivation"
                    value={newMotivation}
                    onChangeText={setNewMotivation}
                  />
                  <Button mode="contained" onPress={() => handleUpdateMotivation(item.id)} style={styles.button}>
                    Update
                  </Button>
                  <Button mode="outlined" onPress={() => handleDeleteMotivation(item.id)} style={styles.button}>
                    Delete
                  </Button>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
    backgroundColor: '#fff',
  },
  button: {
    borderRadius: 5,
    marginTop: 10,
  },
});
