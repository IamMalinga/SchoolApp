import { db } from './firebaseConfig';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

const sampleData = [
  {
    userId: 'user_1',
    motivation: 'Feeling great!',
    timestamp: serverTimestamp(),
  },
  {
    userId: 'user_2',
    motivation: 'Motivated and ready to learn!',
    timestamp: serverTimestamp(),
  },
  {
    userId: 'user_3',
    motivation: 'A bit tired but pushing through.',
    timestamp: serverTimestamp(),
  },
  {
    userId: 'user_4',
    motivation: 'Excited for the day!',
    timestamp: serverTimestamp(),
  },
  {
    userId: 'user_5',
    motivation: 'Need more coffee.',
    timestamp: serverTimestamp(),
  },
];

async function addSampleData() {
  try {
    const motivationsCollection = collection(db, 'motivations');
    for (const data of sampleData) {
      await addDoc(motivationsCollection, data);
    }
    console.log('Sample data added successfully.');
  } catch (error) {
    console.error('Error adding sample data:', error);
  }
}

addSampleData();
