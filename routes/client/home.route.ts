import { Router } from "express";
const router = Router();
import * as homeController from "../../controllers/client/home.controller"


router.get('/', homeController.home)
router.get('/sitemap.xml', homeController.sitemap);
router.get('/robots.txt', homeController.robots);


export default router;