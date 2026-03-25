import { Router, type IRouter, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable, type User } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

function toPublicUser(u: User) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    agencyName: u.agencyName ?? null,
    phone: u.phone ?? null,
    createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : u.createdAt,
  };
}

router.get("/me", async (req: Request, res: Response) => {
  const userId = (req.session as any)?.userId;
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }
    res.json(toPublicUser(user));
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/register/customer", async (req: Request, res: Response) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ error: "Name, email and password are required" });
    return;
  }
  try {
    const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (existing) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }
    const passwordHash = bcrypt.hashSync(password, 10);
    const [newUser] = await db.insert(usersTable).values({
      name,
      email,
      passwordHash,
      role: "customer",
      phone: phone || null,
    }).returning();
    (req.session as any).userId = newUser.id;
    res.status(201).json({ user: toPublicUser(newUser), message: "Registration successful" });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/register/agency", async (req: Request, res: Response) => {
  const { name, email, password, agencyName, phone } = req.body;
  if (!name || !email || !password || !agencyName) {
    res.status(400).json({ error: "Name, email, password and agency name are required" });
    return;
  }
  try {
    const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (existing) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }
    const passwordHash = bcrypt.hashSync(password, 10);
    const [newUser] = await db.insert(usersTable).values({
      name,
      email,
      passwordHash,
      role: "agency",
      agencyName,
      phone: phone || null,
    }).returning();
    (req.session as any).userId = newUser.id;
    res.status(201).json({ user: toPublicUser(newUser), message: "Registration successful" });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }
    (req.session as any).userId = user.id;
    res.json({ user: toPublicUser(user), message: "Login successful" });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/logout", (req: Request, res: Response) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out successfully" });
  });
});

export default router;
