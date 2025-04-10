import { useState } from 'react';
import { useLocation } from 'wouter';
import { LoginForm } from '@/components/auth/login-form';
import { RegisterForm } from '@/components/auth/register-form';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>('login');
  const [, navigate] = useLocation();
  
  const handleSuccess = () => {
    navigate('/dashboard');
  };
  
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 text-center">
        <div className="bg-primary h-14 w-14 rounded-md flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-xl font-bold">GP</span>
        </div>
        <h1 className="text-3xl font-bold">GigPro</h1>
        <p className="text-muted-foreground">DJ gig and invoice management</p>
      </div>
      
      <div className="w-full max-w-md">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full mb-6">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <LoginForm onSuccess={handleSuccess} />
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Button 
                  variant="link" 
                  className="p-0" 
                  onClick={() => setActiveTab('register')}
                >
                  Sign up
                </Button>
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="register">
            <RegisterForm onSuccess={handleSuccess} />
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Button 
                  variant="link" 
                  className="p-0" 
                  onClick={() => setActiveTab('login')}
                >
                  Sign in
                </Button>
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
