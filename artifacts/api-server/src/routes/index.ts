import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import carsRouter from "./cars.js";
import bookingsRouter from "./bookings.js";
import agencyRouter from "./agency.js";
import customerRouter from "./customer.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/cars", carsRouter);
router.use("/bookings", bookingsRouter);
router.use("/agency", agencyRouter);
router.use("/customer", customerRouter);

export default router;
