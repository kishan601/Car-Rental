import { Router, type IRouter, type Request, type Response } from "express";
import { mockUsers, mockCars, mockBookings } from "./mock-data.js";

const router: IRouter = Router();

function getSessionUser(req: Request) {
  const userId = (req.session as any)?.userId;
  if (!userId) return null;
  return mockUsers.find((u) => u.id === userId) ?? null;
}

router.get("/bookings", (req: Request, res: Response) => {
  const user = getSessionUser(req);
  if (!user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  if (user.role !== "customer") {
    res.status(403).json({ error: "Customer access only" });
    return;
  }
  const myBookings = mockBookings
    .filter((b) => b.customerId === user.id)
    .map((b) => {
      const car = mockCars.find((c) => c.id === b.carId);
      return {
        id: b.id,
        carId: b.carId,
        vehicleModel: car?.vehicleModel ?? "",
        vehicleNumber: car?.vehicleNumber ?? "",
        seatingCapacity: car?.seatingCapacity ?? 0,
        rentPerDay: car?.rentPerDay ?? 0,
        agencyName: car?.agencyName ?? "",
        startDate: b.startDate,
        numberOfDays: b.numberOfDays,
        totalCost: b.totalCost,
        createdAt: b.createdAt,
      };
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(myBookings);
});

export default router;
