import { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { User } from '@shared/schema';
import { Sidebar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { InvoiceTable } from '@/components/invoices/invoice-table';
import { InvoiceForm } from '@/components/invoices/invoice-form';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

export default function InvoicesPage() {
  const [location, navigate] = useLocation();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | undefined>(undefined);
  const [selectedGigId, setSelectedGigId] = useState<number | undefined>(undefined);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Parse URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const urlGigId = urlParams.get('gigId');
  
  // Check if we're in 'create' mode from the URL
  const isCreateMode = location === '/invoices/create' || location.startsWith('/invoices/create?');
  
  // Check if we're in 'edit' mode from the URL
  const editMatch = location.match(/^\/invoices\/edit\/(\d+)$/);
  const editInvoiceId = editMatch ? parseInt(editMatch[1]) : undefined;
  
  // Set form state based on URL
  if (isCreateMode && !isFormOpen) {
    setIsFormOpen(true);
    if (urlGigId) {
      setSelectedGigId(parseInt(urlGigId));
    }
  } else if (editInvoiceId && !isFormOpen) {
    setIsFormOpen(true);
    setSelectedInvoiceId(editInvoiceId);
  }
  
  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ['/api/auth/user'],
  });
  
  const handleCreateInvoice = () => {
    navigate('/invoices/create');
  };
  
  const handleEditInvoice = (id: number) => {
    navigate(`/invoices/edit/${id}`);
  };
  
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedInvoiceId(undefined);
    setSelectedGigId(undefined);
    navigate('/invoices');
    
    // Refresh invoice data
    queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
    
    toast({
      title: "Success",
      description: selectedInvoiceId ? "Invoice updated successfully" : "Invoice created successfully",
    });
  };
  
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
              <h1 className="text-2xl font-bold">Invoices</h1>
              <p className="text-muted-foreground">Manage and track your payments</p>
            </div>
            <Button 
              className="mt-4 md:mt-0" 
              onClick={handleCreateInvoice}
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Invoice
            </Button>
          </div>
          
          <InvoiceTable />
        </div>
      </main>
      
      {/* Invoice Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[800px] lg:max-w-[1000px]">
          <InvoiceForm
            invoiceId={selectedInvoiceId}
            gigId={selectedGigId}
            onSuccess={handleCloseForm}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
