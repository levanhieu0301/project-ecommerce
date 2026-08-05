import  { Request, Response } from "express"
import AccountAdmin from "../../models/account-admin.model";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { pathAdmin } from "../../configs/variable.config";

export const login = (req: Request, res: Response) => {
  res.render("admin/pages/account-login", {
    pageTitle: "Đăng nhập"
  })
}
export const loginPost = async (req: Request, res: Response) => {
  const {email, password, rememberPassword} = req.body;
  const existAccount = await AccountAdmin.findOne({
    email: email,
    deleted: false,
  })
  if(!existAccount) {
    res.json({
      code: "error",
      message: "Email chưa được đăng ký!"
    })
    return;
  }

  const isPasswordValid = bcrypt.compareSync(password, `${existAccount.password}`);

  if(!isPasswordValid) {
    res.json({
      code: "error",
      message: "Mật khẩu không chính xác!"
    })
    return;
  }

  if(existAccount.status != "active") {
    res.json({
      code: "error",
      message: "Tài khoản chưa được kích hoạt!"
    })
    return;
  }
  // tạo token 
  const token = jwt.sign({
    id: existAccount.id,
    email: existAccount.email
  }
  , `${process.env.JWT_SECRET}`,
  { expiresIn: rememberPassword == "true" ? "7d" : "1d"});
  res.cookie("tokenAdmin", token, {
    httpOnly: true, // Chỉ cho phép server truy cập cookie, JavaScript ở client không thể đọc được
    secure: process.env.NODE_ENV === "production",// true: nếu là https, false: nếu là http
    sameSite: 'strict', // Chỉ gửi cookie khi request từ cùng domain
    maxAge: rememberPassword == "true" ? (7 * 24 * 60 * 60 * 1000) : (24 * 60 * 60 * 1000) // 7 ngày hoặc 1 ngày
  })
 res.json({
    code: "success",
    message: "Đăng nhập thành công!"
  })
}

export const logout = (req: Request, res: Response) => {
  res.clearCookie("tokenAdmin");
  res.redirect(`/${pathAdmin}/account/login`); 
}