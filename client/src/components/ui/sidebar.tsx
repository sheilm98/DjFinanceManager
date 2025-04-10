import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { User } from '@shared/schema';
import { useMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';
import { logout } from '@/lib/auth';
import { queryClient } from '@/lib/queryClient';
import { useMutation } from '@tanstack/react-query';
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Users,
  User as UserIcon,
  Settings,
  Menu,
  X,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  user: User;
}

export function Sidebar({ user }: SidebarProps) {
  const isMobile = useMobile();
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  
  const closeSidebar = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };
  
  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (isMobile && isOpen && (e.target as HTMLElement).id === 'main-content') {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [isMobile, isOpen]);
  
  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out',
      });
    },
  });
  
  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
  };
  
  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5 mr-3" /> },
    { href: '/calendar', label: 'Calendar', icon: <Calendar className="h-5 w-5 mr-3" /> },
    { href: '/invoices', label: 'Invoices', icon: <FileText className="h-5 w-5 mr-3" /> },
    { href: '/clients', label: 'Clients', icon: <Users className="h-5 w-5 mr-3" /> },
    { href: '/profile', label: 'Profile', icon: <UserIcon className="h-5 w-5 mr-3" /> },
    { href: '/settings', label: 'Settings', icon: <Settings className="h-5 w-5 mr-3" /> },
  ];
  
  return (
    <>
      {/* Mobile Header */}
      {isMobile && (
        <header className="flex items-center justify-between p-4 bg-card border-b">
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center">
            <span className="text-primary font-bold text-xl">GigPro</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
            <span className="text-sm font-medium">
              {user.stageName ? user.stageName.substring(0, 2).toUpperCase() : 'DJ'}
            </span>
          </div>
        </header>
      )}
      
      {/* Sidebar */}
      <nav
        className={`bg-card fixed inset-y-0 left-0 z-30 w-64 transition-transform duration-300 ease-in-out ${
          isOpen || !isMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {isMobile && (
          <div className="absolute right-3 top-3">
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        )}
        
        <div className="p-4 flex items-center border-b border-border">
          <div className="bg-primary h-10 w-10 rounded-md flex items-center justify-center">
            <span className="text-white font-bold">GP</span>
          </div>
          <span className="ml-3 text-xl font-bold">GigPro</span>
        </div>
        
        <div className="py-4">
          <div className="px-4 mb-2 text-xs uppercase text-muted-foreground">Main</div>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <a
                className={`flex items-center px-4 py-3 ${
                  location === item.href
                    ? 'bg-secondary text-white'
                    : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors'
                }`}
                onClick={closeSidebar}
              >
                {item.icon}
                {item.label}
              </a>
            </Link>
          ))}
          
          <div className="mt-6 px-4">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </Button>
          </div>
        </div>
        
        <div className="absolute bottom-0 w-full p-4 border-t border-border">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
              <span className="text-sm font-medium">
                {user.stageName ? user.stageName.substring(0, 2).toUpperCase() : 'DJ'}
              </span>
            </div>
            <div className="ml-3">
              <div className="font-medium">{user.stageName || 'DJ Name'}</div>
              <div className="text-xs text-muted-foreground">{user.email}</div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
