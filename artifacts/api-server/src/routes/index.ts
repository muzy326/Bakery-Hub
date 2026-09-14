import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import menuRouter from "./menu.js";
import ordersRouter from "./orders.js";
import authRouter from "./auth.js";
import adminRouter from "./admin.js";
import chatRouter from "./chat.js";
import employeesRouter from "./employees.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(menuRouter);
router.use(ordersRouter);
router.use(authRouter);
router.use(adminRouter);
router.use(chatRouter);
router.use(employeesRouter);

export default router;
