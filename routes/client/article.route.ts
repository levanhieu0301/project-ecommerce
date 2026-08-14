import { Router } from "express";
const router = Router();
import * as articleController from "../../controllers/client/article.controller"


router.get('/category/:slug', articleController.articleByCategory)

export default router;