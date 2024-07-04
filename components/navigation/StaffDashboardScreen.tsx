import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, FlatList } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { db, updateUserRole } from '../../scripts/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

const RoleManagementScreen = () => {
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
        await updateUserRole(selectedUser, selectedRole);
        alert('Role updated successfully!');
      } catch (error) {
        console.error('Error updating role:', error);
        alert('Error updating role, please try again.');
      }
    } else {
      alert('Please select a user and a role to update.');
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
      <Button mode="contained" onPress={handleRoleUpdate} style={styles.button}>
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
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    marginTop: 20,
  },
});

export default RoleManagementScreen;
