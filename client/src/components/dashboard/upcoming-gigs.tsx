import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MoreVertical, Edit, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDate, formatTime } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import { GigWithClient } from '@shared/schema';

export function UpcomingGigs() {
  const { data: gigs, isLoading, error } = useQuery<GigWithClient[]>({
    queryKey: ['/api/gigs/upcoming'],
  });
  
  const { toast } = useToast();
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Gigs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border">
            {[1, 2, 3].map((i) => (
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
          <CardTitle>Upcoming Gigs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-destructive">Error loading gigs</div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Gigs</CardTitle>
      </CardHeader>
      <CardContent>
        {gigs && gigs.length > 0 ? (
          <div className="divide-y divide-border">
            {gigs.map((gig) => (
              <div key={gig.id} className="p-4 flex flex-col md:flex-row md:items-center">
                <div className="flex-grow mb-3 md:mb-0">
                  <div className="font-medium">{gig.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(gig.date)}, {gig.startTime && gig.endTime ? `${gig.startTime} - ${gig.endTime}` : 'Time TBD'}
                  </div>
                </div>
                <div className="flex items-center">
                  <Badge variant="secondary" className="mr-3">${gig.fee?.toFixed(2) || '0.00'}</Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <Link href={`/calendar/edit/${gig.id}`}>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Gig
                        </DropdownMenuItem>
                      </Link>
                      <Link href={`/invoices/create?gigId=${gig.id}`}>
                        <DropdownMenuItem>
                          <FileText className="mr-2 h-4 w-4" />
                          Create Invoice
                        </DropdownMenuItem>
                      </Link>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-4 text-center text-muted-foreground">
            No upcoming gigs. Add your first gig to get started.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
