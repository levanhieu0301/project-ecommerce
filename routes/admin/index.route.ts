import { Router } from "express";
const router = Router();
import dashboardRoute from "./dashboard.route"
import articleRoute from "./article.route"
import helperRoute from "./helper.route"
import fileManagerRoute from "./file-manager.route"
import roleRoute from "./role.route"
import accountAdminRoute from "./account-admin.route"
import accountRoute from "./account.route"
import productRoute from "./product.route"
import * as AuthMiddleware from "../../middlewares/admin/account.middleware"

router.use('/dashboard', AuthMiddleware.verifyToken,dashboardRoute)
router.use('/article', AuthMiddleware.verifyToken, articleRoute)
router.use('/helper',  AuthMiddleware.verifyToken,helperRoute)
router.use('/file-manager', AuthMiddleware.verifyToken, fileManagerRoute)
router.use('/role',  AuthMiddleware.verifyToken,roleRoute)
router.use('/account-admin',  AuthMiddleware.verifyToken,accountAdminRoute)
router.use('/product',  AuthMiddleware.verifyToken,productRoute)
router.use('/account', accountRoute)
export default router;