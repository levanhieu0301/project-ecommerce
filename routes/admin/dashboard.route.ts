import { Router } from "express";
const router = Router();
import * as dashboardController from "../../controllers/admin/dashboard.controller"
import { checkPermissions } from "../../middlewares/admin/account.middleware";

router.get('/',checkPermissions("dashboard"), dashboardController.dashboard)

export default router;