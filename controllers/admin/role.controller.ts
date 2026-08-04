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
export const roleList = async (req: Request, res: Response) => {
  const find: {
    deleted: boolean,
    search?: RegExp
  } = {
    deleted: false
  };

  if(req.query.keyword) {
    const keyword = slugify(`${req.query.keyword}`, {
      replacement: ' ',
      lower: true, // Chữ thường
    })
    const keywordRegex = new RegExp(keyword, "i");
    find.search = keywordRegex;
  }

  // Phân trang
  const limitItems = 20;
  let page = 1;
  if(req.query.page) {
    const currentPage = parseInt(`${req.query.page}`);
    if(currentPage > 0) {
      page = currentPage;
    }
  }
  const totalRecord = await Role.countDocuments(find);
  const totalPage = Math.ceil(totalRecord/limitItems);
  const skip = (page - 1) * limitItems;
  const pagination = {
    skip: skip,
    totalRecord: totalRecord,
    totalPage: totalPage
  };
  // Hết Phân trang

  const recordList: any = await Role
    .find(find)
    .limit(limitItems)
    .skip(skip)
    .sort({
      createdAt: "desc"
    });

  res.render("admin/pages/role-list", {
    pageTitle: "Danh sách nhóm quyền",
    recordList: recordList,
    pagination: pagination
  });

}

