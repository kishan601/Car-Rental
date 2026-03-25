import { Router, type IRouter, type Request, type Response } from "express";
import { mockUsers, mockCars, getNextCarId, type MockCar } from "./mock-data.js";

const router: IRouter = Router();

function getSessionUser(req: Request) {
  const userId = (req.session as any)?.userId;
  if (!userId) return null;
  return mockUsers.find((u) => u.id === userId) ?? null;
}

router.get("/", (_req: Request, res: Response) => {
  res.json(mockCars);
});

router.post("/", (req: Request, res: Response) => {
  const user = getSessionUser(req);
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
  const newCar: MockCar = {
    id: getNextCarId(),
    vehicleModel,
    vehicleNumber,
    seatingCapacity: Number(seatingCapacity),
    rentPerDay: Number(rentPerDay),
    agencyId: user.id,
    agencyName: user.agencyName ?? user.name,
    available: true,
    createdAt: new Date().toISOString(),
  };
  mockCars.push(newCar);
  res.status(201).json(newCar);
});

router.put("/:id", (req: Request, res: Response) => {
  const user = getSessionUser(req);
  if (!user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  if (user.role !== "agency") {
    res.status(403).json({ error: "Only agencies can update cars" });
    return;
  }
  const carId = parseInt(req.params.id, 10);
  const carIndex = mockCars.findIndex((c) => c.id === carId);
  if (carIndex === -1) {
    res.status(404).json({ error: "Car not found" });
    return;
  }
  if (mockCars[carIndex].agencyId !== user.id) {
    res.status(403).json({ error: "You can only edit your own cars" });
    return;
  }
  const { vehicleModel, vehicleNumber, seatingCapacity, rentPerDay } = req.body;
  mockCars[carIndex] = {
    ...mockCars[carIndex],
    vehicleModel: vehicleModel ?? mockCars[carIndex].vehicleModel,
    vehicleNumber: vehicleNumber ?? mockCars[carIndex].vehicleNumber,
    seatingCapacity: seatingCapacity !== undefined ? Number(seatingCapacity) : mockCars[carIndex].seatingCapacity,
    rentPerDay: rentPerDay !== undefined ? Number(rentPerDay) : mockCars[carIndex].rentPerDay,
  };
  res.json(mockCars[carIndex]);
});

export default router;
