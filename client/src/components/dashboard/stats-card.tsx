import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  isLoading?: boolean;
  variant?: 'default' | 'danger' | 'success' | 'warning';
}

export function StatsCard({
  title,
  value,
  description,
  isLoading = false,
  variant = 'default',
}: StatsCardProps) {
  // Apply variant-specific styles
  const getValueClassName = () => {
    switch (variant) {
      case 'danger':
        return 'text-red-500';
      case 'success':
        return 'text-green-500';
      case 'warning':
        return 'text-amber-500';
      default:
        return '';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-8 w-[120px]" />
            {description && <Skeleton className="h-4 w-[150px]" />}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-muted-foreground mb-2">{title}</div>
        <div className="flex items-end">
          <span className={`text-3xl font-bold ${getValueClassName()}`}>{value}</span>
          {description && <span className="text-muted-foreground ml-2">{description}</span>}
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardStats() {
  const { data: upcomingGigs, isLoading: gigsLoading } = useQuery({
    queryKey: ['/api/gigs/upcoming'],
  });

  const { data: invoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ['/api/invoices'],
  });

  // Calculate stats from data
  const pendingInvoices = !invoicesLoading
    ? invoices.filter((inv: any) => inv.status === 'pending')
    : [];

  const overdueInvoices = !invoicesLoading
    ? invoices.filter((inv: any) => inv.status === 'overdue')
    : [];

  const pendingAmount = pendingInvoices.reduce(
    (sum: number, invoice: any) => sum + parseFloat(invoice.amount),
    0
  );

  const overdueAmount = overdueInvoices.reduce(
    (sum: number, invoice: any) => sum + parseFloat(invoice.amount),
    0
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <StatsCard
        title="Upcoming Gigs"
        value={gigsLoading ? '...' : upcomingGigs?.length || 0}
        description="next 7 days"
        isLoading={gigsLoading}
      />
      <StatsCard
        title="Pending Invoices"
        value={invoicesLoading ? '...' : `$${pendingAmount.toFixed(2)}`}
        description={`from ${pendingInvoices.length} clients`}
        isLoading={invoicesLoading}
        variant="warning"
      />
      <StatsCard
        title="Overdue Payments"
        value={invoicesLoading ? '...' : `$${overdueAmount.toFixed(2)}`}
        description={`from ${overdueInvoices.length} clients`}
        isLoading={invoicesLoading}
        variant="danger"
      />
    </div>
  );
}
