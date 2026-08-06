import { Router } from "express";
const router = Router();
import * as articleController from "../../controllers/admin/article.controller"
import * as articleValidate from "../../validates/admin/article.validate"
import multer from "multer";
import { checkPermissions } from "../../middlewares/admin/account.middleware";
const upload = multer();
// Danh mục bài viết
router.get('/category', articleController.category)
router.get('/category/create', articleController.categoryCreate)
router.post(
  '/category/create', 
  upload.none(), 
  checkPermissions("article-category-create"),
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
  checkPermissions("article-category-edit"),
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
router.get(
  '/create', 
  articleController.articleCreate
)
router.post(
  '/create', 
  upload.none(),
  checkPermissions("article-create"), 
  articleValidate.articleCreatePost, 
  articleController.articleCreatePost
)
router.get('/edit/:id', articleController.articleEdit)
router.patch(
  '/edit/:id', 
  upload.none(),
  checkPermissions("article-edit"), 
  articleValidate.articleCreatePost,
   articleController.articleEditPatch
)
router.patch('/delete/:id', articleController.articleDelete)
router.get('/trash', articleController.trashArticle)
router.patch('/undo/:id', articleController.undoArticlePatch)
router.delete('/destroy/:id', articleController.destroyArticleDelete)



export default router;