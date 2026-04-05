import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth/index.js";
import usersRouter from "./users/index.js";
import recordsRouter from "./records/index.js";
import dashboardRouter from "./dashboard/index.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(recordsRouter);
router.use(dashboardRouter);

export default router;
