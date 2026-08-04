import  { Request, Response } from "express"
import { permissionList } from "../../configs/variable.config"
import Role from "../../models/role.model";
import slugify from "slugify";

export const role = (req: Request, res: Response) => {
  const permissions = permissionList;
  res.render("admin/pages/role-create", {
    title: "Tạo nhóm quyền",
    permissions: permissions
  })
}

export const roleCreatePost = async (req: Request, res: Response) => {
  try {
    req.body.permissions = JSON.parse(req.body.permissions);

    req.body.search = slugify(`${req.body.name}`, {
      replacement: " ",
      lower: true
    });

    const newRecord = new Role(req.body);
    await newRecord.save();

    res.json({
      code: "success",
      message: "Tạo nhóm quyền thành công!"
    })
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ!"
    })
  }
}

