import React, { useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { auth, db, storage } from '../../scripts/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import RegisterIcon from '../../assets/register.svg';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [error, setError] = useState('');
  const navigation = useNavigation();

  const pickImage = async () => {
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

    if (!result.canceled) {
      console.log('Selected image URI:', result.assets[0].uri); // Debug log
      setProfilePic(result.assets[0].uri);
    } else {
      console.log('Image picker cancelled'); // Debug log for cancellation
    }
  };

  const register = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      let profilePicURL = '';

      if (profilePic) {
        const storageRef = ref(storage, `profilePics/${user.uid}`);
        const response = await fetch(profilePic);
        const blob = await response.blob();
        await uploadBytes(storageRef, blob);
        profilePicURL = await getDownloadURL(storageRef);
        console.log('Uploaded profile picture URL:', profilePicURL); // Debug log
      }

      await setDoc(doc(db, 'users', user.uid), {
        name,
        grade,
        email,
        profilePic: profilePicURL,
        role: 'student' // Default role
      });

      navigation.navigate('auth/login');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Register</Text>
      <RegisterIcon width={200} height={200} style={styles.icon} />
      <TextInput
        label="Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
        mode="outlined"
      />
      <TextInput
        label="Grade"
        value={grade}
        onChangeText={setGrade}
        style={styles.input}
        mode="outlined"
      />
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        mode="outlined"
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        mode="outlined"
      />
      <Button onPress={pickImage}>Pick Profile Picture</Button>
      {profilePic ? (
        <Image source={{ uri: profilePic }} style={styles.previewPic} />
      ) : null}
      <Button mode="contained" onPress={register} style={styles.button}>
        Register
      </Button>
      {error ? <Text style={styles.error}>{error}</Text> : null}
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
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    marginBottom: 10,
  },
  previewPic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginVertical: 10,
  },
  button: {
    marginTop: 10,
    width: '100%',
  },
  error: {
    marginTop: 10,
    color: 'red',
  },
});
