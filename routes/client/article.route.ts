import { Router } from "express";
const router = Router();
import * as articleController from "../../controllers/client/article.controller"
import { getPopularBlog, getPopularCategoryBlog } from "../../middlewares/client/article.middleware";


router.get('/category/:slug',getPopularBlog,getPopularCategoryBlog, articleController.articleByCategory)

router.get(
  '/detail/:slug', 
  getPopularBlog,
  getPopularCategoryBlog,
  articleController.detail
);


export default router;