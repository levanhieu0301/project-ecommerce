import { Router } from "express";
const router = Router();
import * as productController from "../../controllers/client/product.controller"


router.get('/category/:slug', productController.category)
router.get('/category', productController.category)
router.get('/suggest', productController.suggest)

export default router;