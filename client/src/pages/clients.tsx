import { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { User, Client } from '@shared/schema';
import { Sidebar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ClientCard } from '@/components/clients/client-card';
import { ClientForm } from '@/components/clients/client-form';
import { Plus, Search } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';

export default function ClientsPage() {
  const [location, navigate] = useLocation();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Check if we're in 'new' mode from the URL
  const isNewClient = location === '/clients/new';
  
  // Check if we're in 'edit' mode from the URL
  const editMatch = location.match(/^\/clients\/edit\/(\d+)$/);
  const editClientId = editMatch ? parseInt(editMatch[1]) : undefined;
  
  // Set dialog open state based on URL
  if (isNewClient && !isFormOpen) {
    setIsFormOpen(true);
    setSelectedClient(undefined);
  }
  
  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ['/api/auth/user'],
  });
  
  const { data: clients, isLoading: clientsLoading } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });
  
  // When we have client data and are in edit mode, find the selected client
  if (clients && editClientId && !selectedClient) {
    const client = clients.find(c => c.id === editClientId);
    if (client) {
      setSelectedClient(client);
      setIsFormOpen(true);
    }
  }
  
  const handleAddClient = () => {
    navigate('/clients/new');
  };
  
  const handleEditClient = (id: number) => {
    const client = clients?.find(c => c.id === id);
    if (client) {
      setSelectedClient(client);
      navigate(`/clients/edit/${id}`);
    }
  };
  
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedClient(undefined);
    navigate('/clients');
  };
  
  // Filter clients based on search term
  const filteredClients = clients
    ? clients.filter(client => 
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (client.phone && client.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (client.type && client.type.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : [];
  
  if (userLoading || !user) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar user={user} />
      
      <main id="main-content" className="flex-1 md:ml-64">
        <div className="p-4 md:p-6">
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold">Clients</h1>
              <p className="text-muted-foreground">Manage your promoters and clients</p>
            </div>
            <Button 
              className="mt-4 md:mt-0" 
              onClick={handleAddClient}
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Client
            </Button>
          </div>
          
          {/* Search Bar */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Clients Grid */}
          {clientsLoading ? (
            <div className="text-center py-8">Loading clients...</div>
          ) : filteredClients.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClients.map(client => (
                <ClientCard 
                  key={client.id} 
                  client={client} 
                  onEdit={handleEditClient}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm 
                ? 'No clients found matching your search.' 
                : 'No clients yet. Add your first client to get started.'}
            </div>
          )}
        </div>
      </main>
      
      {/* Client Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <ClientForm
            client={selectedClient}
            onSuccess={handleCloseForm}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
