import { Router } from "express";
const router = Router();

import multer from "multer";
const upload = multer()
import * as accountController from "../../controllers/admin/account.controller"
import * as accountValidate from "../../validates/admin/account.validate"

router.get('/login', accountController.login)
router.get('/logout', accountController.logout)
router.post('/login',upload.none(), accountValidate.loginPost,accountController.loginPost)

export default router;