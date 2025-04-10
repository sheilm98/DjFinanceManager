import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'wouter';
import { InvoiceWithDetails, InvoiceStatus } from '@shared/schema';
import { formatDate } from '@/lib/utils';

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

export function RecentInvoices() {
  const { data: invoices, isLoading, error } = useQuery<InvoiceWithDetails[]>({
    queryKey: ['/api/invoices/recent'],
  });
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="py-4">
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-[200px]" />
                  <Skeleton className="h-6 w-[50px]" />
                </div>
                <Skeleton className="h-4 w-[300px] mt-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-destructive">Error loading invoices</div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Invoices</CardTitle>
      </CardHeader>
      <CardContent>
        {invoices && invoices.length > 0 ? (
          <div className="divide-y divide-border">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="p-4 flex flex-col md:flex-row md:items-center">
                <div className="flex-grow mb-3 md:mb-0">
                  <div className="font-medium">
                    {invoice.client?.name || "Unknown Client"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {invoice.invoiceNumber} • 
                    {invoice.dueDate 
                      ? invoice.status === 'paid' 
                        ? ` Paid on ${formatDate(invoice.dueDate)}`
                        : invoice.status === 'overdue'
                          ? ` Overdue by ${Math.floor((new Date().getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24))} days`
                          : ` Due ${formatDate(invoice.dueDate)}`
                      : ' No due date'}
                  </div>
                </div>
                <div className="flex items-center">
                  <Badge 
                    variant={invoice.status === 'paid' ? 'success' : invoice.status === 'overdue' ? 'destructive' : 'secondary'}
                    className="mr-3"
                  >
                    ${invoice.amount.toFixed(2)}
                  </Badge>
                  {getStatusBadge(invoice.status as InvoiceStatus)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-4 text-center text-muted-foreground">
            No invoices found. Create your first invoice to get started.
          </div>
        )}
        
        <div className="mt-4">
          <Link href="/invoices">
            <a className="text-sm text-primary hover:underline">View all invoices →</a>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
