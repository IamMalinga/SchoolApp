// app/admin/role-management.jsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { db } from '../../scripts/firebaseConfig';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

export default function RoleManagementScreen() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      const userSnapshot = await getDocs(collection(db, 'users'));
      const usersData = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);
    };

    fetchUsers();
  }, []);

  const handleRoleUpdate = async () => {
    if (selectedUser && selectedRole) {
      try {
        const userRef = doc(db, 'users', selectedUser);
        await updateDoc(userRef, { role: selectedRole });
        alert('Role updated successfully!');
      } catch (error) {
        console.error('Error updating user role:', error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Role Management</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.userItem}>
            <Text>{item.name}</Text>
            <Picker
              selectedValue={selectedUser === item.id ? selectedRole : ''}
              onValueChange={(itemValue) => {
                setSelectedUser(item.id);
                setSelectedRole(itemValue);
              }}
            >
              <Picker.Item label="Select Role" value="" />
              <Picker.Item label="Student" value="student" />
              <Picker.Item label="Staff" value="staff" />
              <Picker.Item label="Admin" value="admin" />
            </Picker>
          </View>
        )}
      />
      <Button mode="contained" onPress={handleRoleUpdate}>
        Update Role
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  userItem: {
    marginBottom: 20,
  },
});
