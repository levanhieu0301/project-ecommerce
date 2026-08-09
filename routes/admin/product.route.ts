import { Router } from "express";
const router = Router();
import multer from "multer";
const upload = multer()
import * as productController from "../../controllers/admin/product.controller"
import * as productValidate from "../../validates/admin/product.validate"
import { checkPermissions } from "../../middlewares/admin/account.middleware";


router.get('/category', productController.categoryProduct)
router.get('/category/create', productController.categoryProductCreate)
router.post('/category/create', upload.none(),checkPermissions("product-category-create"), productValidate.createCategoryPost ,productController.categoryProductCreatePost)
router.get('/category/edit/:id', productController.editCategoryProduct);

router.patch(
  '/category/edit/:id', 
  upload.none(), 
  checkPermissions("product-category-edit"),
  productValidate.createCategoryPost, 
  productController.editCategoryProductPatch
);
router.patch('/category/delete/:id', productController.deleteCategoryProductPatch);
router.get('/category/trash', productController.categoryProductTrash)
router.patch('/category/undo/:id', productController.categoryProductUndo)
router.delete('/category/destroy/:id', productController.categoryProductDestroy)


export default router;