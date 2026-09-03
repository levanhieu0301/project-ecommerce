import { Router } from "express";
import * as dashboardController from "../../controllers/client/dashboard.controller";
import * as dashboardValidate from "../../validates/client/dashboard.validate";
import multer from "multer";
const  upload = multer()

const router = Router();

router.get('/profile', dashboardController.profile);
router.get('/profile/edit', dashboardController.profileEdit);
router.patch(
  '/profile/edit', 
  dashboardValidate.profileEditPatch, 
  dashboardController.profileEditPatch
);
router.get('/change-password', dashboardController.changePassword);
router.get('/address', dashboardController.address);


router.get('/address/create', dashboardController.addressCreate);

router.post(
  '/address/create', 
  dashboardValidate.addressCreatePost,
  dashboardController.addressCreatePost
);

router.patch(
  '/address/change-default/:id', 
  dashboardController.addressChangeDefaultPatch
);
router.delete(
  '/address/delete/:id', 
  dashboardController.addressDelete
);
router.get('/address/edit/:id', dashboardController.addressEdit);

router.patch(
  '/address/edit/:id', 
  dashboardValidate.addressCreatePost,
  dashboardController.addressEditPatch
);
router.patch('/profile/change-avatar', upload.single('avatar'), dashboardController.profileChangeAvatar);


export default router;
