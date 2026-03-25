import { pgTable, serial, varchar, integer, numeric, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const carsTable = pgTable("cars", {
  id: serial("id").primaryKey(),
  vehicleModel: varchar("vehicle_model", { length: 255 }).notNull(),
  vehicleNumber: varchar("vehicle_number", { length: 100 }).notNull().unique(),
  seatingCapacity: integer("seating_capacity").notNull(),
  rentPerDay: numeric("rent_per_day", { precision: 10, scale: 2 }).notNull(),
  agencyId: integer("agency_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  available: boolean("available").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCarSchema = createInsertSchema(carsTable).omit({ id: true, createdAt: true });
export type InsertCar = z.infer<typeof insertCarSchema>;
export type Car = typeof carsTable.$inferSelect;
