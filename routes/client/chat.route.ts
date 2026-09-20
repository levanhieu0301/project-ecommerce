
import { Router } from "express";
import * as chatController from "../../controllers/client/chat.controller";
import multer from "multer";
const upload = multer();

const router = Router();

router.get('/messages', chatController.messages);
router.post(
  '/upload', 
  upload.array("files"), 
  chatController.uploadPost
);
router.post('/rate', chatController.ratePost);

export default router;