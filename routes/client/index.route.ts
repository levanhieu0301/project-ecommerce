import { Router } from "express";
const router = Router();
import homeRoute from "./home.route"
import * as categoryMiddleware from "../../middlewares/client/category.middleware"

router.use(categoryMiddleware.category)
router.use('/', homeRoute)



export default router;