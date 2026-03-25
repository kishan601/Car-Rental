import { Router, type IRouter, type Request, type Response } from "express";
import { db, carsTable, bookingsTable, usersTable } from "@workspace/db";
import { eq, sql, desc } from "drizzle-orm";

const router: IRouter = Router();

async function getSessionUser(req: Request) {
  const userId = (req.session as any)?.userId;
  if (!userId) return null;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  return user ?? null;
}

router.get("/bookings", async (req: Request, res: Response) => {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    if (user.role !== "customer") {
      res.status(403).json({ error: "Customer access only" });
      return;
    }

    const agencyAlias = usersTable;

    const rows = await db
      .select({
        id: bookingsTable.id,
        carId: bookingsTable.carId,
        vehicleModel: carsTable.vehicleModel,
        vehicleNumber: carsTable.vehicleNumber,
        seatingCapacity: carsTable.seatingCapacity,
        rentPerDay: carsTable.rentPerDay,
        agencyName: sql<string>`COALESCE(${agencyAlias.agencyName}, ${agencyAlias.name})`,
        startDate: bookingsTable.startDate,
        numberOfDays: bookingsTable.numberOfDays,
        totalCost: bookingsTable.totalCost,
        createdAt: bookingsTable.createdAt,
      })
      .from(bookingsTable)
      .innerJoin(carsTable, eq(bookingsTable.carId, carsTable.id))
      .innerJoin(agencyAlias, eq(carsTable.agencyId, agencyAlias.id))
      .where(eq(bookingsTable.customerId, user.id))
      .orderBy(desc(bookingsTable.createdAt));

    res.json(
      rows.map((r) => ({
        ...r,
        rentPerDay: Number(r.rentPerDay),
        totalCost: Number(r.totalCost),
        createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
      }))
    );
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
