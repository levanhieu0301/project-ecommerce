import { Router } from "express";
const router = Router();
import multer from "multer";
const upload = multer()
import * as productController from "../../controllers/admin/product.controller"
import * as productValidate from "../../validates/admin/product.validate"
import { checkPermissions } from "../../middlewares/admin/account.middleware";


router.get('/category', productController.categoryProduct)
router.get('/category/create', productController.categoryProductCreate)
router.post('/category/create', upload.none(), productValidate.createCategoryPost ,productController.categoryProductCreatePost)

export default router;