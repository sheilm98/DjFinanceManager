import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Title, Button, FAB, Chip } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const gigs = [
    {
      id: 1,
      title: 'Wedding Reception',
      date: 'Aug 8, 2025',
      time: '6:00 PM - 12:00 AM',
      location: 'Grand Hotel Ballroom',
      client: 'Sarah & Mike Johnson',
      fee: '$1,200',
      status: 'confirmed',
    },
    {
      id: 2,
      title: 'Corporate Event',
      date: 'Aug 12, 2025',
      time: '7:00 PM - 11:00 PM',
      location: 'Convention Center',
      client: 'Tech Innovations Inc.',
      fee: '$800',
      status: 'pending',
    },
    {
      id: 3,
      title: 'Birthday Party',
      date: 'Aug 15, 2025',
      time: '2:00 PM - 6:00 PM',
      location: 'Private Residence',
      client: 'Jessica Miller',
      fee: '$600',
      status: 'confirmed',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#059669';
      case 'pending': return '#d97706';
      case 'cancelled': return '#dc2626';
      default: return '#64748b';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Calendar</Text>
        <Text style={styles.subtitle}>Manage your gigs and schedule</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Month View Placeholder */}
        <Card style={styles.section}>
          <Card.Content>
            <Title>August 2025</Title>
            <Text style={styles.calendarNote}>
              📅 Calendar view coming soon. Below are your scheduled gigs.
            </Text>
          </Card.Content>
        </Card>

        {/* Upcoming Gigs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Gigs</Text>
          {gigs.map((gig) => (
            <Card key={gig.id} style={styles.gigCard}>
              <Card.Content>
                <View style={styles.gigHeader}>
                  <Text style={styles.gigTitle}>{gig.title}</Text>
                  <Chip 
                    mode="outlined" 
                    textStyle={{ color: getStatusColor(gig.status) }}
                    style={{ borderColor: getStatusColor(gig.status) }}
                  >
                    {gig.status}
                  </Chip>
                </View>
                
                <View style={styles.gigDetail}>
                  <MaterialIcons name="schedule" size={16} color="#64748b" />
                  <Text style={styles.detailText}>{gig.date} • {gig.time}</Text>
                </View>
                
                <View style={styles.gigDetail}>
                  <MaterialIcons name="location-on" size={16} color="#64748b" />
                  <Text style={styles.detailText}>{gig.location}</Text>
                </View>
                
                <View style={styles.gigDetail}>
                  <MaterialIcons name="person" size={16} color="#64748b" />
                  <Text style={styles.detailText}>{gig.client}</Text>
                </View>
                
                <View style={styles.gigFooter}>
                  <Text style={styles.gigFee}>{gig.fee}</Text>
                  <View style={styles.actionButtons}>
                    <Button mode="text" compact>Edit</Button>
                    <Button mode="text" compact>Invoice</Button>
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>
      </ScrollView>

      <FAB
        icon="add"
        label="New Gig"
        style={styles.fab}
        onPress={() => {/* Add new gig */}}
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
  section: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  calendarNote: {
    textAlign: 'center',
    color: '#64748b',
    fontStyle: 'italic',
    marginTop: 16,
  },
  gigCard: {
    marginBottom: 12,
    marginHorizontal: 16,
  },
  gigHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  gigTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  gigDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    color: '#64748b',
  },
  gigFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  gigFee: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059669',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#7c3aed',
  },
});