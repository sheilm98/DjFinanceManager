import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { apiRequest } from '@/lib/queryClient';
import { insertGigSchema, Gig, Client } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Extend the insert schema with additional validations
// Define the full schema with all fields needed in the form
const gigFormSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  date: z.date({
    required_error: "A date is required",
  }),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  location: z.string().optional(),
  fee: z.coerce.number().optional(),
  notes: z.string().optional(),
  clientId: z.number().optional(),
  reminderSet: z.boolean().default(true),
});

type GigFormValues = z.infer<typeof gigFormSchema>;

interface GigFormProps {
  gigId?: number;
  onSuccess?: () => void;
}

export function GigForm({ gigId, onSuccess }: GigFormProps) {
  const { toast } = useToast();
  
  // Fetch clients for dropdown
  const { data: clients, isLoading: clientsLoading } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });
  
  // Fetch gig if editing
  const { data: gig, isLoading: gigLoading } = useQuery<Gig>({
    queryKey: ['/api/gigs', gigId],
    enabled: !!gigId,
  });
  
  const form = useForm<GigFormValues>({
    resolver: zodResolver(gigFormSchema),
    defaultValues: {
      title: '',
      date: new Date(),
      startTime: '',
      endTime: '',
      location: '',
      fee: undefined,
      notes: '',
      reminderSet: true,
      clientId: undefined,
    },
  });
  
  // Set form values when editing an existing gig
  useEffect(() => {
    if (gig) {
      form.reset({
        title: gig.title,
        date: new Date(gig.date),
        startTime: gig.startTime || '',
        endTime: gig.endTime || '',
        location: gig.location || '',
        fee: gig.fee || undefined,
        notes: gig.notes || '',
        clientId: gig.clientId || undefined,
        reminderSet: gig.reminderSet ?? true,
      });
    }
  }, [gig, form]);
  
  const createGigMutation = useMutation({
    mutationFn: async (data: GigFormValues) => {
      return apiRequest('POST', '/api/gigs', data);
    },
  });
  
  const updateGigMutation = useMutation({
    mutationFn: async (data: GigFormValues) => {
      return apiRequest('PUT', `/api/gigs/${gigId}`, data);
    },
  });
  
  const onSubmit = async (data: GigFormValues) => {
    try {
      if (gigId) {
        await updateGigMutation.mutateAsync(data);
        toast({ 
          title: "Gig updated", 
          description: "Your gig has been updated successfully"
        });
      } else {
        await createGigMutation.mutateAsync(data);
        toast({ 
          title: "Gig created", 
          description: "Your gig has been created successfully"
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/gigs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/gigs/upcoming'] });
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error saving gig:', error);
      toast({ 
        variant: "destructive",
        title: "Error",
        description: "There was a problem saving your gig"
      });
    }
  };
  
  const isLoading = clientsLoading || (gigId && gigLoading);
  const isSubmitting = createGigMutation.isPending || updateGigMutation.isPending;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{gigId ? 'Edit Gig' : 'Add New Gig'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Club Event, Wedding, Corporate Party, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className="w-full flex justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client/Promoter</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)}
                      value={field.value?.toString() || undefined}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a client" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients && clients.length > 0 ? (
                          clients.map((client) => (
                            <SelectItem key={client.id} value={client.id.toString()}>
                              {client.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-clients" disabled>
                            No clients available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Venue name, address, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="fee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fee</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Equipment requirements, special requests, etc." 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="reminderSet"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Set payment reminder</FormLabel>
                    <FormDescription>
                      Get a notification 14 days after the gig to check payment status
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onSuccess?.()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : gigId ? 'Update Gig' : 'Create Gig'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
