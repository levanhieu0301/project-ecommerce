
import { Router } from "express";
import * as couponController from "../../controllers/admin/coupon.controller";
import multer from "multer";
import * as couponValidate from "../../validates/admin/coupon.validate";

const router = Router();

const upload = multer();

router.get('/create', couponController.create);

router.post(
  '/create', 
  upload.none(), 
  couponValidate.createPost,
  couponController.createPost
);
router.get('/list', couponController.list);

export default router;