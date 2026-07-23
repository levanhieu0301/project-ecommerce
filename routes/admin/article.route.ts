import { Router } from "express";
const router = Router();
import * as articleController from "../../controllers/admin/article.controller"
import * as articleValidate from "../../validates/admin/article.validate"
import multer from "multer";
const upload = multer();

router.get('/category', articleController.category)
router.get('/category/create', articleController.categoryCreate)
router.post(
  '/category/create', 
  upload.none(), 
  articleValidate.categoryCreatePost, 
  articleController.categoryCreatePost
);
router.get(
  '/category/edit/:id', 
  articleController.categoryEdit
);
router.patch(
  '/category/edit/:id', 
  upload.none(), 
  articleValidate.categoryCreatePost, 
  articleController.categoryEditPatch
);

export default router;