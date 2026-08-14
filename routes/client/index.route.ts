import { Router } from "express";
const router = Router();
import homeRoute from "./home.route"
import articleRoute from "./article.route"
import * as categoryMiddleware from "../../middlewares/client/category.middleware"

router.use(categoryMiddleware.category)
router.use('/', homeRoute)
router.use('/article', articleRoute)



export default router;