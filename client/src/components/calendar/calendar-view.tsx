import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import { Gig } from '@shared/schema';
import { Link } from 'wouter';

export function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Start the calendar grid from the start day of the week
  let startDate = monthStart;
  while (startDate.getDay() !== 0) { // 0 = Sunday
    startDate = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);
  }
  
  // End the calendar grid at the end day of the week
  let endDate = monthEnd;
  while (endDate.getDay() !== 6) { // 6 = Saturday
    endDate = new Date(endDate.getTime() + 24 * 60 * 60 * 1000);
  }
  
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
  
  // Fetch gigs for the current month
  const { data: gigs, isLoading } = useQuery<Gig[]>({
    queryKey: ['/api/gigs/month', currentMonth.getFullYear(), currentMonth.getMonth() + 1],
  });
  
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  
  // Check if a date has a gig
  const hasGig = (date: Date) => {
    if (!gigs) return false;
    return gigs.some(gig => isSameDay(new Date(gig.date), date));
  };
  
  // Get gigs for a specific date
  const getGigsForDate = (date: Date) => {
    if (!gigs) return [];
    return gigs.filter(gig => isSameDay(new Date(gig.date), date));
  };
  
  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-6">
          <div className="text-xl font-semibold">{format(currentMonth, 'MMMM yyyy')}</div>
          <div className="flex">
            <Button variant="outline" size="icon" onClick={prevMonth} className="mr-2">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-muted-foreground text-sm py-2">{day}</div>
          ))}
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }).map((_, index) => (
              <Skeleton key={index} className="aspect-ratio-1/1 rounded-md h-12" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day) => {
              const dateGigs = getGigsForDate(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              
              return (
                <div
                  key={day.toString()}
                  className={cn(
                    "text-center p-2 text-sm rounded-md calendar-day relative",
                    isCurrentMonth ? "bg-secondary/20" : "bg-secondary/10 text-muted-foreground",
                    isToday(day) && "border border-primary",
                    hasGig(day) && isCurrentMonth && "bg-primary text-primary-foreground"
                  )}
                >
                  {day.getDate()}
                  
                  {dateGigs.length > 0 && (
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-1">
                      {dateGigs.length > 1 ? (
                        <span className="h-1.5 w-1.5 rounded-full bg-secondary-foreground"></span>
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full bg-secondary-foreground"></span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
