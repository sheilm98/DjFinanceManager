import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { User, Gig } from '@shared/schema';
import { Sidebar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { GigForm } from '@/components/calendar/gig-form';
import { CalendarView } from '@/components/calendar/calendar-view';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export default function CalendarPage() {
  const [location, navigate] = useLocation();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedGigId, setSelectedGigId] = useState<number | undefined>(undefined);
  
  // Check if we're in 'new' mode from the URL
  const isNewGig = location === '/calendar/new';
  
  // Check if we're in 'edit' mode from the URL
  const editMatch = location.match(/^\/calendar\/edit\/(\d+)$/);
  const editGigId = editMatch ? parseInt(editMatch[1]) : undefined;
  
  // Set dialog open state based on URL
  if ((isNewGig || editGigId) && !isFormOpen) {
    setIsFormOpen(true);
    setSelectedGigId(editGigId);
  }
  
  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ['/api/auth/user'],
  });
  
  const { data: gigs, isLoading: gigsLoading } = useQuery<Gig[]>({
    queryKey: ['/api/gigs'],
  });
  
  const handleAddGig = () => {
    navigate('/calendar/new');
  };
  
  const handleEditGig = (id: number) => {
    navigate(`/calendar/edit/${id}`);
  };
  
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedGigId(undefined);
    navigate('/calendar');
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
              <h1 className="text-2xl font-bold">Calendar</h1>
              <p className="text-muted-foreground">Manage your upcoming gigs</p>
            </div>
            <Button 
              className="mt-4 md:mt-0" 
              onClick={handleAddGig}
            >
              <Plus className="h-5 w-5 mr-2" />
              Add New Gig
            </Button>
          </div>
          
          {/* Calendar */}
          <CalendarView />
          
          {/* Upcoming Gigs List */}
          <h2 className="text-xl font-semibold mb-4">Upcoming Gigs</h2>
          <div className="bg-card rounded-lg overflow-hidden">
            {gigsLoading ? (
              <div className="p-4 text-center">Loading gigs...</div>
            ) : gigs && gigs.length > 0 ? (
              <div className="divide-y divide-border">
                {gigs
                  .filter(gig => new Date(gig.date) >= new Date())
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map(gig => {
                    // Format the date as Month Day (e.g., "Jul 21")
                    const date = new Date(gig.date);
                    const month = date.toLocaleString('default', { month: 'short' });
                    const day = date.getDate();
                    
                    return (
                      <div key={gig.id} className="p-4 flex flex-col md:flex-row">
                        <div className="flex-shrink-0 mb-3 md:mb-0 md:mr-4">
                          <div className="w-12 h-12 bg-secondary rounded-lg flex flex-col items-center justify-center">
                            <div className="text-sm font-semibold">{day}</div>
                            <div className="text-xs">{month}</div>
                          </div>
                        </div>
                        <div className="flex-grow">
                          <div className="font-medium">{gig.title}</div>
                          <div className="text-sm text-muted-foreground mb-2">
                            {gig.startTime && gig.endTime ? `${gig.startTime} - ${gig.endTime}` : 'Time TBD'} • {gig.location || 'Location TBD'}
                          </div>
                          <div className="flex items-center text-sm">
                            <span className="bg-primary px-3 py-1 rounded-full text-xs font-medium mr-3 text-primary-foreground">
                              ${gig.fee?.toFixed(2) || '0.00'}
                            </span>
                            <span className="text-muted-foreground">
                              Client: {gig.clientId ? `#${gig.clientId}` : 'Not specified'}
                            </span>
                          </div>
                        </div>
                        <div className="flex mt-3 md:mt-0">
                          <Button variant="ghost" size="sm" onClick={() => handleEditGig(gig.id)}>
                            Edit
                          </Button>
                          <Link href={`/invoices/create?gigId=${gig.id}`}>
                            <Button variant="ghost" size="sm">
                              Create Invoice
                            </Button>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <p>No upcoming gigs found.</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                  onClick={handleAddGig}
                >
                  Add Your First Gig
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Gig Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <GigForm
            gigId={selectedGigId}
            onSuccess={handleCloseForm}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
