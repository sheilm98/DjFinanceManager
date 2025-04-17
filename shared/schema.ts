import { pgTable, text, serial, integer, boolean, timestamp, real, json } from "drizzle-orm/pg-core"; 
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  stageName: text("stage_name"),
  phone: text("phone"),
  location: text("location"),
  businessName: text("business_name"),
  taxId: text("tax_id"),
  businessAddress: text("business_address"),
  website: text("website"),
  paymentTerms: text("payment_terms").default("Net 14 days"),
  paymentMethod: text("payment_method").default("Bank Transfer"),
  paymentInstructions: text("payment_instructions"),
  logoUrl: text("logo_url"),
  createdAt: timestamp("created_at").defaultNow()
});

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  type: text("type"),
  notes: text("notes"),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow()
});

export const gigs = pgTable("gigs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  clientId: integer("client_id").references(() => clients.id),
  title: text("title").notNull(),
  date: timestamp("date").notNull(),
  startTime: text("start_time"),
  endTime: text("end_time"),
  location: text("location"),
  fee: real("fee"),
  notes: text("notes"),
  reminderSet: boolean("reminder_set").default(true),
  createdAt: timestamp("created_at").defaultNow()
});

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  gigId: integer("gig_id").references(() => gigs.id),
  clientId: integer("client_id").references(() => clients.id),
  invoiceNumber: text("invoice_number").notNull(),
  issuedDate: timestamp("issued_date").defaultNow(),
  dueDate: timestamp("due_date"),
  amount: real("amount").notNull(),
  status: text("status").default("draft"),
  items: json("items"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow()
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  clients: many(clients),
  gigs: many(gigs),
  invoices: many(invoices)
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  user: one(users, {
    fields: [clients.userId],
    references: [users.id]
  }),
  gigs: many(gigs),
  invoices: many(invoices)
}));

export const gigsRelations = relations(gigs, ({ one, many }) => ({
  user: one(users, {
    fields: [gigs.userId],
    references: [users.id]
  }),
  client: one(clients, {
    fields: [gigs.clientId],
    references: [clients.id]
  }),
  invoices: many(invoices)
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  user: one(users, {
    fields: [invoices.userId],
    references: [users.id]
  }),
  client: one(clients, {
    fields: [invoices.clientId],
    references: [clients.id]
  }),
  gig: one(gigs, {
    fields: [invoices.gigId],
    references: [gigs.id]
  })
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertClientSchema = createInsertSchema(clients).omit({ id: true, createdAt: true });
export const insertGigSchema = createInsertSchema(gigs).omit({ id: true, createdAt: true });
export const insertInvoiceSchema = createInsertSchema(invoices).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;

export type Gig = typeof gigs.$inferSelect;
export type InsertGig = z.infer<typeof insertGigSchema>;

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;

// Custom types for forms and display
export type InvoiceItem = {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
};

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";

export type ClientWithInvoices = Client & { invoices: Invoice[] };
export type GigWithClient = Gig & { client?: Client };
export type InvoiceWithDetails = Invoice & { client?: Client, gig?: Gig };
