import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { router } from 'expo-router';

export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Oops!</Text>
      <Text style={styles.message}>This screen doesn't exist.</Text>
      <Button 
        mode="contained" 
        onPress={() => router.replace('/')}
        style={styles.button}
      >
        Go to home screen
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 16,
  },
  message: {
    fontSize: 18,
    color: '#64748b',
    marginBottom: 32,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#7c3aed',
  },
});