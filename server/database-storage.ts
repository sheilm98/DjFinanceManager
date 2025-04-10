import { 
  users, type User, type InsertUser,
  clients, type Client, type InsertClient,
  gigs, type Gig, type InsertGig,
  invoices, type Invoice, type InsertInvoice,
  type InvoiceStatus
} from "@shared/schema";
import { eq, and, gte, lte, asc, desc } from "drizzle-orm";
import { db } from './db';
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser || undefined;
  }

  // Client methods
  async getClients(userId: number): Promise<Client[]> {
    return db
      .select()
      .from(clients)
      .where(eq(clients.userId, userId));
  }

  async getClient(id: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client || undefined;
  }

  async createClient(client: InsertClient): Promise<Client> {
    const [newClient] = await db.insert(clients).values(client).returning();
    return newClient;
  }

  async updateClient(id: number, clientData: Partial<Client>): Promise<Client | undefined> {
    const [updatedClient] = await db
      .update(clients)
      .set(clientData)
      .where(eq(clients.id, id))
      .returning();
    return updatedClient || undefined;
  }

  async deleteClient(id: number): Promise<boolean> {
    const result = await db.delete(clients).where(eq(clients.id, id));
    return Boolean(result.rowCount && result.rowCount > 0);
  }

  // Gig methods
  async getGigs(userId: number): Promise<Gig[]> {
    return db
      .select()
      .from(gigs)
      .where(eq(gigs.userId, userId))
      .orderBy(asc(gigs.date));
  }

  async getGigsByMonth(userId: number, year: number, month: number): Promise<Gig[]> {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    return db
      .select()
      .from(gigs)
      .where(
        and(
          eq(gigs.userId, userId),
          gte(gigs.date, startDate),
          lte(gigs.date, endDate)
        )
      );
  }

  async getUpcomingGigs(userId: number, limit: number = 5): Promise<Gig[]> {
    const now = new Date();
    return db
      .select()
      .from(gigs)
      .where(
        and(
          eq(gigs.userId, userId),
          gte(gigs.date, now)
        )
      )
      .orderBy(asc(gigs.date))
      .limit(limit);
  }

  async getGig(id: number): Promise<Gig | undefined> {
    const [gig] = await db.select().from(gigs).where(eq(gigs.id, id));
    return gig || undefined;
  }

  async createGig(gig: InsertGig): Promise<Gig> {
    const [newGig] = await db.insert(gigs).values(gig).returning();
    return newGig;
  }

  async updateGig(id: number, gigData: Partial<Gig>): Promise<Gig | undefined> {
    const [updatedGig] = await db
      .update(gigs)
      .set(gigData)
      .where(eq(gigs.id, id))
      .returning();
    return updatedGig || undefined;
  }

  async deleteGig(id: number): Promise<boolean> {
    const result = await db.delete(gigs).where(eq(gigs.id, id));
    return Boolean(result.rowCount && result.rowCount > 0);
  }

  // Invoice methods
  async getInvoices(userId: number): Promise<Invoice[]> {
    return db
      .select()
      .from(invoices)
      .where(eq(invoices.userId, userId))
      .orderBy(desc(invoices.issuedDate));
  }

  async getInvoicesByStatus(userId: number, status: InvoiceStatus): Promise<Invoice[]> {
    return db
      .select()
      .from(invoices)
      .where(
        and(
          eq(invoices.userId, userId),
          eq(invoices.status, status)
        )
      );
  }

  async getRecentInvoices(userId: number, limit: number = 5): Promise<Invoice[]> {
    return db
      .select()
      .from(invoices)
      .where(eq(invoices.userId, userId))
      .orderBy(desc(invoices.issuedDate))
      .limit(limit);
  }

  async getInvoice(id: number): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice || undefined;
  }

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const [newInvoice] = await db.insert(invoices).values(invoice).returning();
    return newInvoice;
  }

  async updateInvoice(id: number, invoiceData: Partial<Invoice>): Promise<Invoice | undefined> {
    const [updatedInvoice] = await db
      .update(invoices)
      .set(invoiceData)
      .where(eq(invoices.id, id))
      .returning();
    return updatedInvoice || undefined;
  }

  async deleteInvoice(id: number): Promise<boolean> {
    const result = await db.delete(invoices).where(eq(invoices.id, id));
    return Boolean(result.rowCount && result.rowCount > 0);
  }

  async updateInvoiceStatus(id: number, status: InvoiceStatus): Promise<Invoice | undefined> {
    const [updatedInvoice] = await db
      .update(invoices)
      .set({ status })
      .where(eq(invoices.id, id))
      .returning();
    return updatedInvoice || undefined;
  }
}