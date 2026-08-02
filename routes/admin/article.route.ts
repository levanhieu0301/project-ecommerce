import { Router } from "express";
const router = Router();
import * as articleController from "../../controllers/admin/article.controller"
import * as articleValidate from "../../validates/admin/article.validate"
import multer from "multer";
const upload = multer();
// Danh mục bài viết
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
router.patch(
  '/category/deleted/:id', 
  articleController.categoryDeleted
);

router.get('/category/trash', articleController.trashCategory);
router.patch('/category/undo/:id', articleController.undoCategoryPatch);
router.delete('/category/destroy/:id', articleController.destroyCategoryDelete);
// Bài viết
router.get('/list', articleController.articleList)
router.get('/create', articleController.articleCreate)
router.post('/create', upload.none(), articleValidate.articleCreatePost, articleController.articleCreatePost)


export default router;