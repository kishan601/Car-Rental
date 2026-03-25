import { Router, type IRouter, type Request, type Response } from "express";
import { mockUsers, mockCars, mockBookings, getNextBookingId } from "./mock-data.js";

const router: IRouter = Router();

function getSessionUser(req: Request) {
  const userId = (req.session as any)?.userId;
  if (!userId) return null;
  return mockUsers.find((u) => u.id === userId) ?? null;
}

router.post("/", (req: Request, res: Response) => {
  const user = getSessionUser(req);
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
  const car = mockCars.find((c) => c.id === Number(carId));
  if (!car) {
    res.status(404).json({ error: "Car not found" });
    return;
  }
  const totalCost = car.rentPerDay * Number(numberOfDays);
  const booking = {
    id: getNextBookingId(),
    carId: Number(carId),
    customerId: user.id,
    startDate,
    numberOfDays: Number(numberOfDays),
    totalCost,
    createdAt: new Date().toISOString(),
  };
  mockBookings.push(booking);
  res.status(201).json(booking);
});

router.delete("/:id", (req: Request, res: Response) => {
  const user = getSessionUser(req);
  if (!user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  if (user.role !== "customer") {
    res.status(403).json({ error: "Only customers can cancel bookings" });
    return;
  }
  const bookingId = parseInt(req.params.id, 10);
  const bookingIndex = mockBookings.findIndex((b) => b.id === bookingId);
  if (bookingIndex === -1) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }
  if (mockBookings[bookingIndex].customerId !== user.id) {
    res.status(403).json({ error: "You can only cancel your own bookings" });
    return;
  }
  mockBookings.splice(bookingIndex, 1);
  res.json({ message: "Booking cancelled successfully" });
});

export default router;
