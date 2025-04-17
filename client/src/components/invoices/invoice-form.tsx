import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { apiRequest } from '@/lib/queryClient';
import { insertInvoiceSchema, Invoice, Gig, Client, InvoiceItem } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Extend the insert schema with additional validations
const invoiceFormSchema = insertInvoiceSchema
  .omit({ userId: true, createdAt: true, items: true })
  .extend({
    issuedDate: z.date({
      required_error: "Issued date is required",
    }),
    dueDate: z.date({
      required_error: "Due date is required",
    }),
    amount: z.string().transform((val) => parseFloat(val)),
    items: z.array(
      z.object({
        description: z.string().min(1, "Description is required"),
        quantity: z.string().transform((val) => parseFloat(val)),
        rate: z.string().transform((val) => parseFloat(val)),
        amount: z.string().transform((val) => parseFloat(val)),
      })
    ).optional(),
  });

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

interface InvoiceFormProps {
  invoiceId?: number;
  gigId?: number; // Optional gig ID if creating from a gig
  onSuccess?: () => void;
}

export function InvoiceForm({ invoiceId, gigId, onSuccess }: InvoiceFormProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('details');
  const [lineItems, setLineItems] = useState<InvoiceItem[]>([
    { description: 'DJ Services', quantity: 1, rate: 0, amount: 0 },
  ]);
  
  // Fetch clients for dropdown
  const { data: clients, isLoading: clientsLoading } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });
  
  // Fetch gigs for dropdown
  const { data: gigs, isLoading: gigsLoading } = useQuery<Gig[]>({
    queryKey: ['/api/gigs'],
  });
  
  // Fetch invoice if editing
  const { data: invoice, isLoading: invoiceLoading } = useQuery<Invoice>({
    queryKey: ['/api/invoices', invoiceId],
    enabled: !!invoiceId,
  });
  
  // Fetch specific gig if provided
  const { data: gig, isLoading: gigLoading } = useQuery<Gig>({
    queryKey: ['/api/gigs', gigId],
    enabled: !!gigId && !invoiceId, // Only fetch if we're creating from gig and not editing
  });
  
  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      invoiceNumber: `INV-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}`,
      issuedDate: new Date(),
      dueDate: addDays(new Date(), 14),
      amount: '0',
      status: 'draft',
      notes: '',
    },
  });
  
  // Generate a unique invoice number
  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    return `INV-${year}-${month}${day}-${random}`;
  };
  
  // Set form values when editing an existing invoice
  useEffect(() => {
    if (invoice) {
      const items = invoice.items as InvoiceItem[] || [];
      setLineItems(items.length > 0 ? items : [{ description: 'DJ Services', quantity: 1, rate: 0, amount: 0 }]);
      
      form.reset({
        invoiceNumber: invoice.invoiceNumber,
        issuedDate: new Date(invoice.issuedDate),
        dueDate: invoice.dueDate ? new Date(invoice.dueDate) : addDays(new Date(), 14),
        amount: invoice.amount.toString(),
        status: invoice.status as any,
        notes: invoice.notes || '',
        clientId: invoice.clientId,
        gigId: invoice.gigId,
      });
    }
  }, [invoice, form]);
  
  // Set initial values from gig if provided
  useEffect(() => {
    if (gig && !invoiceId) {
      form.setValue('gigId', gig.id);
      form.setValue('clientId', gig.clientId);
      
      if (gig.fee) {
        form.setValue('amount', gig.fee.toString());
        setLineItems([
          { description: `DJ Services: ${gig.title}`, quantity: 1, rate: gig.fee, amount: gig.fee },
        ]);
      }
      
      form.setValue('invoiceNumber', generateInvoiceNumber());
    }
  }, [gig, form, invoiceId]);
  
  // Update total amount when line items change
  useEffect(() => {
    const total = lineItems.reduce((sum, item) => sum + item.amount, 0);
    form.setValue('amount', total.toString());
  }, [lineItems, form]);
  
  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, rate: 0, amount: 0 }]);
  };
  
  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      const newItems = [...lineItems];
      newItems.splice(index, 1);
      setLineItems(newItems);
    }
  };
  
  const updateLineItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...lineItems];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Recalculate amount if quantity or rate changes
    if (field === 'quantity' || field === 'rate') {
      const quantity = field === 'quantity' ? Number(value) : newItems[index].quantity;
      const rate = field === 'rate' ? Number(value) : newItems[index].rate;
      newItems[index].amount = quantity * rate;
    }
    
    setLineItems(newItems);
  };
  
  const createInvoiceMutation = useMutation({
    mutationFn: async (data: InvoiceFormValues & { items: InvoiceItem[] }) => {
      return apiRequest('POST', '/api/invoices', { ...data, items: lineItems });
    },
  });
  
  const updateInvoiceMutation = useMutation({
    mutationFn: async (data: InvoiceFormValues & { items: InvoiceItem[] }) => {
      return apiRequest('PUT', `/api/invoices/${invoiceId}`, { ...data, items: lineItems });
    },
  });
  
  const onSubmit = async (data: InvoiceFormValues) => {
    try {
      const submitData = { ...data, items: lineItems };
      
      if (invoiceId) {
        await updateInvoiceMutation.mutateAsync(submitData);
        toast({ 
          title: "Invoice updated", 
          description: "Your invoice has been updated successfully"
        });
      } else {
        await createInvoiceMutation.mutateAsync(submitData);
        toast({ 
          title: "Invoice created", 
          description: "Your invoice has been created successfully"
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error saving invoice:', error);
      toast({ 
        variant: "destructive",
        title: "Error",
        description: "There was a problem saving your invoice"
      });
    }
  };
  
  const isLoading = clientsLoading || gigsLoading || (invoiceId && invoiceLoading) || (gigId && gigLoading);
  const isSubmitting = createInvoiceMutation.isPending || updateInvoiceMutation.isPending;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{invoiceId ? 'Edit Invoice' : 'Create Invoice'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="details">Invoice Details</TabsTrigger>
            <TabsTrigger value="items">Line Items</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <TabsContent value="details" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="invoiceNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Invoice Number</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={isLoading}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="sent">Sent</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="overdue">Overdue</SelectItem>
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
                    name="issuedDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Issue Date</FormLabel>
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
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Due Date</FormLabel>
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
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="clientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          value={field.value?.toString()}
                          disabled={isLoading}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a client" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {clients?.map((client) => (
                              <SelectItem key={client.id} value={client.id.toString()}>
                                {client.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="gigId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Related Gig</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          value={field.value?.toString()}
                          disabled={isLoading || !!gigId}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a gig (optional)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="0">None</SelectItem>
                            {gigs?.map((gig) => (
                              <SelectItem key={gig.id} value={gig.id.toString()}>
                                {gig.title} - {format(new Date(gig.date), 'MMM d, yyyy')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                          placeholder="Payment terms, additional information, etc." 
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => onSuccess?.()}>
                    Cancel
                  </Button>
                  <Button type="button" onClick={() => setActiveTab('items')}>
                    Next: Line Items
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="items">
                <div className="space-y-6">
                  <div className="rounded-md border">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="px-4 py-3 text-left text-sm font-medium">Description</th>
                          <th className="px-4 py-3 text-right text-sm font-medium">Quantity</th>
                          <th className="px-4 py-3 text-right text-sm font-medium">Rate</th>
                          <th className="px-4 py-3 text-right text-sm font-medium">Amount</th>
                          <th className="px-4 py-3 w-12"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {lineItems.map((item, index) => (
                          <tr key={index} className="border-b">
                            <td className="px-4 py-3">
                              <Input
                                value={item.description}
                                onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                                placeholder="Item description"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateLineItem(index, 'quantity', e.target.value)}
                                className="text-right"
                                min="1"
                                step="1"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <Input
                                type="number"
                                value={item.rate}
                                onChange={(e) => updateLineItem(index, 'rate', e.target.value)}
                                className="text-right"
                                min="0"
                                step="0.01"
                              />
                            </td>
                            <td className="px-4 py-3 text-right font-mono">
                              ${item.amount.toFixed(2)}
                            </td>
                            <td className="px-4 py-3">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeLineItem(index)}
                                disabled={lineItems.length === 1}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan={5} className="px-4 py-3">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={addLineItem}
                              className="w-full"
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Add Item
                            </Button>
                          </td>
                        </tr>
                        <tr className="border-t">
                          <td colSpan={3} className="px-4 py-3 text-right font-medium">
                            Total:
                          </td>
                          <td className="px-4 py-3 text-right font-medium font-mono">
                            ${parseFloat(form.getValues('amount')).toFixed(2)}
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                  
                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setActiveTab('details')}>
                      Back
                    </Button>
                    <Button type="button" onClick={() => setActiveTab('preview')}>
                      Next: Preview
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="preview">
                <div className="bg-card rounded-lg border p-6 mb-6">
                  <div className="flex flex-col md:flex-row justify-between mb-8">
                    <div>
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-primary rounded-md flex items-center justify-center text-white font-bold">
                          GP
                        </div>
                        <span className="ml-3 text-xl font-bold">GigPro</span>
                      </div>
                      <div className="text-sm mb-1">From:</div>
                      <div className="font-medium">{form.getValues('clientId') ? clients?.find(c => c.id === form.getValues('clientId'))?.name : 'Your DJ Name'}</div>
                      <div className="text-sm text-muted-foreground">Your contact information</div>
                    </div>
                    <div className="mt-6 md:mt-0 text-right">
                      <div className="text-2xl font-bold mb-2">INVOICE</div>
                      <div className="text-muted-foreground">{form.getValues('invoiceNumber')}</div>
                      <div className="mt-4">
                        <div className="text-sm mb-1">Issue Date:</div>
                        <div>{format(form.getValues('issuedDate'), 'MMMM d, yyyy')}</div>
                      </div>
                      <div className="mt-2">
                        <div className="text-sm mb-1">Due Date:</div>
                        <div>{format(form.getValues('dueDate'), 'MMMM d, yyyy')}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-8">
                    <div className="text-sm mb-1">Bill To:</div>
                    <div className="font-medium">{form.getValues('clientId') ? clients?.find(c => c.id === form.getValues('clientId'))?.name : 'Client Name'}</div>
                    <div className="text-sm text-muted-foreground">Client contact information</div>
                  </div>
                  
                  <div className="rounded-md border mb-8">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="px-4 py-3 text-left">Description</th>
                          <th className="px-4 py-3 text-right">Quantity</th>
                          <th className="px-4 py-3 text-right">Rate</th>
                          <th className="px-4 py-3 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lineItems.map((item, index) => (
                          <tr key={index} className="border-b">
                            <td className="px-4 py-3">{item.description}</td>
                            <td className="px-4 py-3 text-right">{item.quantity}</td>
                            <td className="px-4 py-3 text-right">${item.rate.toFixed(2)}</td>
                            <td className="px-4 py-3 text-right font-mono">${item.amount.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t">
                          <td colSpan={3} className="px-4 py-3 text-right font-medium">
                            Total:
                          </td>
                          <td className="px-4 py-3 text-right font-bold font-mono">
                            ${parseFloat(form.getValues('amount')).toFixed(2)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                  
                  {form.getValues('notes') && (
                    <div className="mb-8">
                      <div className="text-sm font-medium mb-2">Notes:</div>
                      <div className="text-muted-foreground whitespace-pre-wrap">{form.getValues('notes')}</div>
                    </div>
                  )}
                  
                  <div className="bg-muted/30 p-4 rounded-md text-center">
                    <div className="font-medium">Thank you for your business!</div>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setActiveTab('items')}>
                    Back
                  </Button>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Saving...' : form.getValues('status') === 'draft' ? 'Save Draft' : 'Save & Send'}
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </form>
          </Form>
        </Tabs>
      </CardContent>
    </Card>
  );
}
