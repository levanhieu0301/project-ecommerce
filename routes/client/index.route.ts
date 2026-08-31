import { Router } from "express";
const router = Router();
import homeRoute from "./home.route"
import articleRoute from "./article.route"
import productRoute from "./product.route"
import cartRoutes from "./cart.route";
import compareRoutes from "./compare.route";
import wishlistRoutes from "./wishlist.route";
import authRoutes from "./auth.route";
import dashboardRoutes from "./dashboard.route";
import * as categoryMiddleware from "../../middlewares/client/category.middleware"
import * as attributeMiddleware from "../../middlewares/client/attribute.middleware"
import * as authMiddleware from "../../middlewares/client/auth.middleware";

router.use(categoryMiddleware.category)
router.use(attributeMiddleware.attribute)
router.use(authMiddleware.verifyToken);
router.use('/', homeRoute)
router.use('/article', articleRoute)
router.use('/product', productRoute)
router.use('/cart', cartRoutes);
router.use('/compare', compareRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);




export default router;