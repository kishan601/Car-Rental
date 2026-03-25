import { Router, type IRouter, type Request, type Response } from "express";
import { mockUsers, mockCars, mockBookings } from "./mock-data.js";

const router: IRouter = Router();

function getSessionUser(req: Request) {
  const userId = (req.session as any)?.userId;
  if (!userId) return null;
  return mockUsers.find((u) => u.id === userId) ?? null;
}

router.get("/cars", (req: Request, res: Response) => {
  const user = getSessionUser(req);
  if (!user || user.role !== "agency") {
    res.status(403).json({ error: "Agency access only" });
    return;
  }
  const agencyCars = mockCars.filter((c) => c.agencyId === user.id);
  res.json(agencyCars);
});

router.get("/bookings", (req: Request, res: Response) => {
  const user = getSessionUser(req);
  if (!user || user.role !== "agency") {
    res.status(403).json({ error: "Agency access only" });
    return;
  }
  const agencyCarIds = mockCars.filter((c) => c.agencyId === user.id).map((c) => c.id);
  const agencyBookings = mockBookings
    .filter((b) => agencyCarIds.includes(b.carId))
    .map((b) => {
      const car = mockCars.find((c) => c.id === b.carId);
      const customer = mockUsers.find((u) => u.id === b.customerId);
      return {
        id: b.id,
        carId: b.carId,
        vehicleModel: car?.vehicleModel ?? "",
        vehicleNumber: car?.vehicleNumber ?? "",
        customerName: customer?.name ?? "",
        customerEmail: customer?.email ?? "",
        customerPhone: customer?.phone ?? null,
        startDate: b.startDate,
        numberOfDays: b.numberOfDays,
        totalCost: b.totalCost,
        createdAt: b.createdAt,
      };
    });
  res.json(agencyBookings);
});

export default router;
