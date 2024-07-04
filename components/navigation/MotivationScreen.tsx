import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Button, Card, Title, Paragraph, Text } from 'react-native-paper';
import { db, auth } from '../../scripts/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import MotivationIcon from '../../assets/motivation.svg';

export default function MotivationScreen() {
  const [motivation, setMotivation] = useState('');
  const [loading, setLoading] = useState(false);

  const submitMotivation = async () => {
    Alert.alert(
      "Confirm Submission",
      "Are you sure you want to submit your motivation?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Submit",
          onPress: async () => {
            setLoading(true);
            try {
              await addDoc(collection(db, 'motivations'), {
                motivation,
                userId: auth.currentUser?.uid,
              });
              setMotivation('');
            } catch (error) {
              console.error('Error submitting motivation:', error);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <MotivationIcon width={200} height={200} style={styles.icon} />
      <Card style={styles.card}>
        <Card.Content>
          <Title>Log Your Motivation</Title>
          <Paragraph>Enter your current motivation level below.</Paragraph>
          <TextInput
            style={styles.input}
            placeholder="Enter motivation level"
            value={motivation}
            onChangeText={setMotivation}
          />
          <Button mode="contained" onPress={submitMotivation} style={styles.button}>
            Submit
          </Button>
          {loading && <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />}
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center', // Center the content
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  icon: {
    marginBottom: 20,
  },
  card: {
    width: '100%', // Make the card take full width
    padding: 10,
    borderRadius: 10,
    elevation: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
  },
  button: {
    marginTop: 10,
  },
  loader: {
    marginTop: 10,
  },
});
