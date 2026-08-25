import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const certificatesTable = pgTable("certificates", {
  id: serial("id").primaryKey(),
  certificateNumber: text("certificate_number").notNull().unique(),
  holderName: text("holder_name").notNull(),
  ndtMethod: text("ndt_method").notNull(),
  level: text("level").notNull(),
  issuedDate: text("issued_date").notNull(),
  expirationDate: text("expiration_date").notNull(),
  status: text("status").notNull().default("valid"),
  issuedBy: text("issued_by").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertCertificateSchema = createInsertSchema(certificatesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCertificate = z.infer<typeof insertCertificateSchema>;
export type Certificate = typeof certificatesTable.$inferSelect;
