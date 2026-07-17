import { Router } from "express";
const router = Router();
import dashboardRoute from "./dashboard.route"

router.use('/dashboard', dashboardRoute)



export default router;