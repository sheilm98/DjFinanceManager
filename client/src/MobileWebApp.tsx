import React, { useState, useEffect, createContext, useContext } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import jsPDF from 'jspdf';

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

// Mock data for comprehensive features
const mockData = {
  clients: [
    { id: 1, name: 'Paradise Beach Club', email: 'events@paradisebeach.com', phone: '+1 555-0123', type: 'Venue', notes: 'Regular client, pays on time', tags: ['repeat-client', 'venue'] },
    { id: 2, name: 'Sarah Johnson', email: 'sarah.j@email.com', phone: '+1 555-0456', type: 'Private', notes: 'Wedding DJ services', tags: ['private-events'] },
    { id: 3, name: 'Downtown Events Ltd', email: 'booking@downtownevents.com', phone: '+1 555-0789', type: 'Promoter', notes: 'Corporate events specialist', tags: ['promoter', 'corporate'] }
  ],
  gigs: [
    { id: 1, clientId: 1, title: 'Saturday Night Dance', date: '2025-01-18', startTime: '22:00', endTime: '03:00', location: 'Paradise Beach Club, Miami', fee: 800, status: 'confirmed' },
    { id: 2, clientId: 2, title: 'Wedding Reception', date: '2025-01-25', startTime: '19:00', endTime: '24:00', location: 'Garden Hotel Ballroom', fee: 1200, status: 'confirmed' },
    { id: 3, clientId: 3, title: 'Corporate Launch Party', date: '2025-02-01', startTime: '18:00', endTime: '23:00', location: 'Downtown Convention Center', fee: 1500, status: 'pending' }
  ],
  invoices: [
    { id: 1, gigId: 1, clientId: 1, invoiceNumber: 'INV-2025-001', amount: 800, status: 'paid', dueDate: '2025-01-15', issuedDate: '2025-01-01' },
    { id: 2, gigId: 2, clientId: 2, invoiceNumber: 'INV-2025-002', amount: 1200, status: 'sent', dueDate: '2025-01-20', issuedDate: '2025-01-05' },
    { id: 3, gigId: 3, clientId: 3, invoiceNumber: 'INV-2025-003', amount: 1500, status: 'draft', dueDate: '2025-02-05', issuedDate: '2025-01-10' }
  ]
};

// Simple mobile-style app component
// PDF Generation Function
const generateInvoicePDF = (invoice: any, user: any, client: any, gig?: any) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;
  
  // Colors
  const primaryColor = [124, 58, 237]; // #7c3aed
  const textColor = [31, 41, 55]; // #1f2937
  const grayColor = [107, 114, 128]; // #6b7280
  
  // Header with DJ Business Info
  pdf.setFillColor(...primaryColor);
  pdf.rect(0, 0, pageWidth, 40, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text(user.businessName || `${user.name}'s DJ Services`, 20, 25);
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`DJ: ${user.name}`, 20, 35);
  
  // Invoice Title and Number
  pdf.setTextColor(...textColor);
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('INVOICE', pageWidth - 60, 60);
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Invoice #: ${invoice.invoiceNumber}`, pageWidth - 80, 70);
  pdf.text(`Date: ${new Date(invoice.issuedDate).toLocaleDateString()}`, pageWidth - 80, 80);
  pdf.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, pageWidth - 80, 90);
  
  // Bill To Section
  pdf.setFont('helvetica', 'bold');
  pdf.text('BILL TO:', 20, 70);
  
  pdf.setFont('helvetica', 'normal');
  let yPos = 80;
  pdf.text(client.name, 20, yPos);
  if (client.email) {
    yPos += 10;
    pdf.text(`Email: ${client.email}`, 20, yPos);
  }
  if (client.phone) {
    yPos += 10;
    pdf.text(`Phone: ${client.phone}`, 20, yPos);
  }
  
  // Service Details
  yPos += 30;
  pdf.setFont('helvetica', 'bold');
  pdf.text('SERVICE DETAILS:', 20, yPos);
  
  // Table Header
  yPos += 15;
  pdf.setFillColor(248, 250, 252);
  pdf.rect(20, yPos - 5, pageWidth - 40, 15, 'F');
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('Description', 25, yPos + 5);
  pdf.text('Amount', pageWidth - 60, yPos + 5);
  
  // Service Row
  yPos += 20;
  pdf.setFont('helvetica', 'normal');
  
  let description = 'DJ Services';
  if (gig) {
    description = `DJ Services - ${gig.title}`;
    if (gig.location) description += ` at ${gig.location}`;
    if (gig.date) description += ` on ${new Date(gig.date).toLocaleDateString()}`;
    if (gig.startTime && gig.endTime) description += ` (${gig.startTime} - ${gig.endTime})`;
  }
  
  // Wrap long description
  const splitDescription = pdf.splitTextToSize(description, pageWidth - 100);
  pdf.text(splitDescription, 25, yPos);
  
  const descriptionHeight = splitDescription.length * 5;
  pdf.text(`$${invoice.amount.toFixed(2)}`, pageWidth - 60, yPos);
  
  // Line under service
  yPos += Math.max(10, descriptionHeight + 5);
  pdf.setDrawColor(...grayColor);
  pdf.line(20, yPos, pageWidth - 20, yPos);
  
  // Total Section
  yPos += 20;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text('TOTAL AMOUNT DUE:', pageWidth - 120, yPos);
  pdf.setFontSize(16);
  pdf.text(`$${invoice.amount.toFixed(2)}`, pageWidth - 60, yPos);
  
  // Payment Information
  if (user.paymentInstructions) {
    yPos += 30;
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PAYMENT INSTRUCTIONS:', 20, yPos);
    
    yPos += 10;
    pdf.setFont('helvetica', 'normal');
    const paymentLines = pdf.splitTextToSize(user.paymentInstructions, pageWidth - 40);
    pdf.text(paymentLines, 20, yPos);
    yPos += paymentLines.length * 5;
  }
  
  // Payment Terms
  if (user.paymentTerms) {
    yPos += 10;
    pdf.setFont('helvetica', 'bold');
    pdf.text('PAYMENT TERMS:', 20, yPos);
    
    yPos += 10;
    pdf.setFont('helvetica', 'normal');
    pdf.text(user.paymentTerms, 20, yPos);
  }
  
  // Notes
  if (invoice.notes) {
    yPos += 20;
    pdf.setFont('helvetica', 'bold');
    pdf.text('NOTES:', 20, yPos);
    
    yPos += 10;
    pdf.setFont('helvetica', 'normal');
    const notesLines = pdf.splitTextToSize(invoice.notes, pageWidth - 40);
    pdf.text(notesLines, 20, yPos);
    yPos += notesLines.length * 5;
  }
  
  // Footer
  const footerY = pageHeight - 30;
  pdf.setTextColor(...grayColor);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Thank you for your business!', pageWidth / 2, footerY, { align: 'center' });
  
  if (user.email) {
    pdf.text(`Contact: ${user.email}`, pageWidth / 2, footerY + 8, { align: 'center' });
  }
  
  // Save PDF
  try {
    const fileName = `Invoice_${invoice.invoiceNumber}_${client.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    pdf.save(fileName);
    
    // Show success message
    setTimeout(() => {
      alert(`✅ Invoice PDF exported successfully!\nFile: ${fileName}`);
    }, 100);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('❌ Error generating PDF. Please try again.');
  }
};

const MobileApp = () => {
  const [currentRoute, setCurrentRoute] = useState('/');
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [appData, setAppData] = useState(mockData);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (email === 'dj@gigpro.com' && password === 'demo123') {
      const mockUser = {
        id: 1,
        name: 'DJ Mike',
        email: 'dj@gigpro.com',
        stageName: 'DJ Mike',
        businessName: 'Mike\'s DJ Services',
        paymentTerms: 'Net 14 days',
        paymentMethod: 'Bank Transfer',
        paymentInstructions: 'Bank: Chase Bank, Acc: ****1234, Routing: 021000021',
        logoUrl: null
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
      stageName: name,
      businessName: businessName || `${name}'s DJ Services`,
      paymentTerms: 'Net 14 days',
      paymentMethod: 'Bank Transfer',
      paymentInstructions: '',
      logoUrl: null
    };
    setUser(newUser);
    setCurrentRoute('/dashboard');
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    setCurrentRoute('/');
  };

  // Helper functions for data management
  const getClientById = (id: number) => appData.clients.find(c => c.id === id);
  const getGigById = (id: number) => appData.gigs.find(g => g.id === id);
  const getInvoiceById = (id: number) => appData.invoices.find(i => i.id === id);

  const addClient = (client: any) => {
    const newClient = { ...client, id: Date.now() };
    setAppData(prev => ({ ...prev, clients: [...prev.clients, newClient] }));
    return newClient;
  };

  const addGig = (gig: any) => {
    const newGig = { ...gig, id: Date.now() };
    setAppData(prev => ({ ...prev, gigs: [...prev.gigs, newGig] }));
    return newGig;
  };

  const addInvoice = (invoice: any) => {
    const newInvoice = { ...invoice, id: Date.now(), invoiceNumber: `INV-2025-${String(Date.now()).slice(-3)}` };
    setAppData(prev => ({ ...prev, invoices: [...prev.invoices, newInvoice] }));
    return newInvoice;
  };

  const updateInvoiceStatus = (invoiceId: number, status: string) => {
    setAppData(prev => ({
      ...prev,
      invoices: prev.invoices.map(i => i.id === invoiceId ? { ...i, status } : i)
    }));
  };

  // Simple routing
  const routes: Record<string, React.ComponentType> = {
    '/': () => user ? <Dashboard user={user} appData={appData} setRoute={setCurrentRoute} /> : <Login login={login} setRoute={setCurrentRoute} isLoading={isLoading} />,
    '/login': () => <Login login={login} setRoute={setCurrentRoute} isLoading={isLoading} />,
    '/register': () => <Register register={register} setRoute={setCurrentRoute} isLoading={isLoading} />,
    '/dashboard': () => <Dashboard user={user} appData={appData} setRoute={setCurrentRoute} />,
    '/calendar': () => <Calendar user={user} appData={appData} addGig={addGig} setRoute={setCurrentRoute} />,
    '/clients': () => <Clients user={user} appData={appData} addClient={addClient} setRoute={setCurrentRoute} />,
    '/invoices': () => <Invoices user={user} appData={appData} addInvoice={addInvoice} updateInvoiceStatus={updateInvoiceStatus} getClientById={getClientById} getGigById={getGigById} setRoute={setCurrentRoute} />,
    '/profile': () => <Profile user={user} logout={logout} />,
    '/add-gig': () => <AddGig user={user} appData={appData} addGig={addGig} setRoute={setCurrentRoute} />,
    '/add-client': () => <AddClient user={user} addClient={addClient} setRoute={setCurrentRoute} />,
    '/create-invoice': () => <CreateInvoice user={user} appData={appData} addInvoice={addInvoice} getClientById={getClientById} getGigById={getGigById} setRoute={setCurrentRoute} />,
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
                boxSizing: 'border-box',
                color: '#374151',
                backgroundColor: '#ffffff'
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
                boxSizing: 'border-box',
                color: '#374151',
                backgroundColor: '#ffffff'
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
                boxSizing: 'border-box',
                color: '#374151',
                backgroundColor: '#ffffff'
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
                boxSizing: 'border-box',
                color: '#374151',
                backgroundColor: '#ffffff'
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
                boxSizing: 'border-box',
                color: '#374151',
                backgroundColor: '#ffffff'
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
                boxSizing: 'border-box',
                color: '#374151',
                backgroundColor: '#ffffff'
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

const Dashboard = ({ user, appData, setRoute }: any) => {
  const upcomingGigs = appData.gigs.filter((gig: any) => new Date(gig.date) >= new Date()).slice(0, 3);
  const pendingInvoices = appData.invoices.filter((invoice: any) => invoice.status === 'sent' || invoice.status === 'overdue');
  const overdueInvoices = appData.invoices.filter((invoice: any) => {
    if (invoice.status === 'paid') return false;
    return new Date(invoice.dueDate) < new Date();
  });
  
  const totalRevenue = appData.invoices.filter((i: any) => i.status === 'paid').reduce((sum: number, i: any) => sum + i.amount, 0);
  const pendingRevenue = pendingInvoices.reduce((sum: number, i: any) => sum + i.amount, 0);

  return (
    <div style={{ padding: '20px', paddingBottom: '80px' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#7c3aed', padding: '20px', borderRadius: '12px', color: 'white', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, fontSize: '24px', marginBottom: '8px' }}>Welcome back, {user?.name?.split(' ')[0]}!</h2>
        <p style={{ margin: 0, opacity: 0.8 }}>Here's your business overview</p>
      </div>

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Revenue (Paid)</h3>
          <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#059669' }}>${totalRevenue.toLocaleString()}</p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Pending</h3>
          <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#d97706' }}>${pendingRevenue.toLocaleString()}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>Quick Actions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <button
            onClick={() => setRoute('/create-invoice')}
            style={{
              backgroundColor: '#7c3aed',
              color: 'white',
              border: 'none',
              padding: '16px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              textAlign: 'center'
            }}
          >
            📄 Create Invoice
          </button>
          <button
            onClick={() => setRoute('/add-gig')}
            style={{
              backgroundColor: '#059669',
              color: 'white',
              border: 'none',
              padding: '16px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              textAlign: 'center'
            }}
          >
            🎵 Add Gig
          </button>
        </div>
      </div>

      {/* Alerts */}
      {overdueInvoices.length > 0 && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#dc2626', fontSize: '16px', fontWeight: '600' }}>⚠️ Overdue Invoices</h4>
          <p style={{ margin: 0, color: '#991b1b', fontSize: '14px' }}>
            You have {overdueInvoices.length} overdue invoice{overdueInvoices.length > 1 ? 's' : ''} totaling ${overdueInvoices.reduce((sum: number, i: any) => sum + i.amount, 0).toLocaleString()}
          </p>
        </div>
      )}

      {/* Upcoming Gigs */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Upcoming Gigs</h3>
          <button
            onClick={() => setRoute('/calendar')}
            style={{ background: 'none', border: 'none', color: '#7c3aed', fontSize: '14px', cursor: 'pointer' }}
          >
            View All →
          </button>
        </div>
        {upcomingGigs.length > 0 ? (
          upcomingGigs.map((gig: any) => {
            const client = appData.clients.find((c: any) => c.id === gig.clientId);
            return (
              <div key={gig.id} style={{ backgroundColor: 'white', padding: '16px', borderRadius: '12px', marginBottom: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600' }}>{gig.title}</h4>
                    <p style={{ margin: '0 0 4px 0', color: '#64748b', fontSize: '14px' }}>{client?.name}</p>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>
                      {new Date(gig.date).toLocaleDateString()} at {gig.startTime}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#059669' }}>${gig.fee}</p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <p style={{ color: '#64748b', margin: 0 }}>No upcoming gigs scheduled</p>
          </div>
        )}
      </div>

      {/* Recent Invoices */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Recent Invoices</h3>
          <button
            onClick={() => setRoute('/invoices')}
            style={{ background: 'none', border: 'none', color: '#7c3aed', fontSize: '14px', cursor: 'pointer' }}
          >
            View All →
          </button>
        </div>
        {appData.invoices.slice(0, 3).map((invoice: any) => {
          const client = appData.clients.find((c: any) => c.id === invoice.clientId);
          const statusColors = {
            paid: '#059669',
            sent: '#d97706',
            draft: '#64748b',
            overdue: '#dc2626'
          };
          return (
            <div key={invoice.id} style={{ backgroundColor: 'white', padding: '16px', borderRadius: '12px', marginBottom: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600' }}>{invoice.invoiceNumber}</h4>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>{client?.name}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 'bold' }}>${invoice.amount}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                    <span style={{ 
                      fontSize: '12px', 
                      fontWeight: '600', 
                      color: statusColors[invoice.status as keyof typeof statusColors],
                      backgroundColor: `${statusColors[invoice.status as keyof typeof statusColors]}20`,
                      padding: '4px 8px',
                      borderRadius: '4px'
                    }}>
                      {invoice.status.toUpperCase()}
                    </span>
                    <button
                      onClick={() => {
                        const gig = appData.gigs.find((g: any) => g.id === invoice.gigId);
                        generateInvoicePDF(invoice, user, client, gig);
                      }}
                      style={{
                        backgroundColor: '#7c3aed',
                        color: 'white',
                        border: 'none',
                        padding: '4px 6px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        cursor: 'pointer'
                      }}
                    >
                      📄
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Calendar Component with Gig Management
const Calendar = ({ user, appData, addGig, setRoute }: any) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [viewMode, setViewMode] = useState('month');

  const gigsThisMonth = appData.gigs.filter((gig: any) => {
    const gigDate = new Date(gig.date);
    const now = new Date();
    return gigDate.getMonth() === now.getMonth() && gigDate.getFullYear() === now.getFullYear();
  });

  return (
    <div style={{ padding: '20px', paddingBottom: '80px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Calendar</h2>
        <button
          onClick={() => setRoute('/add-gig')}
          style={{
            backgroundColor: '#7c3aed',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          + Add Gig
        </button>
      </div>

      {/* This Month's Gigs */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>This Month's Gigs ({gigsThisMonth.length})</h3>
        {gigsThisMonth.length > 0 ? (
          gigsThisMonth.map((gig: any) => {
            const client = appData.clients.find((c: any) => c.id === gig.clientId);
            return (
              <div key={gig.id} style={{ 
                padding: '16px', 
                border: '1px solid #e2e8f0', 
                borderRadius: '8px', 
                marginBottom: '12px',
                borderLeft: '4px solid #7c3aed'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600' }}>{gig.title}</h4>
                    <p style={{ margin: '0 0 4px 0', color: '#64748b', fontSize: '14px' }}>📍 {gig.location}</p>
                    <p style={{ margin: '0 0 4px 0', color: '#64748b', fontSize: '14px' }}>👤 {client?.name}</p>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                      🕐 {gig.startTime} - {gig.endTime}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 'bold', color: '#059669' }}>${gig.fee}</p>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      {new Date(gig.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p style={{ color: '#64748b', textAlign: 'center', margin: '20px 0' }}>No gigs scheduled this month</p>
        )}
      </div>

      {/* All Upcoming Gigs */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>All Upcoming Gigs</h3>
        {appData.gigs.filter((gig: any) => new Date(gig.date) >= new Date()).map((gig: any) => {
          const client = appData.clients.find((c: any) => c.id === gig.clientId);
          const isThisWeek = new Date(gig.date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
          
          return (
            <div key={gig.id} style={{ 
              padding: '12px', 
              border: '1px solid #e2e8f0', 
              borderRadius: '8px', 
              marginBottom: '8px',
              backgroundColor: isThisWeek ? '#f0f9ff' : 'transparent',
              borderLeft: isThisWeek ? '4px solid #0ea5e9' : '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '600' }}>{gig.title}</h4>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '12px' }}>
                    {new Date(gig.date).toLocaleDateString()} • {client?.name}
                  </p>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#059669' }}>${gig.fee}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Clients Component with Full Management
const Clients = ({ user, appData, addClient, setRoute }: any) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filteredClients = appData.clients.filter((client: any) => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || client.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div style={{ padding: '20px', paddingBottom: '80px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Clients</h2>
        <button
          onClick={() => setRoute('/add-client')}
          style={{
            backgroundColor: '#7c3aed',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          + Add Client
        </button>
      </div>

      {/* Search and Filter */}
      <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
        <div style={{ marginBottom: '12px' }}>
          <input
            type="text"
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              boxSizing: 'border-box',
              color: '#1f2937'
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['all', 'Venue', 'Private', 'Promoter'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              style={{
                padding: '6px 12px',
                border: filterType === type ? 'none' : '1px solid #e2e8f0',
                backgroundColor: filterType === type ? '#7c3aed' : 'white',
                color: filterType === type ? 'white' : '#64748b',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              {type === 'all' ? 'All' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Client List */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
          {filteredClients.length} Client{filteredClients.length !== 1 ? 's' : ''}
        </h3>
        {filteredClients.map((client: any) => {
          const clientGigs = appData.gigs.filter((g: any) => g.clientId === client.id);
          const clientInvoices = appData.invoices.filter((i: any) => i.clientId === client.id);
          const totalPaid = clientInvoices.filter((i: any) => i.status === 'paid').reduce((sum: number, i: any) => sum + i.amount, 0);
          
          return (
            <div key={client.id} style={{ 
              padding: '16px', 
              border: '1px solid #e2e8f0', 
              borderRadius: '8px', 
              marginBottom: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <h4 style={{ margin: '0 8px 0 0', fontSize: '16px', fontWeight: '600' }}>{client.name}</h4>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: '600',
                      color: '#7c3aed',
                      backgroundColor: '#f3f4f6',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      {client.type}
                    </span>
                  </div>
                  <p style={{ margin: '0 0 4px 0', color: '#64748b', fontSize: '14px' }}>📧 {client.email}</p>
                  <p style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '14px' }}>📱 {client.phone}</p>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#64748b' }}>
                    <span>🎵 {clientGigs.length} gigs</span>
                    <span>💰 ${totalPaid.toLocaleString()} earned</span>
                  </div>
                  {client.notes && (
                    <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>
                      "{client.notes}"
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Invoices Component with Full Management
const Invoices = ({ user, appData, addInvoice, updateInvoiceStatus, getClientById, getGigById, setRoute }: any) => {
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredInvoices = appData.invoices.filter((invoice: any) => {
    return statusFilter === 'all' || invoice.status === statusFilter;
  });

  const statusColors = {
    paid: '#059669',
    sent: '#d97706',
    draft: '#64748b',
    overdue: '#dc2626'
  };

  return (
    <div style={{ padding: '20px', paddingBottom: '80px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Invoices</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setRoute('/create-invoice')}
            style={{
              backgroundColor: '#7c3aed',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            + Create Invoice
          </button>
          {filteredInvoices.length > 0 && (
            <button
              onClick={() => {
                // Export all filtered invoices info
                alert(`Found ${filteredInvoices.length} invoice(s). Use PDF button on individual invoices to export.`);
              }}
              style={{
                backgroundColor: '#059669',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              📄 Export
            </button>
          )}
        </div>
      </div>

      {/* Status Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        {[
          { status: 'paid', label: 'Paid', count: appData.invoices.filter((i: any) => i.status === 'paid').length },
          { status: 'sent', label: 'Sent', count: appData.invoices.filter((i: any) => i.status === 'sent').length },
          { status: 'draft', label: 'Draft', count: appData.invoices.filter((i: any) => i.status === 'draft').length },
          { status: 'overdue', label: 'Overdue', count: appData.invoices.filter((i: any) => i.status === 'overdue' || (i.status !== 'paid' && new Date(i.dueDate) < new Date())).length }
        ].map(({ status, label, count }) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            style={{
              backgroundColor: statusFilter === status ? statusColors[status as keyof typeof statusColors] : 'white',
              color: statusFilter === status ? 'white' : statusColors[status as keyof typeof statusColors],
              border: `2px solid ${statusColors[status as keyof typeof statusColors]}`,
              padding: '12px',
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{count}</div>
            <div style={{ fontSize: '12px', marginTop: '4px' }}>{label}</div>
          </button>
        ))}
      </div>

      {/* Filter Buttons */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {['all', 'draft', 'sent', 'paid', 'overdue'].map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            style={{
              padding: '6px 12px',
              border: statusFilter === status ? 'none' : '1px solid #e2e8f0',
              backgroundColor: statusFilter === status ? '#7c3aed' : 'white',
              color: statusFilter === status ? 'white' : '#64748b',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Invoice List */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
          {filteredInvoices.length} Invoice{filteredInvoices.length !== 1 ? 's' : ''}
        </h3>
        {filteredInvoices.map((invoice: any) => {
          const client = getClientById(invoice.clientId);
          const gig = getGigById(invoice.gigId);
          const isOverdue = invoice.status !== 'paid' && new Date(invoice.dueDate) < new Date();
          const actualStatus = isOverdue ? 'overdue' : invoice.status;
          
          return (
            <div key={invoice.id} style={{ 
              padding: '16px', 
              border: '1px solid #e2e8f0', 
              borderRadius: '8px', 
              marginBottom: '12px',
              borderLeft: `4px solid ${statusColors[actualStatus as keyof typeof statusColors]}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <h4 style={{ margin: '0 8px 0 0', fontSize: '16px', fontWeight: '600' }}>{invoice.invoiceNumber}</h4>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: '600',
                      color: statusColors[actualStatus as keyof typeof statusColors],
                      backgroundColor: `${statusColors[actualStatus as keyof typeof statusColors]}20`,
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      {actualStatus.toUpperCase()}
                    </span>
                  </div>
                  <p style={{ margin: '0 0 4px 0', color: '#64748b', fontSize: '14px' }}>👤 {client?.name}</p>
                  {gig && <p style={{ margin: '0 0 4px 0', color: '#64748b', fontSize: '14px' }}>🎵 {gig.title}</p>}
                  <p style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '14px' }}>
                    📅 Due: {new Date(invoice.dueDate).toLocaleDateString()}
                  </p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {invoice.status === 'draft' && (
                      <button
                        onClick={() => updateInvoiceStatus(invoice.id, 'sent')}
                        style={{
                          backgroundColor: '#d97706',
                          color: 'white',
                          border: 'none',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          cursor: 'pointer'
                        }}
                      >
                        Send
                      </button>
                    )}
                    {(invoice.status === 'sent' || actualStatus === 'overdue') && (
                      <button
                        onClick={() => updateInvoiceStatus(invoice.id, 'paid')}
                        style={{
                          backgroundColor: '#059669',
                          color: 'white',
                          border: 'none',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          cursor: 'pointer'
                        }}
                      >
                        Mark Paid
                      </button>
                    )}
                    <button
                      onClick={() => {
                        const client = getClientById(invoice.clientId);
                        const gig = getGigById(invoice.gigId);
                        generateInvoicePDF(invoice, user, client, gig);
                      }}
                      style={{
                        backgroundColor: '#7c3aed',
                        color: 'white',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        cursor: 'pointer'
                      }}
                    >
                      📄 PDF
                    </button>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>${invoice.amount}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Add Gig Form
const AddGig = ({ user, appData, addGig, setRoute }: any) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [fee, setFee] = useState('');
  const [clientId, setClientId] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !startTime || !location || !fee) {
      alert('Please fill in all required fields');
      return;
    }

    const newGig = {
      title,
      date,
      startTime,
      endTime,
      location,
      fee: parseFloat(fee),
      clientId: clientId ? parseInt(clientId) : null,
      notes,
      status: 'confirmed'
    };

    addGig(newGig);
    setRoute('/calendar');
  };

  return (
    <div style={{ padding: '20px', paddingBottom: '80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <button
          onClick={() => setRoute('/calendar')}
          style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', marginRight: '12px' }}
        >
          ←
        </button>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Add New Gig</h2>
      </div>

      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Event Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Wedding Reception, Corporate Party"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box',
                color: '#1f2937'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  color: '#1f2937'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Fee *</label>
              <input
                type="number"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                placeholder="0"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  color: '#1f2937'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Start Time *</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  color: '#1f2937'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  color: '#1f2937'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Location *</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Grand Hotel Ballroom, 123 Main St"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box',
                color: '#1f2937'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Client</label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box',
                color: '#1f2937'
              }}
            >
              <option value="">Select a client (optional)</option>
              {appData.clients.map((client: any) => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Special requests, equipment needs, etc."
              rows={3}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box',
                resize: 'vertical',
                color: '#1f2937'
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: '#7c3aed',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Create Gig
          </button>
        </form>
      </div>
    </div>
  );
};

// Add Client Form
const AddClient = ({ user, addClient, setRoute }: any) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [type, setType] = useState('Private');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      alert('Please enter a client name');
      return;
    }

    const newClient = {
      name,
      email,
      phone,
      type,
      notes,
      tags: [type.toLowerCase()]
    };

    addClient(newClient);
    setRoute('/clients');
  };

  return (
    <div style={{ padding: '20px', paddingBottom: '80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <button
          onClick={() => setRoute('/clients')}
          style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', marginRight: '12px' }}
        >
          ←
        </button>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Add New Client</h2>
      </div>

      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Client or venue name"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="client@email.com"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 555-123-4567"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            >
              <option value="Private">Private Event</option>
              <option value="Venue">Venue/Club</option>
              <option value="Promoter">Event Promoter</option>
              <option value="Corporate">Corporate</option>
            </select>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Payment preferences, special requirements, etc."
              rows={3}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box',
                resize: 'vertical'
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: '#7c3aed',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Add Client
          </button>
        </form>
      </div>
    </div>
  );
};

// Create Invoice Form
const CreateInvoice = ({ user, appData, addInvoice, getClientById, getGigById, setRoute }: any) => {
  const [selectedGig, setSelectedGig] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  const handleGigSelect = (gigId: string) => {
    setSelectedGig(gigId);
    if (gigId) {
      const gig = getGigById(parseInt(gigId));
      if (gig) {
        setSelectedClient(gig.clientId.toString());
        setAmount(gig.fee.toString());
        // Set due date to 14 days from today
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 14);
        setDueDate(dueDate.toISOString().split('T')[0]);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !amount || !dueDate) {
      alert('Please fill in all required fields');
      return;
    }

    const newInvoice = {
      gigId: selectedGig ? parseInt(selectedGig) : null,
      clientId: parseInt(selectedClient),
      amount: parseFloat(amount),
      dueDate,
      notes,
      status: 'draft',
      issuedDate: new Date().toISOString().split('T')[0]
    };

    addInvoice(newInvoice);
    setRoute('/invoices');
  };

  return (
    <div style={{ padding: '20px', paddingBottom: '80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <button
          onClick={() => setRoute('/invoices')}
          style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', marginRight: '12px' }}
        >
          ←
        </button>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Create Invoice</h2>
      </div>

      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Select Gig (Optional)</label>
            <select
              value={selectedGig}
              onChange={(e) => handleGigSelect(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            >
              <option value="">Create custom invoice</option>
              {appData.gigs.map((gig: any) => (
                <option key={gig.id} value={gig.id}>
                  {gig.title} - {new Date(gig.date).toLocaleDateString()} - ${gig.fee}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Client *</label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            >
              <option value="">Select a client</option>
              {appData.clients.map((client: any) => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Amount *</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Due Date *</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Payment Terms & Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Payment instructions, additional details..."
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <button
              type="submit"
              style={{
                padding: '16px',
                backgroundColor: '#7c3aed',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Create Invoice
            </button>
            <button
              type="button"
              onClick={() => {
                // Create and immediately export
                if (!selectedClient || !amount || !dueDate) {
                  alert('Please fill in all required fields first');
                  return;
                }
                
                const tempInvoice = {
                  id: Date.now(),
                  invoiceNumber: `INV-2025-${String(Date.now()).slice(-3)}`,
                  gigId: selectedGig ? parseInt(selectedGig) : null,
                  clientId: parseInt(selectedClient),
                  amount: parseFloat(amount),
                  dueDate,
                  notes,
                  status: 'draft',
                  issuedDate: new Date().toISOString().split('T')[0]
                };
                
                const client = getClientById(parseInt(selectedClient));
                const gig = selectedGig ? getGigById(parseInt(selectedGig)) : null;
                generateInvoicePDF(tempInvoice, user, client, gig);
              }}
              style={{
                padding: '16px',
                backgroundColor: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              📄 Preview PDF
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

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