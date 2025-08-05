import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Title, Button, Avatar, TextInput, Switch } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [businessName, setBusinessName] = useState(user?.businessName || '');
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            await logout();
          }
        },
      ]
    );
  };

  const handleImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to upload your logo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      // Handle image upload logic here
      console.log('Selected image:', result.assets[0].uri);
    }
  };

  const handleSave = () => {
    // Save profile changes logic here
    setIsEditing(false);
    Alert.alert('Success', 'Profile updated successfully!');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Manage your account settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Info */}
        <Card style={styles.section}>
          <Card.Content>
            <View style={styles.profileHeader}>
              <Avatar.Text 
                size={80} 
                label={user?.name?.charAt(0) || 'U'}
                style={styles.avatar}
              />
              <Button 
                mode="outlined" 
                icon="camera"
                onPress={handleImagePicker}
                style={styles.changePhotoButton}
              >
                Change Photo
              </Button>
            </View>

            {isEditing ? (
              <View style={styles.editForm}>
                <TextInput
                  label="Full Name"
                  value={name}
                  onChangeText={setName}
                  mode="outlined"
                  style={styles.input}
                />
                <TextInput
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  mode="outlined"
                  style={styles.input}
                  keyboardType="email-address"
                />
                <TextInput
                  label="Business Name"
                  value={businessName}
                  onChangeText={setBusinessName}
                  mode="outlined"
                  style={styles.input}
                />
                <View style={styles.editActions}>
                  <Button 
                    mode="outlined" 
                    onPress={() => setIsEditing(false)}
                    style={styles.cancelButton}
                  >
                    Cancel
                  </Button>
                  <Button 
                    mode="contained" 
                    onPress={handleSave}
                    style={styles.saveButton}
                  >
                    Save Changes
                  </Button>
                </View>
              </View>
            ) : (
              <View style={styles.profileInfo}>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Full Name</Text>
                  <Text style={styles.value}>{user?.name}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Email</Text>
                  <Text style={styles.value}>{user?.email}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Business Name</Text>
                  <Text style={styles.value}>{user?.businessName || 'Not set'}</Text>
                </View>
                <Button 
                  mode="outlined" 
                  icon="edit"
                  onPress={() => setIsEditing(true)}
                  style={styles.editButton}
                >
                  Edit Profile
                </Button>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Statistics */}
        <Card style={styles.section}>
          <Card.Content>
            <Title>Your Statistics</Title>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>12</Text>
                <Text style={styles.statLabel}>Gigs This Month</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>$8,450</Text>
                <Text style={styles.statLabel}>Total Earnings</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>28</Text>
                <Text style={styles.statLabel}>Active Clients</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>95%</Text>
                <Text style={styles.statLabel}>On-Time Rate</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Settings */}
        <Card style={styles.section}>
          <Card.Content>
            <Title>Settings</Title>
            
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Push Notifications</Text>
                <Text style={styles.settingDesc}>Get notified about upcoming gigs</Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Dark Mode</Text>
                <Text style={styles.settingDesc}>Switch to dark theme</Text>
              </View>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <Card style={styles.section}>
          <Card.Content>
            <Title>Quick Actions</Title>
            
            <Button
              mode="outlined"
              icon="share"
              style={styles.actionButton}
              onPress={() => {/* Share profile */}}
            >
              Share Profile
            </Button>
            
            <Button
              mode="outlined"
              icon="backup"
              style={styles.actionButton}
              onPress={() => {/* Export data */}}
            >
              Export Data
            </Button>
            
            <Button
              mode="outlined"
              icon="help"
              style={styles.actionButton}
              onPress={() => {/* Show help */}}
            >
              Help & Support
            </Button>
            
            <Button
              mode="outlined"
              icon="logout"
              style={[styles.actionButton, styles.logoutButton]}
              textColor="#dc2626"
              onPress={handleLogout}
            >
              Sign Out
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 4,
  },
  section: {
    margin: 16,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    backgroundColor: '#7c3aed',
    marginBottom: 16,
  },
  changePhotoButton: {
    borderColor: '#7c3aed',
  },
  profileInfo: {
    marginTop: 16,
  },
  infoRow: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#0f172a',
    fontWeight: '500',
  },
  editButton: {
    marginTop: 16,
    borderColor: '#7c3aed',
  },
  editForm: {
    marginTop: 16,
  },
  input: {
    marginBottom: 16,
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#7c3aed',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    gap: 16,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7c3aed',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0f172a',
  },
  settingDesc: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  actionButton: {
    marginBottom: 12,
    borderColor: '#7c3aed',
  },
  logoutButton: {
    borderColor: '#dc2626',
    marginTop: 8,
  },
});