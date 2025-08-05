import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Title, Button, FAB, Searchbar, Avatar } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

export default function ClientsScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  const clients = [
    {
      id: 1,
      name: 'Sarah & Mike Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+1 (555) 123-4567',
      address: '123 Wedding Ave, City, ST 12345',
      totalGigs: 1,
      totalSpent: '$1,200',
      lastGig: 'Aug 8, 2025',
      avatar: 'S',
    },
    {
      id: 2,
      name: 'Tech Innovations Inc.',
      email: 'events@techinnovations.com',
      phone: '+1 (555) 987-6543',
      address: '456 Corporate Blvd, City, ST 12345',
      totalGigs: 3,
      totalSpent: '$2,400',
      lastGig: 'Aug 12, 2025',
      avatar: 'T',
    },
    {
      id: 3,
      name: 'Jessica Miller',
      email: 'jmiller@email.com',
      phone: '+1 (555) 456-7890',
      address: '789 Residential St, City, ST 12345',
      totalGigs: 2,
      totalSpent: '$1,200',
      lastGig: 'Aug 15, 2025',
      avatar: 'J',
    },
    {
      id: 4,
      name: 'Downtown Music Hall',
      email: 'bookings@musichall.com',
      phone: '+1 (555) 321-0987',
      address: '321 Music Row, City, ST 12345',
      totalGigs: 5,
      totalSpent: '$4,000',
      lastGig: 'Jul 28, 2025',
      avatar: 'D',
    },
  ];

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Clients</Text>
        <Text style={styles.subtitle}>Manage your client relationships</Text>
      </View>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search clients..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Text style={styles.statNumber}>{clients.length}</Text>
              <Text style={styles.statLabel}>Total Clients</Text>
            </Card.Content>
          </Card>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Text style={styles.statNumber}>$8,800</Text>
              <Text style={styles.statLabel}>Total Revenue</Text>
            </Card.Content>
          </Card>
        </View>

        <View style={styles.clientsList}>
          {filteredClients.map((client) => (
            <Card key={client.id} style={styles.clientCard}>
              <Card.Content>
                <View style={styles.clientHeader}>
                  <View style={styles.clientInfo}>
                    <Avatar.Text 
                      size={48} 
                      label={client.avatar}
                      style={styles.avatar}
                    />
                    <View style={styles.clientDetails}>
                      <Text style={styles.clientName}>{client.name}</Text>
                      <Text style={styles.clientEmail}>{client.email}</Text>
                    </View>
                  </View>
                  <Button mode="outlined" compact>
                    Edit
                  </Button>
                </View>

                <View style={styles.contactInfo}>
                  <View style={styles.contactRow}>
                    <MaterialIcons name="phone" size={16} color="#64748b" />
                    <Text style={styles.contactText}>{client.phone}</Text>
                  </View>
                  <View style={styles.contactRow}>
                    <MaterialIcons name="location-on" size={16} color="#64748b" />
                    <Text style={styles.contactText}>{client.address}</Text>
                  </View>
                </View>

                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{client.totalGigs}</Text>
                    <Text style={styles.statText}>Gigs</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{client.totalSpent}</Text>
                    <Text style={styles.statText}>Total Spent</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{client.lastGig}</Text>
                    <Text style={styles.statText}>Last Gig</Text>
                  </View>
                </View>

                <View style={styles.actionButtons}>
                  <Button mode="text" compact icon="event">
                    Book Gig
                  </Button>
                  <Button mode="text" compact icon="receipt">
                    Create Invoice
                  </Button>
                  <Button mode="text" compact icon="message">
                    Contact
                  </Button>
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>
      </ScrollView>

      <FAB
        icon="person-add"
        label="Add Client"
        style={styles.fab}
        onPress={() => {/* Add new client */}}
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
  searchContainer: {
    padding: 16,
    backgroundColor: 'white',
  },
  searchbar: {
    backgroundColor: '#f8fafc',
  },
  statsRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7c3aed',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  clientsList: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  clientCard: {
    marginBottom: 12,
  },
  clientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    backgroundColor: '#7c3aed',
  },
  clientDetails: {
    marginLeft: 12,
    flex: 1,
  },
  clientName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  clientEmail: {
    fontSize: 14,
    color: '#64748b',
  },
  contactInfo: {
    marginBottom: 16,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactText: {
    marginLeft: 8,
    color: '#64748b',
    fontSize: 14,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  statText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#7c3aed',
  },
});