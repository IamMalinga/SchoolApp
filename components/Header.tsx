// components/Header.tsx
import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { auth, db } from '../scripts/firebaseConfig';
import { getDoc, doc } from 'firebase/firestore';

export default function Header() {
  const [profilePic, setProfilePic] = React.useState('');

  React.useEffect(() => {
    const fetchProfilePic = async () => {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser?.uid));
      if (userDoc.exists()) {
        setProfilePic(userDoc.data().profilePic);
      }
    };

    fetchProfilePic();
  }, []);

  return (
    <View style={styles.header}>
      {profilePic ? (
        <Image source={{ uri: profilePic }} style={styles.profilePic} />
      ) : (
        <View style={styles.placeholder} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 60,
    alignItems: 'flex-end',
    padding: 10,
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  placeholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ccc',
  },
});
