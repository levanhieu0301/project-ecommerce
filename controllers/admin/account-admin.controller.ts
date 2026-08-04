import  { Request, Response } from "express"
import Role from "../../models/role.model"
import AccountAdmin from "../../models/account-admin.model"
import bcrypt from "bcryptjs"
import slugify from "slugify"

export const createAccountAdmin = async (req: Request, res: Response) => {
  const roleList = await Role.find({})
  res.render("admin/pages/account-admin-create", {
    title: "Tạo tài khoản quản trị",
    roleList: roleList
  })
}
export const createAccountAdminPost = async (req: Request, res: Response) => {
  try {
    const existAccount = await AccountAdmin.findOne({
      email: req.body.email
    })

    if(existAccount) {
      res.json({
        code: "error",
        message: "Email đã tồn tại!"
      })
      return;
    }

    req.body.roles = JSON.parse(req.body.roles);

    req.body.search = slugify(`${req.body.fullName} ${req.body.email}`, {
      replacement: " ",
      lower: true
    });

    // Mã hóa mật khẩu
    req.body.password = await bcrypt.hash(req.body.password, 10);

    const newRecord = new AccountAdmin(req.body);
    await newRecord.save();

    res.json({
      code: "success",
      message: "Tạo tài khoản thành công!"
    })
  } catch (error) {
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ!"
    })
  }

}
