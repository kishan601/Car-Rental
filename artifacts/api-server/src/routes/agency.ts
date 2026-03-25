import { Router, type IRouter, type Request, type Response } from "express";
import { db, carsTable, bookingsTable, usersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router: IRouter = Router();

async function getSessionUser(req: Request) {
  const userId = (req.session as any)?.userId;
  if (!userId) return null;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  return user ?? null;
}

router.get("/cars", async (req: Request, res: Response) => {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== "agency") {
      res.status(403).json({ error: "Agency access only" });
      return;
    }
    const cars = await db.select().from(carsTable).where(eq(carsTable.agencyId, user.id));
    res.json(
      cars.map((c) => ({
        ...c,
        rentPerDay: Number(c.rentPerDay),
        agencyName: user.agencyName ?? user.name,
        createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : c.createdAt,
      }))
    );
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/bookings", async (req: Request, res: Response) => {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== "agency") {
      res.status(403).json({ error: "Agency access only" });
      return;
    }

    const customerAlias = usersTable;

    const rows = await db
      .select({
        id: bookingsTable.id,
        carId: bookingsTable.carId,
        vehicleModel: carsTable.vehicleModel,
        vehicleNumber: carsTable.vehicleNumber,
        customerName: sql<string>`${customerAlias.name}`,
        customerEmail: sql<string>`${customerAlias.email}`,
        customerPhone: sql<string | null>`${customerAlias.phone}`,
        startDate: bookingsTable.startDate,
        numberOfDays: bookingsTable.numberOfDays,
        totalCost: bookingsTable.totalCost,
        createdAt: bookingsTable.createdAt,
      })
      .from(bookingsTable)
      .innerJoin(carsTable, eq(bookingsTable.carId, carsTable.id))
      .innerJoin(customerAlias, eq(bookingsTable.customerId, customerAlias.id))
      .where(eq(carsTable.agencyId, user.id));

    res.json(
      rows.map((r) => ({
        ...r,
        totalCost: Number(r.totalCost),
        createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
      }))
    );
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
