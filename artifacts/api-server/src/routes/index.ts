import { Router, type IRouter } from "express";
import healthRouter from "./health";
import certificatesRouter from "./certificates";
import adminRouter from "./admin";
import pagesRouter from "./pages";
import storageRouter from "./storage";

const router: IRouter = Router();

router.use(healthRouter);
router.use(certificatesRouter);
router.use(adminRouter);
router.use(pagesRouter);
router.use(storageRouter);

export default router;
