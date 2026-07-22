import { Router } from "express";
const router = Router();
import * as helperController from "../../controllers/admin/helper.controller"

router.post('/generate-slug', helperController.generateSlug)

export default router;