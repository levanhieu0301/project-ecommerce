import { Router } from "express";
const router = Router();
import * as fileManagerController from "../../controllers/admin/file-manager.controller"
import multer from "multer";
const upload = multer();


router.get('/', fileManagerController.fileManager)
router.post('/upload',upload.array("files"), fileManagerController.upload)
router.patch('/change-file-name/:id',upload.none(), fileManagerController.changeFileName)
router.delete('/delete-file/:id',upload.none(), fileManagerController.deleteFileName)
router.post('/folder/create',upload.none(), fileManagerController.folderCreate)
router.delete('/folder/delete', fileManagerController.deleteFolder);


export default router;