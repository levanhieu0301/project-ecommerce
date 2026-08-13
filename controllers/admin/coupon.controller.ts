import { Request, Response } from 'express';
import Coupon from '../../models/coupon.model';
import moment from 'moment';
import slugify from 'slugify';

export const create = async (req: Request, res: Response) => {
  res.render("admin/pages/coupon-create", {
    pageTitle: "Tạo mã giảm giá"
  });
}

export const createPost = async (req: Request, res: Response) => {
  try {
    const existCoupon = await Coupon.findOne({
      code: req.body.code,
      deleted: false
    })

    if(existCoupon) {
      res.json({
        code: "error",
        message: "Mã giảm giá đã tồn tại!"
      })
      return;
    }

    req.body.value = req.body.value ? parseInt(req.body.value) : 0;
    req.body.minOrderValue = req.body.minOrderValue ? parseInt(req.body.minOrderValue) : 0;
    req.body.maxDiscountValue = req.body.maxDiscountValue ? parseInt(req.body.maxDiscountValue) : 0;
    req.body.usageLimit = req.body.usageLimit ? parseInt(req.body.usageLimit) : 0;
    req.body.startDate = req.body.startDate ? moment(req.body.startDate, "DD/MM/YYYY").toDate() : undefined;
    req.body.endDate = req.body.endDate ? moment(req.body.endDate, "DD/MM/YYYY").toDate() : undefined;

    req.body.search = slugify(`${req.body.code} ${req.body.name}`, {
      replacement: " ",
      lower: true
    });

    const newRecord = new Coupon(req.body);
    await newRecord.save();

    res.json({
      code: "success",
      message: "Đã tạo mã giảm giá!"
    })
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ!"
    })
  }
}
