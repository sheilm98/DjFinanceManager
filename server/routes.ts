import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertClientSchema, insertGigSchema, insertInvoiceSchema } from "@shared/schema";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import pgSession from "connect-pg-simple";
import { pool } from "./db"; // Import the pool from our db file
import crypto from 'crypto';

export async function registerRoutes(app: Express): Promise<Server> {
  const PgStore = pgSession(session);
  const SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

  // Setup session
  app.use(
    session({
      store: new PgStore({
        pool,
        tableName: 'session', // Session table name
        createTableIfMissing: true, // Create the table if it doesn't exist
      }),
      secret: SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: { secure: process.env.NODE_ENV === "production", maxAge: 24 * 60 * 60 * 1000 },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport
  passport.use(
    new LocalStrategy(
      { usernameField: 'email' },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (!user) {
            return done(null, false, { message: 'Incorrect email.' });
          }
          // In a real app, we'd properly hash and compare passwords
          if (user.password !== password) {
            return done(null, false, { message: 'Incorrect password.' });
          }
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Middleware to check if user is authenticated
  const isAuthenticated = (req: Request, res: Response, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(validatedData.email);
      
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }
      
      const user = await storage.createUser(validatedData);
      const { password, ...userWithoutPassword } = user;
      
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Error during login after registration" });
        }
        return res.status(201).json(userWithoutPassword);
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post('/api/auth/login', passport.authenticate('local'), (req, res) => {
    const { password, ...userWithoutPassword } = req.user as any;
    res.json(userWithoutPassword);
  });

  app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Error during logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get('/api/auth/user', (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const { password, ...userWithoutPassword } = req.user as any;
    res.json(userWithoutPassword);
  });

  // User routes
  app.put('/api/user', isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const updatedUser = await storage.updateUser(user.id, req.body);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Client routes
  app.get('/api/clients', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const clients = await storage.getClients(userId);
      res.json(clients);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/clients/:id', isAuthenticated, async (req, res) => {
    try {
      const client = await storage.getClient(parseInt(req.params.id));
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      if (client.userId !== (req.user as any).id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      res.json(client);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/clients', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const validatedData = insertClientSchema.parse({ ...req.body, userId });
      const client = await storage.createClient(validatedData);
      res.status(201).json(client);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put('/api/clients/:id', isAuthenticated, async (req, res) => {
    try {
      const clientId = parseInt(req.params.id);
      const client = await storage.getClient(clientId);
      
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      if (client.userId !== (req.user as any).id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const updatedClient = await storage.updateClient(clientId, req.body);
      res.json(updatedClient);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete('/api/clients/:id', isAuthenticated, async (req, res) => {
    try {
      const clientId = parseInt(req.params.id);
      const client = await storage.getClient(clientId);
      
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      if (client.userId !== (req.user as any).id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      await storage.deleteClient(clientId);
      res.json({ message: "Client deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Gig routes
  app.get('/api/gigs', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const gigs = await storage.getGigs(userId);
      res.json(gigs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/gigs/upcoming', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const gigs = await storage.getUpcomingGigs(userId, limit);
      res.json(gigs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/gigs/month/:year/:month', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const year = parseInt(req.params.year);
      const month = parseInt(req.params.month) - 1; // JS months are 0-indexed
      const gigs = await storage.getGigsByMonth(userId, year, month);
      res.json(gigs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/gigs/:id', isAuthenticated, async (req, res) => {
    try {
      const gig = await storage.getGig(parseInt(req.params.id));
      if (!gig) {
        return res.status(404).json({ message: "Gig not found" });
      }
      if (gig.userId !== (req.user as any).id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      res.json(gig);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/gigs', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const formData = { ...req.body, userId };
      
      // Convert date string to Date object if it's a string
      if (formData.date && typeof formData.date === 'string') {
        formData.date = new Date(formData.date);
      }
      
      const validatedData = insertGigSchema.parse(formData);
      const gig = await storage.createGig(validatedData);
      res.status(201).json(gig);
    } catch (error: any) {
      console.error('Gig creation error:', error);
      res.status(400).json({ message: error.message });
    }
  });

  app.put('/api/gigs/:id', isAuthenticated, async (req, res) => {
    try {
      const gigId = parseInt(req.params.id);
      const gig = await storage.getGig(gigId);
      
      if (!gig) {
        return res.status(404).json({ message: "Gig not found" });
      }
      
      if (gig.userId !== (req.user as any).id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const formData = { ...req.body };
      
      // Convert date string to Date object if it's a string
      if (formData.date && typeof formData.date === 'string') {
        formData.date = new Date(formData.date);
      }
      
      const updatedGig = await storage.updateGig(gigId, formData);
      res.json(updatedGig);
    } catch (error: any) {
      console.error('Gig update error:', error);
      res.status(400).json({ message: error.message });
    }
  });

  app.delete('/api/gigs/:id', isAuthenticated, async (req, res) => {
    try {
      const gigId = parseInt(req.params.id);
      const gig = await storage.getGig(gigId);
      
      if (!gig) {
        return res.status(404).json({ message: "Gig not found" });
      }
      
      if (gig.userId !== (req.user as any).id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      await storage.deleteGig(gigId);
      res.json({ message: "Gig deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Invoice routes
  app.get('/api/invoices', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const invoices = await storage.getInvoices(userId);
      res.json(invoices);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/invoices/status/:status', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const status = req.params.status as any;
      const invoices = await storage.getInvoicesByStatus(userId, status);
      res.json(invoices);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/invoices/recent', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const invoices = await storage.getRecentInvoices(userId, limit);
      res.json(invoices);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/invoices/:id', isAuthenticated, async (req, res) => {
    try {
      const invoice = await storage.getInvoice(parseInt(req.params.id));
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      if (invoice.userId !== (req.user as any).id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      res.json(invoice);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/invoices', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const formData = { ...req.body, userId };
      
      // Convert date strings to Date objects
      if (formData.issuedDate && typeof formData.issuedDate === 'string') {
        formData.issuedDate = new Date(formData.issuedDate);
      }
      if (formData.dueDate && typeof formData.dueDate === 'string') {
        formData.dueDate = new Date(formData.dueDate);
      }
      
      const validatedData = insertInvoiceSchema.parse(formData);
      const invoice = await storage.createInvoice(validatedData);
      res.status(201).json(invoice);
    } catch (error: any) {
      console.error('Invoice creation error:', error);
      res.status(400).json({ message: error.message });
    }
  });

  app.put('/api/invoices/:id', isAuthenticated, async (req, res) => {
    try {
      const invoiceId = parseInt(req.params.id);
      const invoice = await storage.getInvoice(invoiceId);
      
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      if (invoice.userId !== (req.user as any).id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const formData = { ...req.body };
      
      // Convert date strings to Date objects
      if (formData.issuedDate && typeof formData.issuedDate === 'string') {
        formData.issuedDate = new Date(formData.issuedDate);
      }
      if (formData.dueDate && typeof formData.dueDate === 'string') {
        formData.dueDate = new Date(formData.dueDate);
      }
      
      const updatedInvoice = await storage.updateInvoice(invoiceId, formData);
      res.json(updatedInvoice);
    } catch (error: any) {
      console.error('Invoice update error:', error);
      res.status(400).json({ message: error.message });
    }
  });

  app.put('/api/invoices/:id/status', isAuthenticated, async (req, res) => {
    try {
      const invoiceId = parseInt(req.params.id);
      const { status } = req.body;
      const invoice = await storage.getInvoice(invoiceId);
      
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      if (invoice.userId !== (req.user as any).id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const updatedInvoice = await storage.updateInvoiceStatus(invoiceId, status);
      res.json(updatedInvoice);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete('/api/invoices/:id', isAuthenticated, async (req, res) => {
    try {
      const invoiceId = parseInt(req.params.id);
      const invoice = await storage.getInvoice(invoiceId);
      
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      if (invoice.userId !== (req.user as any).id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      await storage.deleteInvoice(invoiceId);
      res.json({ message: "Invoice deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
