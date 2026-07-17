import { Router } from "express";
const router = Router();
import * as homeController from "../../controllers/client/home.controller"

router.get('/', homeController.home)

export default router;