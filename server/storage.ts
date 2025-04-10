import { 
  users, type User, type InsertUser,
  clients, type Client, type InsertClient,
  gigs, type Gig, type InsertGig,
  invoices, type Invoice, type InsertInvoice,
  type InvoiceStatus
} from "@shared/schema";
import { eq, and, gte, lte, asc, desc } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
  // Clients
  getClients(userId: number): Promise<Client[]>;
  getClient(id: number): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<Client>): Promise<Client | undefined>;
  deleteClient(id: number): Promise<boolean>;
  
  // Gigs
  getGigs(userId: number): Promise<Gig[]>;
  getGigsByMonth(userId: number, year: number, month: number): Promise<Gig[]>;
  getUpcomingGigs(userId: number, limit?: number): Promise<Gig[]>;
  getGig(id: number): Promise<Gig | undefined>;
  createGig(gig: InsertGig): Promise<Gig>;
  updateGig(id: number, gig: Partial<Gig>): Promise<Gig | undefined>;
  deleteGig(id: number): Promise<boolean>;
  
  // Invoices
  getInvoices(userId: number): Promise<Invoice[]>;
  getInvoicesByStatus(userId: number, status: InvoiceStatus): Promise<Invoice[]>;
  getRecentInvoices(userId: number, limit?: number): Promise<Invoice[]>;
  getInvoice(id: number): Promise<Invoice | undefined>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: number, invoice: Partial<Invoice>): Promise<Invoice | undefined>;
  deleteInvoice(id: number): Promise<boolean>;
  updateInvoiceStatus(id: number, status: InvoiceStatus): Promise<Invoice | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private clients: Map<number, Client>;
  private gigs: Map<number, Gig>;
  private invoices: Map<number, Invoice>;
  
  private userId: number;
  private clientId: number;
  private gigId: number;
  private invoiceId: number;
  
  constructor() {
    this.users = new Map();
    this.clients = new Map();
    this.gigs = new Map();
    this.invoices = new Map();
    
    this.userId = 1;
    this.clientId = 1;
    this.gigId = 1;
    this.invoiceId = 1;
    
    // Add sample user for development
    const testUser: User = {
      id: this.userId++,
      email: "test@example.com",
      password: "password", // In a real app, this would be hashed
      stageName: "DJ Blaze",
      phone: "(555) 123-4567",
      location: "Los Angeles, CA",
      businessName: "Blaze Entertainment LLC",
      taxId: "XX-XXXXXXX",
      businessAddress: "123 Music Lane, Los Angeles, CA 90001",
      website: "https://djblaze.com",
      paymentTerms: "Net 14 days",
      paymentMethod: "Bank Transfer",
      paymentInstructions: "Please transfer the full amount to:\nAccount Name: Blaze Entertainment LLC\nBank: First National Bank\nAccount: XXXX-XXXX-XXXX-1234\nRouting: XXXXXXXXX",
      createdAt: new Date()
    };
    this.users.set(testUser.id, testUser);
    
    // Add a sample client for our test user
    const sampleClient: Client = {
      id: this.clientId++,
      userId: testUser.id,
      name: "Groove Lounge",
      email: "bookings@groovelounge.com",
      phone: "(555) 987-6543",
      type: "Nightclub",
      notes: "Regular weekly gig every Friday. Contact manager Lucy for setup details.",
      tags: ["nightclub", "regular", "friday"],
      createdAt: new Date()
    };
    this.clients.set(sampleClient.id, sampleClient);
    
    // Add a sample gig for the user
    const nextFriday = new Date();
    nextFriday.setDate(nextFriday.getDate() + (5 + 7 - nextFriday.getDay()) % 7);
    
    const sampleGig: Gig = {
      id: this.gigId++,
      userId: testUser.id,
      clientId: sampleClient.id,
      title: "Friday Night at Groove Lounge",
      date: nextFriday,
      startTime: "21:00",
      endTime: "02:00",
      location: "123 Beat Street, Downtown",
      fee: 350,
      notes: "Bring extra controller. VIP event - dress code is black attire.",
      reminderSet: true,
      createdAt: new Date()
    };
    this.gigs.set(sampleGig.id, sampleGig);
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const newUser: User = { ...user, id, createdAt: new Date() };
    this.users.set(id, newUser);
    return newUser;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Client methods
  async getClients(userId: number): Promise<Client[]> {
    return Array.from(this.clients.values()).filter(client => client.userId === userId);
  }
  
  async getClient(id: number): Promise<Client | undefined> {
    return this.clients.get(id);
  }
  
  async createClient(client: InsertClient): Promise<Client> {
    const id = this.clientId++;
    const newClient: Client = { ...client, id, createdAt: new Date() };
    this.clients.set(id, newClient);
    return newClient;
  }
  
  async updateClient(id: number, clientData: Partial<Client>): Promise<Client | undefined> {
    const client = await this.getClient(id);
    if (!client) return undefined;
    
    const updatedClient = { ...client, ...clientData };
    this.clients.set(id, updatedClient);
    return updatedClient;
  }
  
  async deleteClient(id: number): Promise<boolean> {
    return this.clients.delete(id);
  }
  
  // Gig methods
  async getGigs(userId: number): Promise<Gig[]> {
    return Array.from(this.gigs.values())
      .filter(gig => gig.userId === userId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }
  
  async getGigsByMonth(userId: number, year: number, month: number): Promise<Gig[]> {
    return (await this.getGigs(userId)).filter(gig => {
      const gigDate = new Date(gig.date);
      return gigDate.getFullYear() === year && gigDate.getMonth() === month;
    });
  }
  
  async getUpcomingGigs(userId: number, limit: number = 5): Promise<Gig[]> {
    const now = new Date();
    return (await this.getGigs(userId))
      .filter(gig => new Date(gig.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, limit);
  }
  
  async getGig(id: number): Promise<Gig | undefined> {
    return this.gigs.get(id);
  }
  
  async createGig(gig: InsertGig): Promise<Gig> {
    const id = this.gigId++;
    const newGig: Gig = { ...gig, id, createdAt: new Date() };
    this.gigs.set(id, newGig);
    return newGig;
  }
  
  async updateGig(id: number, gigData: Partial<Gig>): Promise<Gig | undefined> {
    const gig = await this.getGig(id);
    if (!gig) return undefined;
    
    const updatedGig = { ...gig, ...gigData };
    this.gigs.set(id, updatedGig);
    return updatedGig;
  }
  
  async deleteGig(id: number): Promise<boolean> {
    return this.gigs.delete(id);
  }
  
  // Invoice methods
  async getInvoices(userId: number): Promise<Invoice[]> {
    return Array.from(this.invoices.values())
      .filter(invoice => invoice.userId === userId)
      .sort((a, b) => new Date(b.issuedDate).getTime() - new Date(a.issuedDate).getTime());
  }
  
  async getInvoicesByStatus(userId: number, status: InvoiceStatus): Promise<Invoice[]> {
    return (await this.getInvoices(userId)).filter(invoice => invoice.status === status);
  }
  
  async getRecentInvoices(userId: number, limit: number = 5): Promise<Invoice[]> {
    return (await this.getInvoices(userId)).slice(0, limit);
  }
  
  async getInvoice(id: number): Promise<Invoice | undefined> {
    return this.invoices.get(id);
  }
  
  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const id = this.invoiceId++;
    const newInvoice: Invoice = { ...invoice, id, createdAt: new Date() };
    this.invoices.set(id, newInvoice);
    return newInvoice;
  }
  
  async updateInvoice(id: number, invoiceData: Partial<Invoice>): Promise<Invoice | undefined> {
    const invoice = await this.getInvoice(id);
    if (!invoice) return undefined;
    
    const updatedInvoice = { ...invoice, ...invoiceData };
    this.invoices.set(id, updatedInvoice);
    return updatedInvoice;
  }
  
  async deleteInvoice(id: number): Promise<boolean> {
    return this.invoices.delete(id);
  }
  
  async updateInvoiceStatus(id: number, status: InvoiceStatus): Promise<Invoice | undefined> {
    const invoice = await this.getInvoice(id);
    if (!invoice) return undefined;
    
    const updatedInvoice = { ...invoice, status };
    this.invoices.set(id, updatedInvoice);
    return updatedInvoice;
  }
}

// Import the real DatabaseStorage implementation
import { DatabaseStorage } from './database-storage';

// Use DatabaseStorage for persistence
export const storage = new DatabaseStorage();
