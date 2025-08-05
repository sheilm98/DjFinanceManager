import React, { useState, useEffect, createContext, useContext } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock React Native dependencies for web
const mockExpoRouter = {
  useRouter: () => ({
    push: (path: string) => console.log('Navigate to:', path),
    replace: (path: string) => console.log('Replace with:', path),
  }),
  Redirect: ({ href }: { href: string }) => {
    useEffect(() => {
      console.log('Redirecting to:', href);
    }, [href]);
    return <div>Redirecting to {href}...</div>;
  },
  Stack: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href} onClick={(e) => { e.preventDefault(); console.log('Navigate to:', href); }}>
      {children}
    </a>
  ),
};

const mockReactNative = {
  View: ({ style, children }: any) => <div style={style}>{children}</div>,
  Text: ({ style, children }: any) => <span style={style}>{children}</span>,
  ScrollView: ({ style, children }: any) => <div style={{ ...style, overflowY: 'auto' }}>{children}</div>,
  StyleSheet: {
    create: (styles: any) => styles,
  },
  Alert: {
    alert: (title: string, message?: string, buttons?: any[]) => {
      if (buttons && buttons.length > 1) {
        const confirmed = window.confirm(`${title}\n${message || ''}`);
        if (confirmed && buttons[1].onPress) {
          buttons[1].onPress();
        }
      } else {
        window.alert(`${title}\n${message || ''}`);
      }
    },
  },
};

const mockReactNativePaper = {
  Text: ({ style, children }: any) => <span style={style}>{children}</span>,
  Button: ({ mode, onPress, loading, disabled, children, icon, style }: any) => (
    <button 
      onClick={onPress}
      disabled={disabled || loading}
      style={{
        padding: '12px 24px',
        backgroundColor: mode === 'contained' ? '#7c3aed' : 'transparent',
        color: mode === 'contained' ? 'white' : '#7c3aed',
        border: mode === 'outlined' ? '1px solid #7c3aed' : 'none',
        borderRadius: '8px',
        cursor: disabled ? 'default' : 'pointer',
        ...style,
      }}
    >
      {loading ? 'Loading...' : children}
    </button>
  ),
  Card: ({ children, style }: any) => (
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '12px', 
      padding: '16px', 
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      ...style 
    }}>
      {children}
    </div>
  ),
  Title: ({ children, style }: any) => <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: '600', ...style }}>{children}</h2>,
  TextInput: ({ label, value, onChangeText, mode, style, ...props }: any) => (
    <div style={{ marginBottom: '16px', ...style }}>
      <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#64748b' }}>
        {label}
      </label>
      <input
        type={props.secureTextEntry ? 'password' : 'text'}
        value={value}
        onChange={(e) => onChangeText && onChangeText(e.target.value)}
        style={{
          width: '100%',
          padding: '12px',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          fontSize: '16px',
        }}
        {...props}
      />
    </div>
  ),
  FAB: ({ icon, label, style, onPress }: any) => (
    <button
      onClick={onPress}
      style={{
        position: 'fixed',
        bottom: '16px',
        right: '16px',
        backgroundColor: '#7c3aed',
        color: 'white',
        border: 'none',
        borderRadius: '28px',
        padding: '16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        cursor: 'pointer',
        zIndex: 1000,
        ...style,
      }}
    >
      {label || '+'}
    </button>
  ),
  Avatar: {
    Text: ({ label, size, style }: any) => (
      <div style={{
        width: size || 40,
        height: size || 40,
        borderRadius: '50%',
        backgroundColor: '#7c3aed',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
        fontWeight: 'bold',
        ...style,
      }}>
        {label}
      </div>
    ),
  },
  Chip: ({ children, mode, style, onPress }: any) => (
    <span
      onClick={onPress}
      style={{
        display: 'inline-block',
        padding: '6px 12px',
        backgroundColor: mode === 'flat' ? '#e9d5ff' : 'transparent',
        border: '1px solid #7c3aed',
        borderRadius: '16px',
        fontSize: '12px',
        color: '#7c3aed',
        cursor: onPress ? 'pointer' : 'default',
        ...style,
      }}
    >
      {children}
    </span>
  ),
  Searchbar: ({ placeholder, value, onChangeText, style }: any) => (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChangeText && onChangeText(e.target.value)}
      style={{
        width: '100%',
        padding: '12px 16px',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        fontSize: '16px',
        backgroundColor: '#f8fafc',
        ...style,
      }}
    />
  ),
  ActivityIndicator: ({ size }: any) => (
    <div style={{
      width: size === 'large' ? '40px' : '20px',
      height: size === 'large' ? '40px' : '20px',
      border: '3px solid #e2e8f0',
      borderTop: '3px solid #7c3aed',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    }}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  ),
  Switch: ({ value, onValueChange }: any) => (
    <input
      type="checkbox"
      checked={value}
      onChange={(e) => onValueChange && onValueChange(e.target.checked)}
      style={{ transform: 'scale(1.5)' }}
    />
  ),
};

const mockExpoVectorIcons = {
  MaterialIcons: ({ name, size, color, style }: any) => (
    <span style={{ fontSize: size || 24, color: color || '#64748b', ...style }}>
      📱
    </span>
  ),
};

// Mock SecureStore
const mockSecureStore = {
  getItemAsync: async (key: string) => {
    return localStorage.getItem(key);
  },
  setItemAsync: async (key: string, value: string) => {
    localStorage.setItem(key, value);
  },
  deleteItemAsync: async (key: string) => {
    localStorage.removeItem(key);
  },
};

// Global mocks
(window as any).ExpoRouter = mockExpoRouter;
(window as any).ReactNative = mockReactNative;
(window as any).ReactNativePaper = mockReactNativePaper;
(window as any).ExpoVectorIcons = mockExpoVectorIcons;
(window as any).SecureStore = mockSecureStore;

// Simple mobile-style app component
const MobileApp = () => {
  const [currentRoute, setCurrentRoute] = useState('/');
  const [user, setUser] = useState(null);

  // Simple routing
  const routes: Record<string, React.ComponentType> = {
    '/': () => user ? <Dashboard /> : <Login />,
    '/login': Login,
    '/register': Register,
    '/dashboard': Dashboard,
    '/calendar': Calendar,
    '/clients': Clients,
    '/invoices': Invoices,
    '/profile': Profile,
  };

  const CurrentPage = routes[currentRoute] || routes['/'];

  return (
    <div style={{ 
      maxWidth: '414px', 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <CurrentPage />
      
      {user && (
        <nav style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '414px',
          backgroundColor: 'white',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-around',
          padding: '8px 0',
          zIndex: 100,
        }}>
          {[
            { path: '/dashboard', label: 'Dashboard', icon: '📊' },
            { path: '/calendar', label: 'Calendar', icon: '📅' },
            { path: '/clients', label: 'Clients', icon: '👥' },
            { path: '/invoices', label: 'Invoices', icon: '📄' },
            { path: '/profile', label: 'Profile', icon: '👤' },
          ].map((tab) => (
            <button
              key={tab.path}
              onClick={() => setCurrentRoute(tab.path)}
              style={{
                background: 'none',
                border: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '8px',
                color: currentRoute === tab.path ? '#7c3aed' : '#64748b',
                fontSize: '10px',
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: '20px', marginBottom: '4px' }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
};

// Mock pages
const Login = () => (
  <div style={{ padding: '60px 20px 20px' }}>
    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 8px 0' }}>Welcome to GigPro</h1>
      <p style={{ color: '#64748b' }}>Sign in to manage your gigs</p>
    </div>
    
    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <input 
        type="email" 
        placeholder="Email" 
        style={{ width: '100%', padding: '12px', margin: '0 0 16px 0', border: '1px solid #e2e8f0', borderRadius: '8px' }}
      />
      <input 
        type="password" 
        placeholder="Password" 
        style={{ width: '100%', padding: '12px', margin: '0 0 24px 0', border: '1px solid #e2e8f0', borderRadius: '8px' }}
      />
      <button 
        style={{ 
          width: '100%', 
          padding: '12px', 
          backgroundColor: '#7c3aed', 
          color: 'white', 
          border: 'none', 
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: 'pointer',
        }}
      >
        Sign In
      </button>
    </div>
  </div>
);

const Register = () => <div>Register Page</div>;

const Dashboard = () => (
  <div style={{ padding: '20px', paddingBottom: '80px' }}>
    <div style={{ backgroundColor: '#7c3aed', padding: '20px', borderRadius: '12px', color: 'white', marginBottom: '20px' }}>
      <h2 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>Welcome back!</h2>
      <p style={{ margin: 0, opacity: 0.8 }}>Here's your gig overview</p>
    </div>
    
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
      {[
        { title: 'This Month\'s Gigs', value: '12', color: '#7c3aed' },
        { title: 'Total Earnings', value: '$8,450', color: '#059669' },
        { title: 'Pending Invoices', value: '3', color: '#dc2626' },
        { title: 'Active Clients', value: '28', color: '#2563eb' },
      ].map((stat, index) => (
        <div key={index} style={{
          backgroundColor: 'white',
          padding: '16px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderLeft: `4px solid ${stat.color}`,
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: stat.color, marginBottom: '8px' }}>
            {stat.value}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>{stat.title}</div>
        </div>
      ))}
    </div>
    
    <div style={{
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Upcoming Gigs</h3>
      {[
        { title: 'Wedding Reception', date: 'Aug 8', location: 'Grand Hotel', fee: '$1,200' },
        { title: 'Corporate Event', date: 'Aug 12', location: 'Convention Center', fee: '$800' },
      ].map((gig, index) => (
        <div key={index} style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 0',
          borderBottom: index < 1 ? '1px solid #e2e8f0' : 'none',
        }}>
          <div>
            <div style={{ fontWeight: '600', marginBottom: '4px' }}>{gig.title}</div>
            <div style={{ fontSize: '14px', color: '#64748b' }}>{gig.date} • {gig.location}</div>
          </div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#059669' }}>{gig.fee}</div>
        </div>
      ))}
    </div>
  </div>
);

const Calendar = () => <div style={{ padding: '20px' }}>Calendar View</div>;
const Clients = () => <div style={{ padding: '20px' }}>Clients View</div>;
const Invoices = () => <div style={{ padding: '20px' }}>Invoices View</div>;
const Profile = () => <div style={{ padding: '20px' }}>Profile View</div>;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

export default function MobileWebApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <MobileApp />
    </QueryClientProvider>
  );
}