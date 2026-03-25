import { Router, type IRouter, type Request, type Response } from "express";
import { db, carsTable, usersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router: IRouter = Router();

function toPublicCar(row: any) {
  return {
    id: row.id,
    vehicleModel: row.vehicleModel,
    vehicleNumber: row.vehicleNumber,
    seatingCapacity: row.seatingCapacity,
    rentPerDay: Number(row.rentPerDay),
    agencyId: row.agencyId,
    agencyName: row.agencyName ?? "",
    available: row.available,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
  };
}

async function getSessionUser(req: Request) {
  const userId = (req.session as any)?.userId;
  if (!userId) return null;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  return user ?? null;
}

router.get("/", async (_req: Request, res: Response) => {
  try {
    const cars = await db
      .select({
        id: carsTable.id,
        vehicleModel: carsTable.vehicleModel,
        vehicleNumber: carsTable.vehicleNumber,
        seatingCapacity: carsTable.seatingCapacity,
        rentPerDay: carsTable.rentPerDay,
        agencyId: carsTable.agencyId,
        agencyName: sql<string>`COALESCE(${usersTable.agencyName}, ${usersTable.name})`,
        available: carsTable.available,
        createdAt: carsTable.createdAt,
      })
      .from(carsTable)
      .innerJoin(usersTable, eq(carsTable.agencyId, usersTable.id));
    res.json(cars.map(toPublicCar));
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    if (user.role !== "agency") {
      res.status(403).json({ error: "Only agencies can add cars" });
      return;
    }
    const { vehicleModel, vehicleNumber, seatingCapacity, rentPerDay } = req.body;
    if (!vehicleModel || !vehicleNumber || !seatingCapacity || !rentPerDay) {
      res.status(400).json({ error: "All car fields are required" });
      return;
    }
    const [newCar] = await db.insert(carsTable).values({
      vehicleModel,
      vehicleNumber,
      seatingCapacity: Number(seatingCapacity),
      rentPerDay: String(Number(rentPerDay)),
      agencyId: user.id,
      available: true,
    }).returning();
    res.status(201).json(toPublicCar({ ...newCar, agencyName: user.agencyName ?? user.name }));
  } catch (err: any) {
    if (err?.code === "23505") {
      res.status(409).json({ error: "Vehicle number already exists" });
      return;
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    if (user.role !== "agency") {
      res.status(403).json({ error: "Only agencies can update cars" });
      return;
    }
    const carId = parseInt(req.params.id, 10);
    const [car] = await db.select().from(carsTable).where(eq(carsTable.id, carId));
    if (!car) {
      res.status(404).json({ error: "Car not found" });
      return;
    }
    if (car.agencyId !== user.id) {
      res.status(403).json({ error: "You can only edit your own cars" });
      return;
    }
    const { vehicleModel, vehicleNumber, seatingCapacity, rentPerDay } = req.body;
    const [updated] = await db.update(carsTable).set({
      vehicleModel: vehicleModel ?? car.vehicleModel,
      vehicleNumber: vehicleNumber ?? car.vehicleNumber,
      seatingCapacity: seatingCapacity !== undefined ? Number(seatingCapacity) : car.seatingCapacity,
      rentPerDay: rentPerDay !== undefined ? String(Number(rentPerDay)) : car.rentPerDay,
    }).where(eq(carsTable.id, carId)).returning();
    res.json(toPublicCar({ ...updated, agencyName: user.agencyName ?? user.name }));
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
