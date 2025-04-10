import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { FileDown, BarChart, Calendar, FileText } from 'lucide-react';

export function NotificationSettings() {
  const { toast } = useToast();
  
  // In a real app, these would be fetched from the server
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [paymentReminders, setPaymentReminders] = useState(true);
  const [gigReminders, setGigReminders] = useState(true);
  
  const handleSettingChange = (setting: string, value: boolean) => {
    // In a real app, this would update the server
    switch (setting) {
      case 'email':
        setEmailNotifications(value);
        break;
      case 'push':
        setPushNotifications(value);
        break;
      case 'payment':
        setPaymentReminders(value);
        break;
      case 'gig':
        setGigReminders(value);
        break;
    }
    
    toast({
      title: 'Settings updated',
      description: 'Your notification preferences have been saved',
    });
  };
  
  const handleExport = (type: string) => {
    toast({
      title: 'Export started',
      description: `Your ${type} data will be prepared for download`,
    });
    
    // In a real app, this would trigger a download
    setTimeout(() => {
      toast({
        title: 'Export ready',
        description: `Your ${type} data is ready to download`,
      });
    }, 2000);
  };
  
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>Configure how and when you want to be notified</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Email Notifications</h3>
              <p className="text-sm text-muted-foreground">Get email alerts for important events</p>
            </div>
            <Switch 
              checked={emailNotifications}
              onCheckedChange={(value) => handleSettingChange('email', value)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Push Notifications</h3>
              <p className="text-sm text-muted-foreground">Receive alerts on your devices</p>
            </div>
            <Switch 
              checked={pushNotifications}
              onCheckedChange={(value) => handleSettingChange('push', value)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Payment Reminders</h3>
              <p className="text-sm text-muted-foreground">Get notified about upcoming and overdue payments</p>
            </div>
            <Switch 
              checked={paymentReminders}
              onCheckedChange={(value) => handleSettingChange('payment', value)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Gig Reminders</h3>
              <p className="text-sm text-muted-foreground">Get notified about upcoming gigs</p>
            </div>
            <Switch 
              checked={gigReminders}
              onCheckedChange={(value) => handleSettingChange('gig', value)}
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Data Export</CardTitle>
          <CardDescription>Export your data for backup or reporting purposes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="flex items-center justify-center" 
              onClick={() => handleExport('financial reports')}
            >
              <BarChart className="h-5 w-5 mr-2" />
              <span>Financial Reports</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center justify-center" 
              onClick={() => handleExport('invoices')}
            >
              <FileText className="h-5 w-5 mr-2" />
              <span>Invoices (CSV)</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center justify-center" 
              onClick={() => handleExport('gig history')}
            >
              <Calendar className="h-5 w-5 mr-2" />
              <span>Gig History</span>
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Invoice Templates</CardTitle>
          <CardDescription>Choose and customize your invoice look</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-primary rounded-lg p-4 relative bg-card">
              <div className="absolute top-3 right-3">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary text-primary-foreground">Active</span>
              </div>
              <div className="h-40 flex items-center justify-center mb-3">
                <div className="w-full h-full bg-muted rounded-md flex flex-col p-3">
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 bg-primary rounded-md flex items-center justify-center text-primary-foreground font-bold">GP</div>
                    <div className="text-right">
                      <div className="text-sm font-bold">INVOICE</div>
                      <div className="text-xs">#2023-001</div>
                    </div>
                  </div>
                  <div className="flex-grow"></div>
                  <div className="flex justify-between items-end">
                    <div className="text-xs text-muted-foreground">From: DJ Name</div>
                    <div className="text-xs text-muted-foreground">To: Client Name</div>
                  </div>
                </div>
              </div>
              <h3 className="font-medium mb-1">Modern Purple</h3>
              <p className="text-xs text-muted-foreground mb-3">Clean, professional template with accent colors</p>
              <Button className="w-full" size="sm">Edit Template</Button>
            </div>
            
            <div className="border border-muted rounded-lg p-4 relative bg-card">
              <div className="h-40 flex items-center justify-center mb-3">
                <div className="w-full h-full bg-muted rounded-md flex flex-col p-3">
                  <div className="border-b border-muted-foreground pb-2 mb-2">
                    <div className="text-sm font-bold">INVOICE #2023-001</div>
                  </div>
                  <div className="flex justify-between items-start">
                    <div className="text-xs">From: DJ Name</div>
                    <div className="text-xs">To: Client Name</div>
                  </div>
                  <div className="flex-grow"></div>
                  <div className="border-t border-muted-foreground pt-2 text-right">
                    <div className="text-xs font-medium">Total: $800.00</div>
                  </div>
                </div>
              </div>
              <h3 className="font-medium mb-1">Minimal</h3>
              <p className="text-xs text-muted-foreground mb-3">Simple, straightforward design</p>
              <Button variant="outline" className="w-full" size="sm">Use Template</Button>
            </div>
            
            <div className="border border-muted rounded-lg p-4 relative bg-card">
              <div className="h-40 flex items-center justify-center mb-3">
                <div className="w-full h-full bg-muted rounded-md flex flex-col p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="w-10 h-10 bg-destructive rounded-full flex items-center justify-center text-destructive-foreground text-xs font-bold">DJ</div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-destructive">INVOICE</div>
                      <div className="text-xs">#2023-001</div>
                    </div>
                  </div>
                  <div className="flex-grow"></div>
                  <div className="bg-destructive/10 p-2 rounded">
                    <div className="text-xs font-medium text-center">Thank you for your business!</div>
                  </div>
                </div>
              </div>
              <h3 className="font-medium mb-1">Bold Red</h3>
              <p className="text-xs text-muted-foreground mb-3">Energetic design with accent highlights</p>
              <Button variant="outline" className="w-full" size="sm">Use Template</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
