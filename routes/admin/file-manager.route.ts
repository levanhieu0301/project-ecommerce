import { Router } from "express";
const router = Router();
import * as fileManagerController from "../../controllers/admin/file-manager.controller"
import multer from "multer";
const upload = multer();


router.get('/', fileManagerController.fileManager)
router.post('/upload',upload.array("files"), fileManagerController.upload)

export default router;