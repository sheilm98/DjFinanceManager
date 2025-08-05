import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Title, Paragraph, Button, FAB } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { router } from 'expo-router';

export default function DashboardScreen() {
  const { user } = useAuth();

  const stats = [
    { title: 'This Month\'s Gigs', value: '12', icon: 'event', color: '#7c3aed' },
    { title: 'Total Earnings', value: '$8,450', icon: 'attach-money', color: '#059669' },
    { title: 'Pending Invoices', value: '3', icon: 'receipt', color: '#dc2626' },
    { title: 'Active Clients', value: '28', icon: 'people', color: '#2563eb' },
  ];

  const upcomingGigs = [
    { id: 1, title: 'Wedding Reception', date: 'Aug 8', location: 'Grand Hotel', fee: '$1,200' },
    { id: 2, title: 'Corporate Event', date: 'Aug 12', location: 'Convention Center', fee: '$800' },
    { id: 3, title: 'Birthday Party', date: 'Aug 15', location: 'Private Residence', fee: '$600' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back, {user?.name}!</Text>
        <Text style={styles.subgreeting}>Here's your gig overview</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <Card key={index} style={[styles.statCard, { borderLeftColor: stat.color }]}>
              <Card.Content style={styles.statContent}>
                <View style={styles.statHeader}>
                  <MaterialIcons name={stat.icon} size={24} color={stat.color} />
                  <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                </View>
                <Text style={styles.statTitle}>{stat.title}</Text>
              </Card.Content>
            </Card>
          ))}
        </View>

        {/* Upcoming Gigs */}
        <Card style={styles.section}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Title>Upcoming Gigs</Title>
              <Button mode="text" onPress={() => router.push('/(tabs)/calendar')}>
                View All
              </Button>
            </View>
            
            {upcomingGigs.map((gig) => (
              <View key={gig.id} style={styles.gigItem}>
                <View style={styles.gigInfo}>
                  <Text style={styles.gigTitle}>{gig.title}</Text>
                  <Text style={styles.gigDetails}>{gig.date} • {gig.location}</Text>
                </View>
                <Text style={styles.gigFee}>{gig.fee}</Text>
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <Card style={styles.section}>
          <Card.Content>
            <Title>Quick Actions</Title>
            <View style={styles.actionsGrid}>
              <Button
                mode="outlined"
                icon="add"
                style={styles.actionButton}
                onPress={() => {/* Navigate to add gig */}}
              >
                Add Gig
              </Button>
              <Button
                mode="outlined"
                icon="receipt"
                style={styles.actionButton}
                onPress={() => router.push('/(tabs)/invoices')}
              >
                Create Invoice
              </Button>
              <Button
                mode="outlined"
                icon="person-add"
                style={styles.actionButton}
                onPress={() => router.push('/(tabs)/clients')}
              >
                Add Client
              </Button>
              <Button
                mode="outlined"
                icon="analytics"
                style={styles.actionButton}
                onPress={() => {/* Navigate to analytics */}}
              >
                View Reports
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => {/* Quick add menu */}}
      />
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
    backgroundColor: '#7c3aed',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  subgreeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    borderLeftWidth: 4,
  },
  statContent: {
    paddingVertical: 12,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statTitle: {
    fontSize: 12,
    color: '#64748b',
  },
  section: {
    margin: 16,
    marginTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  gigItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  gigInfo: {
    flex: 1,
  },
  gigTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  gigDetails: {
    fontSize: 14,
    color: '#64748b',
  },
  gigFee: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#7c3aed',
  },
});