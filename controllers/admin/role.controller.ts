import  { Request, Response } from "express"
import { pathAdmin, permissionList } from "../../configs/variable.config"
import Role from "../../models/role.model";
import slugify from "slugify";
import { logAdminAction } from "../../helpers/log-admin.helper";

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
    logAdminAction(req, `Đã tạo nhóm quyền tên: ${req.body.name} (ID: ${newRecord.id})`)
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

export const roleEdit = async (req: Request, res: Response) => {
    const id = req.params.id;
    const  permissions = permissionList;
    const roleDetail = await Role.findOne({
      _id: id,
      deleted: false
    })

    if(!roleDetail) {
      res.redirect(`/${pathAdmin}/role/list`);
      return;
    }

  res.render("admin/pages/role-edit", {
    title: "Chỉnh sửa nhóm quyền",
    permissions: permissions,
    record: roleDetail
  })
}
export const roleEditPatch = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const roleDetail = await Role.findOne({
      _id: id,
      deleted: false
    })

    if(!roleDetail) {
      res.json({
        code: "error",
        message: "Nhóm quyền không tồn tại!"
      })
      return;
    }

    req.body.permissions = JSON.parse(req.body.permissions);

    req.body.search = slugify(req.body.name, {
      replacement: ' ',
      lower: true, // Chữ thường
    })

    await Role.updateOne({
      _id: id,
      deleted: false
    }, req.body);
  logAdminAction(req, `Đã chỉnh sửa nhóm quyền tên: ${req.body.name} (ID: ${id})`)
    res.json({
      code: "success",
      message: "Cập nhật thành công!"
    })
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Id không hợp lệ!"
    })
  }

}
export const roleDeletePatch = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const roleDetail = await Role.findOne({
      _id: id
    })

    await Role.updateOne({
      _id: id
    }, {
      deleted: true,
      deletedAt: Date.now(),
    });
    logAdminAction(req, `Đã xóa mềm nhóm quyền tên: ${roleDetail?.name} (ID: ${id})`)
    res.json({
      code: "success",
      message: "Xóa nhóm quyền thành công!"
    })
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Id không hợp lệ!"
    })
  }
}
export const roleTrash = async (req: Request, res: Response) => {
  const recordList: any = await Role.find({
    deleted: true
  })
  res.render("admin/pages/role-trash", {
    pageTitle: "Thùng rác nhóm quyền",
    recordList: recordList
  })
}
export const roleUndo = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const roleDetail = await Role.findOne({
      _id: id
    })
    await Role.updateOne({
      _id: id
    }, {
      deleted: false,
    });
  logAdminAction(req, `Đã khôi phục nhóm quyền tên: ${roleDetail?.name} (ID: ${id})`)
    res.json({
      code: "success",
      message: "Khôi phục nhóm quyền thành công!"
    })
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Id không hợp lệ!"
    })
  }
}

export const roleDestroy = async (req: Request, res: Response) => {
  try {
      const id = req.params.id;
    const roleDetail = await Role.findOne({
      _id: id
    })
      await Role.deleteOne({
        _id: id
      });
      logAdminAction(req, `Đã tạo nhóm quyền tên: ${roleDetail?.name} (ID: ${id})`)
      res.json({
        code: "success",
        message: "Xóa nhóm quyền thành công!"
      })
    } catch (error) {
      console.log(error);
      res.json({
        code: "error",
        message: "Id không hợp lệ!"
      })
    }
}