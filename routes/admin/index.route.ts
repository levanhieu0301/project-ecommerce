import { Router } from "express";
const router = Router();
import dashboardRoute from "./dashboard.route"
import articleRoute from "./article.route"

router.use('/dashboard', dashboardRoute)
router.use('/article', articleRoute)

export default router;