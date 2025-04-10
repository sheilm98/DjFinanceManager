import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { User } from '@shared/schema';
import { Sidebar } from '@/components/ui/sidebar';
import { DashboardStats } from '@/components/dashboard/stats-card';
import { UpcomingGigs } from '@/components/dashboard/upcoming-gigs';
import { RecentInvoices } from '@/components/dashboard/recent-invoices';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, FileText, Users } from 'lucide-react';

export default function DashboardPage() {
  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ['/api/auth/user'],
  });
  
  if (userLoading || !user) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar user={user} />
      
      <main id="main-content" className="flex-1 md:ml-64">
        <div className="p-4 md:p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user.stageName || 'DJ'}</p>
          </div>
          
          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Link href="/calendar/new">
              <Button className="bg-primary text-primary-foreground w-full p-4 rounded-lg flex flex-col items-center justify-center h-24">
                <Plus className="h-6 w-6 mb-2" />
                <span>New Gig</span>
              </Button>
            </Link>
            
            <Link href="/invoices/create">
              <Button className="bg-secondary text-secondary-foreground w-full p-4 rounded-lg flex flex-col items-center justify-center h-24">
                <FileText className="h-6 w-6 mb-2" />
                <span>New Invoice</span>
              </Button>
            </Link>
            
            <Link href="/calendar">
              <Button className="bg-secondary text-secondary-foreground w-full p-4 rounded-lg flex flex-col items-center justify-center h-24">
                <Calendar className="h-6 w-6 mb-2" />
                <span>Calendar</span>
              </Button>
            </Link>
            
            <Link href="/clients">
              <Button className="bg-secondary text-secondary-foreground w-full p-4 rounded-lg flex flex-col items-center justify-center h-24">
                <Users className="h-6 w-6 mb-2" />
                <span>Clients</span>
              </Button>
            </Link>
          </div>
          
          {/* Statistics */}
          <DashboardStats />
          
          {/* Upcoming Gigs */}
          <div className="mb-8">
            <UpcomingGigs />
          </div>
          
          {/* Recent Invoices */}
          <div>
            <RecentInvoices />
          </div>
        </div>
      </main>
    </div>
  );
}
