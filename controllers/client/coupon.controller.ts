import { Request, Response } from "express";
import Coupon from "../../models/coupon.model";

export const checkPost = async (req: Request, res: Response) => {
  try {
    const { coupon } = req.body;
    // Tìm mã coupon
    const couponDetail = await Coupon.findOne({
      code: coupon.trim(),
      deleted: false,
      status: "active"
    });

    if (!couponDetail) {
      res.json({
        code: "error",
        message: "Mã giảm giá không tồn tại!",
      });
      return;
    }
    const now = new Date();
    if(couponDetail.startDate && couponDetail.startDate > now) {
      res.json({
        code: "error",
        message: "Mã giảm giá chưa bắt đầu!",
      });
      return;
    }
    if(couponDetail.endDate && couponDetail.endDate < now) {
      res.json({
        code: "error",
        message: "Mã giảm giá đã hết hạn!",
      });
      return;
    }
    if(couponDetail.usageLimit && couponDetail.usedCount >= couponDetail.usageLimit) {
      res.json({
        code: "error",
        message: "Mã giảm giá đã hết lượt sử dụng!",
      });
      return;
    }

    res.json({
      code: "success",
      message: "Đã áp dụng mã giảm giá!",
      coupon: couponDetail
    })
  } catch (error) {
    console.error(error);
    res.json({
      code: "error",
      message: "Mã giảm giá không hợp lệ!"
    })
  }
}
