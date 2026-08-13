import { Router } from "express";
const router = Router();
import multer from "multer";
const upload = multer()
import * as productController from "../../controllers/admin/product.controller"
import * as productValidate from "../../validates/admin/product.validate"
import { checkPermissions } from "../../middlewares/admin/account.middleware";

// Danh mục sản phẩm
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
// Sản phẩm
router.get('/create', productController.createProduct)
router.post(
  '/create', 
  upload.none(),
  checkPermissions("product-create") ,
  productValidate.createProductPost, 
  productController.createProductPost
);
router.get('/list', productController.listProduct)
router.get('/edit/:id', productController.editProduct)
router.patch(
  '/edit/:id', 
  upload.none(), 
  checkPermissions("product-edit") ,
  productValidate.createProductPost, 
  productController.editPatch
);

router.patch('/delete/:id', productController.deletePatch);
router.get('/trash', productController.trashProduct);
router.patch('/undo/:id', productController.undoProduct);
router.delete('/destroy/:id', productController.destroyProduct);

// Thuộc tính
router.get('/attribute', productController.attributeProduct);
router.get('/attribute/create', productController.attributeCreateProduct);
router.post(
  '/attribute/create', 
  upload.none(), 
  checkPermissions("product-attribute-create"),
  productValidate.createAttributePost, 
  productController.createAttributePost
);
router.get('/attribute/edit/:id', productController.attributeEditProduct);
router.patch(
  '/attribute/edit/:id', 
  upload.none(), 
  checkPermissions("product-attribute-edit"),
  productValidate.createAttributePost, 
  productController.editAttributePatch
);

router.patch('/attribute/delete/:id', productController.deleteAttributePatch);
router.get('/attribute/trash', productController.attributeTrashProduct);
router.patch('/attribute/undo/:id', productController.undoAttributePatch);
router.delete('/attribute/destroy/:id', productController.destroyAttribute);
// csv
router.get('/export/csv', productController.exportCSV);
export default router;