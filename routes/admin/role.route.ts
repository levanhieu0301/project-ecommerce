import { Router } from "express";
const router = Router();
import * as roleController from "../../controllers/admin/role.controller"
import * as roleValidate from "../../validates/admin/role.validate"
import multer from "multer";
const upload = multer();
router.get('/create', roleController.role)
router.post('/create', upload.none(),roleValidate.createPost, roleController.roleCreatePost)
router.get('/list', roleController.roleList)
router.get('/edit/:id', roleController.roleEdit)
router.patch('/edit/:id', upload.none(), roleValidate.createPost, roleController.roleEditPatch)

export default router;