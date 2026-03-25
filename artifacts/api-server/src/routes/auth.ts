import { Router, type IRouter, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import {
  mockUsers,
  getNextUserId,
  type MockUser,
} from "./mock-data.js";

const router: IRouter = Router();

function toPublicUser(u: MockUser) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    agencyName: u.agencyName ?? null,
    phone: u.phone ?? null,
    createdAt: u.createdAt,
  };
}

router.get("/me", (req: Request, res: Response) => {
  const userId = (req.session as any)?.userId;
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const user = mockUsers.find((u) => u.id === userId);
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }
  res.json(toPublicUser(user));
});

router.post("/register/customer", (req: Request, res: Response) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ error: "Name, email and password are required" });
    return;
  }
  if (mockUsers.find((u) => u.email === email)) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }
  const newUser: MockUser = {
    id: getNextUserId(),
    name,
    email,
    passwordHash: bcrypt.hashSync(password, 10),
    role: "customer",
    phone: phone || undefined,
    createdAt: new Date().toISOString(),
  };
  mockUsers.push(newUser);
  (req.session as any).userId = newUser.id;
  res.status(201).json({ user: toPublicUser(newUser), message: "Registration successful" });
});

router.post("/register/agency", (req: Request, res: Response) => {
  const { name, email, password, agencyName, phone } = req.body;
  if (!name || !email || !password || !agencyName) {
    res.status(400).json({ error: "Name, email, password and agency name are required" });
    return;
  }
  if (mockUsers.find((u) => u.email === email)) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }
  const newUser: MockUser = {
    id: getNextUserId(),
    name,
    email,
    passwordHash: bcrypt.hashSync(password, 10),
    role: "agency",
    agencyName,
    phone: phone || undefined,
    createdAt: new Date().toISOString(),
  };
  mockUsers.push(newUser);
  (req.session as any).userId = newUser.id;
  res.status(201).json({ user: toPublicUser(newUser), message: "Registration successful" });
});

router.post("/login", (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }
  const user = mockUsers.find((u) => u.email === email);
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }
  (req.session as any).userId = user.id;
  res.json({ user: toPublicUser(user), message: "Login successful" });
});

router.post("/logout", (req: Request, res: Response) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out successfully" });
  });
});

export default router;
