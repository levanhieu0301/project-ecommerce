import { Router } from "express";
const router = Router();
import dashboardRoute from "./dashboard.route"

router.use('/admin', dashboardRoute)



export default router;