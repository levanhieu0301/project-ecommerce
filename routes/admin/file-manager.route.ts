import { Router } from "express";
const router = Router();
import * as fileManagerController from "../../controllers/admin/file-manager.controller"
import multer from "multer";
// const upload = multer();
// Dùng memoryStorage để giữ file trong buffer
const storage = multer.memoryStorage();

// Fix lỗi font tiếng Việt trong tên file (multer mặc định Latin1)
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Ép originalname về UTF-8
    file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
    cb(null, true);
  }
});



router.get('/', fileManagerController.fileManager)
router.get('/iframe', fileManagerController.fileManagerIframe)
router.post('/upload',upload.array("files"), fileManagerController.upload)
router.patch('/change-file-name/:id',upload.none(), fileManagerController.changeFileName)
router.delete('/delete-file/:id',upload.none(), fileManagerController.deleteFileName)
router.post('/folder/create',upload.none(), fileManagerController.folderCreate)
router.delete('/folder/delete', fileManagerController.deleteFolder);


export default router;