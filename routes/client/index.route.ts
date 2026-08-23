import { Router } from "express";
const router = Router();
import homeRoute from "./home.route"
import articleRoute from "./article.route"
import productRoute from "./product.route"
import cartRoutes from "./cart.route";
import * as categoryMiddleware from "../../middlewares/client/category.middleware"
import * as attributeMiddleware from "../../middlewares/client/attribute.middleware"

router.use(categoryMiddleware.category)
router.use(attributeMiddleware.attribute)
router.use('/', homeRoute)
router.use('/article', articleRoute)
router.use('/product', productRoute)
router.use('/cart', cartRoutes);




export default router;