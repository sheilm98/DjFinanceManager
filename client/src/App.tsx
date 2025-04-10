import { Switch, Route, Redirect, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useQuery } from "@tanstack/react-query";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth";
import DashboardPage from "@/pages/dashboard";
import CalendarPage from "@/pages/calendar";
import InvoicesPage from "@/pages/invoices";
import ClientsPage from "@/pages/clients";
import ProfilePage from "@/pages/profile";
import SettingsPage from "@/pages/settings";

// Protected route component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['/api/auth/user'],
    retry: false,
  });

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation('/auth');
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (error || !user) {
    return null; // Will redirect in the useEffect
  }

  return <>{children}</>;
}

function Router() {
  const [location] = useLocation();
  
  // Detect auth state
  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/auth/user'],
    retry: false,
  });
  
  // Redirect from root to dashboard or auth
  if (location === '/') {
    return <Redirect to={user ? '/dashboard' : '/auth'} />;
  }
  
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      
      <Route path="/dashboard">
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      </Route>
      
      <Route path="/calendar">
        <ProtectedRoute>
          <CalendarPage />
        </ProtectedRoute>
      </Route>
      
      <Route path="/calendar/new">
        <ProtectedRoute>
          <CalendarPage />
        </ProtectedRoute>
      </Route>
      
      <Route path="/calendar/edit/:id">
        <ProtectedRoute>
          <CalendarPage />
        </ProtectedRoute>
      </Route>
      
      <Route path="/invoices">
        <ProtectedRoute>
          <InvoicesPage />
        </ProtectedRoute>
      </Route>
      
      <Route path="/invoices/create">
        <ProtectedRoute>
          <InvoicesPage />
        </ProtectedRoute>
      </Route>
      
      <Route path="/invoices/edit/:id">
        <ProtectedRoute>
          <InvoicesPage />
        </ProtectedRoute>
      </Route>
      
      <Route path="/clients">
        <ProtectedRoute>
          <ClientsPage />
        </ProtectedRoute>
      </Route>
      
      <Route path="/clients/new">
        <ProtectedRoute>
          <ClientsPage />
        </ProtectedRoute>
      </Route>
      
      <Route path="/clients/edit/:id">
        <ProtectedRoute>
          <ClientsPage />
        </ProtectedRoute>
      </Route>
      
      <Route path="/profile">
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      </Route>
      
      <Route path="/settings">
        <ProtectedRoute>
          <SettingsPage />
        </ProtectedRoute>
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
