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
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Demo credentials
    if (email === 'dj@gigpro.com' && password === 'demo123') {
      const mockUser = {
        id: 1,
        name: 'DJ Mike',
        email: 'dj@gigpro.com',
        businessName: 'Mike\'s DJ Services',
      };
      setUser(mockUser);
      setCurrentRoute('/dashboard');
    } else {
      alert('Invalid credentials. Use: dj@gigpro.com / demo123');
    }
    setIsLoading(false);
  };

  const register = async (name: string, email: string, password: string, businessName: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser = {
      id: Date.now(),
      name,
      email,
      businessName,
    };
    setUser(newUser);
    setCurrentRoute('/dashboard');
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    setCurrentRoute('/');
  };

  // Simple routing
  const routes: Record<string, React.ComponentType> = {
    '/': () => user ? <Dashboard user={user} logout={logout} /> : <Login login={login} setRoute={setCurrentRoute} isLoading={isLoading} />,
    '/login': () => <Login login={login} setRoute={setCurrentRoute} isLoading={isLoading} />,
    '/register': () => <Register register={register} setRoute={setCurrentRoute} isLoading={isLoading} />,
    '/dashboard': () => <Dashboard user={user} logout={logout} />,
    '/calendar': Calendar,
    '/clients': Clients,
    '/invoices': Invoices,
    '/profile': () => <Profile user={user} logout={logout} />,
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

// Enhanced Login Component
const Login = ({ login, setRoute, isLoading }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      alert('Please fill in all fields');
      return;
    }
    await login(email, password);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '20px'
    }}>
      {/* Logo/Brand Section */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{
          width: '80px',
          height: '80px',
          backgroundColor: 'rgba(255,255,255,0.2)',
          borderRadius: '50%',
          margin: '0 auto 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px',
          color: 'white',
          border: '2px solid rgba(255,255,255,0.3)',
        }}>
          🎧
        </div>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: 'bold', 
          margin: '0 0 8px 0', 
          color: 'white',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          GigPro
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', margin: 0 }}>
          Your DJ business, simplified
        </p>
      </div>
      
      {/* Login Form */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '32px 24px', 
        borderRadius: '20px', 
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: '600', 
          margin: '0 0 8px 0', 
          color: '#1f2937',
          textAlign: 'center'
        }}>
          Welcome Back
        </h2>
        <p style={{ 
          color: '#6b7280', 
          textAlign: 'center', 
          marginBottom: '32px',
          fontSize: '14px'
        }}>
          Sign in to manage your gigs and grow your business
        </p>

        {/* Demo Credentials Info */}
        <div style={{
          backgroundColor: '#f3f4f6',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '24px',
          border: '1px solid #e5e7eb'
        }}>
          <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
            Demo Credentials:
          </p>
          <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#6b7280' }}>
            Email: <strong>dj@gigpro.com</strong>
          </p>
          <p style={{ margin: '0', fontSize: '13px', color: '#6b7280' }}>
            Password: <strong>demo123</strong>
          </p>
        </div>
        
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px' }}>
            <input 
              type="email" 
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '16px', 
                border: '2px solid #e5e7eb', 
                borderRadius: '12px',
                fontSize: '16px',
                transition: 'border-color 0.3s',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#7c3aed'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <input 
              type="password" 
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '16px', 
                border: '2px solid #e5e7eb', 
                borderRadius: '12px',
                fontSize: '16px',
                transition: 'border-color 0.3s',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#7c3aed'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>
          <button 
            type="submit"
            disabled={isLoading}
            style={{ 
              width: '100%', 
              padding: '16px', 
              background: isLoading ? '#9ca3af' : 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)', 
              color: 'white', 
              border: 'none', 
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
            }}
            onMouseDown={(e) => !isLoading && (e.target.style.transform = 'translateY(1px)')}
            onMouseUp={(e) => e.target.style.transform = 'translateY(0)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>

      {/* Register Link */}
      <div style={{ 
        backgroundColor: 'rgba(255,255,255,0.9)', 
        padding: '20px', 
        borderRadius: '16px',
        textAlign: 'center'
      }}>
        <p style={{ margin: '0', color: '#6b7280', fontSize: '14px' }}>
          Don't have an account?{' '}
          <button
            onClick={() => setRoute('/register')}
            style={{
              background: 'none',
              border: 'none',
              color: '#7c3aed',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '14px',
              textDecoration: 'underline'
            }}
          >
            Sign up now
          </button>
        </p>
      </div>
    </div>
  );
};

// Enhanced Register Component
const Register = ({ register, setRoute, isLoading }: any) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      alert('Please fill in all required fields');
      return;
    }
    await register(name, email, password, businessName);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{
          width: '70px',
          height: '70px',
          backgroundColor: 'rgba(255,255,255,0.2)',
          borderRadius: '50%',
          margin: '0 auto 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '28px',
          color: 'white',
          border: '2px solid rgba(255,255,255,0.3)',
        }}>
          🎧
        </div>
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: 'bold', 
          margin: '0 0 8px 0', 
          color: 'white',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          Join GigPro
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', margin: 0 }}>
          Start managing your DJ business today
        </p>
      </div>
      
      {/* Register Form */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '32px 24px', 
        borderRadius: '20px', 
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>        
        <form onSubmit={handleRegister}>
          <div style={{ marginBottom: '16px' }}>
            <input 
              type="text" 
              placeholder="Full Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '16px', 
                border: '2px solid #e5e7eb', 
                borderRadius: '12px',
                fontSize: '16px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#7c3aed'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <input 
              type="email" 
              placeholder="Email Address *"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '16px', 
                border: '2px solid #e5e7eb', 
                borderRadius: '12px',
                fontSize: '16px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#7c3aed'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <input 
              type="password" 
              placeholder="Password *"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '16px', 
                border: '2px solid #e5e7eb', 
                borderRadius: '12px',
                fontSize: '16px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#7c3aed'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <input 
              type="text" 
              placeholder="Business Name (Optional)"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '16px', 
                border: '2px solid #e5e7eb', 
                borderRadius: '12px',
                fontSize: '16px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#7c3aed'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>
          <button 
            type="submit"
            disabled={isLoading}
            style={{ 
              width: '100%', 
              padding: '16px', 
              background: isLoading ? '#9ca3af' : 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)', 
              color: 'white', 
              border: 'none', 
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
            }}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
      </div>

      {/* Login Link */}
      <div style={{ 
        backgroundColor: 'rgba(255,255,255,0.9)', 
        padding: '20px', 
        borderRadius: '16px',
        textAlign: 'center'
      }}>
        <p style={{ margin: '0', color: '#6b7280', fontSize: '14px' }}>
          Already have an account?{' '}
          <button
            onClick={() => setRoute('/login')}
            style={{
              background: 'none',
              border: 'none',
              color: '#7c3aed',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '14px',
              textDecoration: 'underline'
            }}
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

const Dashboard = ({ user, logout }: any) => (
  <div style={{ padding: '20px', paddingBottom: '80px' }}>
    <div style={{ backgroundColor: '#7c3aed', padding: '20px', borderRadius: '12px', color: 'white', marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h2 style={{ margin: 0, fontSize: '24px' }}>Welcome back, {user?.name?.split(' ')[0]}!</h2>
        <button
          onClick={logout}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>
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

const Calendar = () => (
  <div style={{ padding: '20px', paddingBottom: '80px' }}>
    <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Calendar</h2>
    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <p style={{ color: '#64748b', textAlign: 'center' }}>📅 Calendar view coming soon with gig scheduling</p>
    </div>
  </div>
);

const Clients = () => (
  <div style={{ padding: '20px', paddingBottom: '80px' }}>
    <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Clients</h2>
    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <p style={{ color: '#64748b', textAlign: 'center' }}>👥 Client management coming soon</p>
    </div>
  </div>
);

const Invoices = () => (
  <div style={{ padding: '20px', paddingBottom: '80px' }}>
    <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Invoices</h2>
    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <p style={{ color: '#64748b', textAlign: 'center' }}>📄 Invoice management coming soon</p>
    </div>
  </div>
);

const Profile = ({ user, logout }: any) => (
  <div style={{ padding: '20px', paddingBottom: '80px' }}>
    <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Profile</h2>
    
    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{
          width: '80px',
          height: '80px',
          backgroundColor: '#7c3aed',
          borderRadius: '50%',
          margin: '0 auto 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px',
          color: 'white',
          fontWeight: 'bold'
        }}>
          {user?.name?.charAt(0) || 'U'}
        </div>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '600' }}>{user?.name}</h3>
        <p style={{ margin: 0, color: '#64748b' }}>{user?.email}</p>
      </div>
      
      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px', display: 'block' }}>Business Name</label>
          <p style={{ margin: 0, fontSize: '16px', fontWeight: '500' }}>{user?.businessName || 'Not set'}</p>
        </div>
        
        <button
          onClick={logout}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          Sign Out
        </button>
      </div>
    </div>
  </div>
);

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