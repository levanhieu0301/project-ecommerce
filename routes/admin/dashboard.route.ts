import { Router } from "express";
const router = Router();
import * as dashboardController from "../../controllers/admin/dashboard.controller"

router.get('/', dashboardController.dashboard)

export default router;