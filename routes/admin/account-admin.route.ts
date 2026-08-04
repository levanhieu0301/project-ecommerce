import { Router } from "express";
const router = Router();
import * as accountAdminController from "../../controllers/admin/account-admin.controller"
import * as accountAdminValidate from "../../validates/admin/account-admin.validate"
import multer from "multer";
const upload = multer();

router.get('/create', accountAdminController.createAccountAdmin)
router.post('/create', upload.none(), accountAdminValidate.createPost, accountAdminController.createAccountAdminPost)
router.get('/list', accountAdminController.accountAdminList)
router.get('/edit/:id', accountAdminController.accountAdminEdit)
router.patch('/edit/:id', upload.none(), accountAdminValidate.editPatch, accountAdminController.accountAdminEditPatch)

export default router;