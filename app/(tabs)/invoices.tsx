import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Title, Button, FAB, Chip, Searchbar } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

export default function InvoicesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const invoices = [
    {
      id: 1,
      invoiceNumber: 'INV-001',
      client: 'Sarah & Mike Johnson',
      gig: 'Wedding Reception',
      amount: '$1,200',
      issuedDate: 'Aug 1, 2025',
      dueDate: 'Aug 15, 2025',
      status: 'sent',
    },
    {
      id: 2,
      invoiceNumber: 'INV-002',
      client: 'Tech Innovations Inc.',
      gig: 'Corporate Event',
      amount: '$800',
      issuedDate: 'Jul 28, 2025',
      dueDate: 'Aug 12, 2025',
      status: 'paid',
    },
    {
      id: 3,
      invoiceNumber: 'INV-003',
      client: 'Jessica Miller',
      gig: 'Birthday Party',
      amount: '$600',
      issuedDate: 'Aug 3, 2025',
      dueDate: 'Aug 17, 2025',
      status: 'draft',
    },
    {
      id: 4,
      invoiceNumber: 'INV-004',
      client: 'Downtown Music Hall',
      gig: 'Live Performance',
      amount: '$1,000',
      issuedDate: 'Jul 15, 2025',
      dueDate: 'Jul 30, 2025',
      status: 'overdue',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return '#059669';
      case 'sent': return '#2563eb';
      case 'overdue': return '#dc2626';
      case 'draft': return '#64748b';
      default: return '#64748b';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return 'check-circle';
      case 'sent': return 'send';
      case 'overdue': return 'warning';
      case 'draft': return 'edit';
      default: return 'help';
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         invoice.gig.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || invoice.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: invoices.length,
    paid: invoices.filter(i => i.status === 'paid').length,
    pending: invoices.filter(i => i.status === 'sent').length,
    overdue: invoices.filter(i => i.status === 'overdue').length,
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Invoices</Text>
        <Text style={styles.subtitle}>Track payments and billing</Text>
      </View>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search invoices..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Text style={styles.statNumber}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </Card.Content>
          </Card>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Text style={[styles.statNumber, { color: '#059669' }]}>{stats.paid}</Text>
              <Text style={styles.statLabel}>Paid</Text>
            </Card.Content>
          </Card>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Text style={[styles.statNumber, { color: '#2563eb' }]}>{stats.pending}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </Card.Content>
          </Card>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Text style={[styles.statNumber, { color: '#dc2626' }]}>{stats.overdue}</Text>
              <Text style={styles.statLabel}>Overdue</Text>
            </Card.Content>
          </Card>
        </View>

        {/* Filter Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
        >
          {['all', 'draft', 'sent', 'paid', 'overdue'].map((status) => (
            <Chip
              key={status}
              mode={filterStatus === status ? 'flat' : 'outlined'}
              selected={filterStatus === status}
              onPress={() => setFilterStatus(status)}
              style={styles.filterChip}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Chip>
          ))}
        </ScrollView>

        {/* Invoices List */}
        <View style={styles.invoicesList}>
          {filteredInvoices.map((invoice) => (
            <Card key={invoice.id} style={styles.invoiceCard}>
              <Card.Content>
                <View style={styles.invoiceHeader}>
                  <View style={styles.invoiceInfo}>
                    <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
                    <Text style={styles.clientName}>{invoice.client}</Text>
                  </View>
                  <View style={styles.statusContainer}>
                    <Chip 
                      mode="flat"
                      icon={getStatusIcon(invoice.status)}
                      textStyle={{ color: getStatusColor(invoice.status) }}
                      style={{ backgroundColor: `${getStatusColor(invoice.status)}10` }}
                    >
                      {invoice.status.toUpperCase()}
                    </Chip>
                  </View>
                </View>

                <Text style={styles.gigTitle}>{invoice.gig}</Text>

                <View style={styles.invoiceDetails}>
                  <View style={styles.detailRow}>
                    <MaterialIcons name="calendar-today" size={16} color="#64748b" />
                    <Text style={styles.detailText}>
                      Issued: {invoice.issuedDate}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <MaterialIcons name="schedule" size={16} color="#64748b" />
                    <Text style={styles.detailText}>
                      Due: {invoice.dueDate}
                    </Text>
                  </View>
                </View>

                <View style={styles.invoiceFooter}>
                  <Text style={styles.amount}>{invoice.amount}</Text>
                  <View style={styles.actionButtons}>
                    <Button mode="text" compact>View</Button>
                    {invoice.status === 'draft' && (
                      <Button mode="text" compact>Send</Button>
                    )}
                    {invoice.status === 'sent' && (
                      <Button mode="text" compact>Remind</Button>
                    )}
                    <Button mode="text" compact>Edit</Button>
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>
      </ScrollView>

      <FAB
        icon="receipt"
        label="New Invoice"
        style={styles.fab}
        onPress={() => {/* Create new invoice */}}
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
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7c3aed',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  filterChip: {
    marginRight: 8,
  },
  invoicesList: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  invoiceCard: {
    marginBottom: 12,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  invoiceInfo: {
    flex: 1,
  },
  invoiceNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  clientName: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  statusContainer: {
    marginLeft: 12,
  },
  gigTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#475569',
    marginBottom: 12,
  },
  invoiceDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    marginLeft: 8,
    color: '#64748b',
    fontSize: 14,
  },
  invoiceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  amount: {
    fontSize: 20,
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