import { useQuery } from '@tanstack/react-query';
import { User } from '@shared/schema';
import { Sidebar } from '@/components/ui/sidebar';
import { NotificationSettings } from '@/components/settings/notification-settings';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function SettingsPage() {
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
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Customize your application preferences</p>
          </div>
          
          <NotificationSettings />
        </div>
      </main>
    </div>
  );
}
