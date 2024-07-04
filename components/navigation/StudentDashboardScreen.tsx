import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TextInput, ActivityIndicator, RefreshControl, Image, Platform } from 'react-native';
import { Text, Card, Title, Paragraph, Button, FAB } from 'react-native-paper';
import { db, auth, storage } from '../../scripts/firebaseConfig';
import { collection, getDocs, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';

export default function StudentDashboardScreen() {
  const navigation = useNavigation();
  const [motivations, setMotivations] = useState([]);
  const [newMotivation, setNewMotivation] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userDetails, setUserDetails] = useState({});
  const [newName, setNewName] = useState('');
  const [newGrade, setNewGrade] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [newProfilePic, setNewProfilePic] = useState('');

  const fetchMotivations = async () => {
    try {
      const motivationSnapshot = await getDocs(collection(db, 'motivations'));
      const motivationsData = motivationSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMotivations(motivationsData.filter(motivation => motivation.userId === auth.currentUser.uid));
    } catch (error) {
      console.error('Error fetching motivations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchUserDetails = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserDetails(userData);
        setNewName(userData.name || '');
        setNewGrade(userData.grade || '');
        setProfilePic(userData.profilePic || '');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  useEffect(() => {
    fetchMotivations();
    fetchUserDetails();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMotivations();
  };

  const handleUpdateMotivation = async (docId: string) => {
    try {
      await updateDoc(doc(db, 'motivations', docId), {
        motivation: newMotivation,
      });
      setNewMotivation('');
      fetchMotivations(); // Refresh motivations
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

  const handleUpdateProfile = async () => {
    try {
      let profilePicURL = profilePic;
      if (newProfilePic) {
        const storageRef = ref(storage, `profilePics/${auth.currentUser.uid}`);
        const response = await fetch(newProfilePic);
        const blob = await response.blob();
        await uploadBytes(storageRef, blob);
        profilePicURL = await getDownloadURL(storageRef);
        console.log('Uploaded profile picture URL:', profilePicURL); // Debug log
      }

      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        name: newName,
        grade: newGrade,
        profilePic: profilePicURL,
      });

      alert('Profile updated successfully!');
      fetchUserDetails();
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const pickImage = async () => {
    // Ask the user for the permission to access the media library
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.cancelled) {
      console.log('Selected image URI:', result.assets[0].uri); // Debug log
      setNewProfilePic(result.assets[0].uri);
    } else {
      console.log('Image picker cancelled'); // Debug log for cancellation
    }
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
      <View style={styles.headerContainer}>
        <Button icon="arrow-left" mode="text" onPress={() => navigation.goBack()}>
          Back
        </Button>
        <Text style={styles.header}>Student Dashboard</Text>
        {profilePic ? (
          <Image source={{ uri: profilePic }} style={styles.profilePic} />
        ) : (
          <View style={styles.initialContainer}>
            <Text style={styles.initial}>{userDetails.name ? userDetails.name[0] : 'U'}</Text>
          </View>
        )}
      </View>
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
      <View style={styles.profileContainer}>
        <Text style={styles.subHeader}>Update Profile</Text>
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={newName}
          onChangeText={setNewName}
        />
        <TextInput
          style={styles.input}
          placeholder="Grade"
          value={newGrade}
          onChangeText={setNewGrade}
        />
        <Button onPress={pickImage}>Pick Profile Picture</Button>
        {newProfilePic ? (
          <Image source={{ uri: newProfilePic }} style={styles.previewPic} />
        ) : null}
        <Button mode="contained" onPress={handleUpdateProfile} style={styles.button}>
          Update Profile
        </Button>
      </View>
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
    marginTop:50,
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  previewPic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginVertical: 10,
  },
  initialContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0a7ea4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initial: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
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
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileContainer: {
    marginTop: 20,
  },
  subHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ea',
  }
});
