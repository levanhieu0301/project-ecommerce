import { Router } from "express";
const router = Router();
import * as articleController from "../../controllers/client/article.controller"
import { getPopularBlog } from "../../middlewares/client/article.middleware";


router.get('/category/:slug',getPopularBlog, articleController.articleByCategory)

export default router;