import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

type UserProps = {
  name: string;
  profilePic?: string;
};

const UserListItem: React.FC<UserProps> = ({ name, profilePic }) => {
  const initial = name.charAt(0).toUpperCase();
  return (
    <View style={styles.container}>
      {profilePic ? (
        <Image source={{ uri: profilePic }} style={styles.profilePic} />
      ) : (
        <View style={styles.initialContainer}>
          <Text style={styles.initial}>{initial}</Text>
        </View>
      )}
      <Text style={styles.name}>{name}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  initialContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0a7ea4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  initial: {
    color: '#fff',
    fontSize: 18,
  },
  name: {
    fontSize: 16,
  },
});

export default UserListItem;
