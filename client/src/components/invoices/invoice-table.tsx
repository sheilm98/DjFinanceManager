import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Eye, Edit, Mail, MoreHorizontal, Download, Check } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { formatDate } from '@/lib/utils';
import { Invoice, InvoiceStatus } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

// Helper function to get badge variant based on invoice status
const getStatusBadge = (status: InvoiceStatus) => {
  switch (status) {
    case 'paid':
      return <Badge variant="success">Paid</Badge>;
    case 'overdue':
      return <Badge variant="destructive">Overdue</Badge>;
    case 'sent':
      return <Badge variant="secondary">Pending</Badge>;
    default:
      return <Badge variant="outline">Draft</Badge>;
  }
};

export function InvoiceTable() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('30');
  
  const { toast } = useToast();
  
  const { data: invoices, isLoading } = useQuery<Invoice[]>({
    queryKey: ['/api/invoices'],
  });
  
  // Filter invoices based on search term and filters
  const filteredInvoices = invoices
    ? invoices.filter((invoice) => {
        // Search filter
        const searchMatch = 
          searchTerm === '' || 
          invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Status filter
        const statusMatch = 
          statusFilter === 'all' || 
          invoice.status === statusFilter;
        
        // Date filter
        const dateMatch = dateFilter === 'all' || (() => {
          const date = new Date(invoice.issuedDate);
          const now = new Date();
          const diffDays = Math.ceil((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
          
          if (dateFilter === '30') return diffDays <= 30;
          if (dateFilter === '90') return diffDays <= 90;
          if (dateFilter === 'year') return date.getFullYear() === now.getFullYear();
          
          return true;
        })();
        
        return searchMatch && statusMatch && dateMatch;
      })
    : [];
  
  // Handle marking an invoice as paid
  const handleMarkAsPaid = async (id: number) => {
    try {
      await apiRequest('PUT', `/api/invoices/${id}/status`, { status: 'paid' });
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      toast({
        title: 'Success',
        description: 'Invoice marked as paid',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update invoice status',
      });
    }
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <Skeleton className="h-10 w-full md:w-64" />
              <div className="flex gap-2 w-full md:w-auto">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
            <div className="border rounded-md">
              <div className="flex items-center h-12 px-4 border-b bg-muted/50">
                <Skeleton className="h-4 w-1/6" />
                <Skeleton className="h-4 w-1/6 ml-4" />
                <Skeleton className="h-4 w-1/6 ml-4" />
                <Skeleton className="h-4 w-1/6 ml-4" />
                <Skeleton className="h-4 w-1/6 ml-4" />
              </div>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center h-16 px-4 border-b">
                  <Skeleton className="h-4 w-1/6" />
                  <Skeleton className="h-4 w-1/6 ml-4" />
                  <Skeleton className="h-4 w-1/6 ml-4" />
                  <Skeleton className="h-4 w-1/6 ml-4" />
                  <Skeleton className="h-4 w-1/6 ml-4" />
                  <Skeleton className="h-8 w-8 ml-auto" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoices</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Filter Controls */}
          <div className="bg-card rounded-lg p-4 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="relative w-full md:w-64">
              <Input
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 text-muted-foreground absolute left-3 top-2.5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <div className="flex items-center space-x-2 w-full md:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Last 30 Days" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">Last 30 Days</SelectItem>
                  <SelectItem value="90">Last 90 Days</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Invoices Table */}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length > 0 ? (
                  filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell>{invoice.clientId ? "Client #" + invoice.clientId : "Unknown Client"}</TableCell>
                      <TableCell>
                        <div className="text-sm">{formatDate(invoice.issuedDate)}</div>
                        <div className="text-xs text-muted-foreground">
                          {invoice.dueDate 
                            ? `Due: ${formatDate(invoice.dueDate)}`
                            : 'No due date'}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">${invoice.amount.toFixed(2)}</TableCell>
                      <TableCell>{getStatusBadge(invoice.status as InvoiceStatus)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <Link href={`/invoices/${invoice.id}`}>
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </DropdownMenuItem>
                            </Link>
                            <Link href={`/invoices/edit/${invoice.id}`}>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                            </Link>
                            <DropdownMenuItem>
                              <Mail className="mr-2 h-4 w-4" />
                              Email
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              Download PDF
                            </DropdownMenuItem>
                            {invoice.status !== 'paid' && (
                              <DropdownMenuItem onClick={() => handleMarkAsPaid(invoice.id)}>
                                <Check className="mr-2 h-4 w-4" />
                                Mark as Paid
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      No invoices found. Try adjusting your filters or create a new invoice.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
