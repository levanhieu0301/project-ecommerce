import { Router } from "express";
const router = Router();
import * as productController from "../../controllers/client/product.controller"


router.get('/category/:slug', productController.category)

export default router;