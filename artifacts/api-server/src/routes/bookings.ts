import { Router, type IRouter, type Request, type Response } from "express";
import { db, carsTable, bookingsTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router: IRouter = Router();

async function getSessionUser(req: Request) {
  const userId = (req.session as any)?.userId;
  if (!userId) return null;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  return user ?? null;
}

router.post("/", async (req: Request, res: Response) => {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    if (user.role !== "customer") {
      res.status(403).json({ error: "Only customers can book cars" });
      return;
    }
    const { carId, startDate, numberOfDays } = req.body;
    if (!carId || !startDate || !numberOfDays) {
      res.status(400).json({ error: "carId, startDate and numberOfDays are required" });
      return;
    }
    const [car] = await db.select().from(carsTable).where(eq(carsTable.id, Number(carId)));
    if (!car) {
      res.status(404).json({ error: "Car not found" });
      return;
    }
    const totalCost = Number(car.rentPerDay) * Number(numberOfDays);
    const [booking] = await db.insert(bookingsTable).values({
      carId: Number(carId),
      customerId: user.id,
      startDate,
      numberOfDays: Number(numberOfDays),
      totalCost: String(totalCost),
    }).returning();
    res.status(201).json({
      ...booking,
      totalCost: Number(booking.totalCost),
      createdAt: booking.createdAt instanceof Date ? booking.createdAt.toISOString() : booking.createdAt,
    });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    if (user.role !== "customer") {
      res.status(403).json({ error: "Only customers can cancel bookings" });
      return;
    }
    const bookingId = parseInt(req.params.id, 10);
    const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, bookingId));
    if (!booking) {
      res.status(404).json({ error: "Booking not found" });
      return;
    }
    if (booking.customerId !== user.id) {
      res.status(403).json({ error: "You can only cancel your own bookings" });
      return;
    }
    await db.delete(bookingsTable).where(
      and(eq(bookingsTable.id, bookingId), eq(bookingsTable.customerId, user.id))
    );
    res.json({ message: "Booking cancelled successfully" });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
