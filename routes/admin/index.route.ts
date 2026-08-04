import { Router } from "express";
const router = Router();
import dashboardRoute from "./dashboard.route"
import articleRoute from "./article.route"
import helperRoute from "./helper.route"
import fileManagerRoute from "./file-manager.route"
import roleRoute from "./role.route"
import accountAdminRoute from "./account-admin.route"

router.use('/dashboard', dashboardRoute)
router.use('/article', articleRoute)
router.use('/helper', helperRoute)
router.use('/file-manager', fileManagerRoute)
router.use('/role', roleRoute)
router.use('/account-admin', accountAdminRoute)
export default router;