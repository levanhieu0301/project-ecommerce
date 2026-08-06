import { Router } from "express";
const router = Router()
import * as accountMiddleware from "../../middlewares/admin/account.middleware"

import multer from "multer";
const upload = multer()
import * as accountController from "../../controllers/admin/account.controller"
import * as accountValidate from "../../validates/admin/account.validate"

router.get('/login', accountController.login)
router.get('/logout',accountMiddleware.verifyToken, accountController.logout)
router.post('/login',upload.none(), accountValidate.loginPost,accountController.loginPost)

export default router;