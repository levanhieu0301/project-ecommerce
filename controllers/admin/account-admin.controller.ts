import  { Request, Response } from "express"
import Role from "../../models/role.model"
import AccountAdmin from "../../models/account-admin.model"
import bcrypt from "bcryptjs"
import slugify from "slugify"
import { pathAdmin } from "../../configs/variable.config"


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
export const accountAdminList = async (req: Request, res: Response) => {
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
  const totalRecord = await AccountAdmin.countDocuments(find);
  const totalPage = Math.ceil(totalRecord/limitItems);
  const skip = (page - 1) * limitItems;
  const pagination = {
    skip: skip,
    totalRecord: totalRecord,
    totalPage: totalPage
  };
  // Hết Phân trang

  const recordList: any = await AccountAdmin
    .find(find)
    .limit(limitItems)
    .skip(skip)
    .sort({
      createdAt: "desc"
    });

  for (const item of recordList) {
    const roleList = await Role.find({
      _id: { $in: item.roles }
    })
    item.rolesName = roleList.map(item => item.name);
  }

  // const listAccountAdmin: any = await AccountAdmin.find({})
  // const listAccountAdminNew = []
  // for (const record of listAccountAdmin) {
  //   const roleList: any = []
  //   for(let i = 0; i < record.roles.length; i++) {
  //     const role :any= await Role.findOne({
  //       _id: record.roles[i]
  //     })
  //     if(role){
  //       const roleName = role.name
  //       roleList.push(roleName)
  //     }
  //   }
  //   const newRecord = {
  //     ...record,
  //     rolesName: roleList
  //   }
  //   listAccountAdminNew.push(newRecord)
  // }
  // console.log(listAccountAdminNew)

  res.render("admin/pages/account-admin-list", {
    pageTitle: "Danh sách tài khoản quản trị",
    recordList: recordList,
    pagination: pagination

  })
}

export const accountAdminEdit = async (req: Request, res: Response) => {
  const roleList = await Role.find({
    deleted: false,
    status: "active"
  })
  const id = req.params.id;
  const existRecord = await AccountAdmin.findOne({
    _id: id, 
    deleted: false
  })
  if(!existRecord) {
    res.redirect(`/${pathAdmin}/account-admin/list`)
    return;
  }
  res.render("admin/pages/account-admin-edit", {
    pageTitle: "Chỉnh sửa tài khoản quản trị",
    recordDetail: existRecord, 
    roleList: roleList
  })

}
export const accountAdminEditPatch = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const accountDetail = await AccountAdmin.findOne({
      _id: id,
      deleted: false
    })
    if(!accountDetail) {
      res.json({
        code: "error",
        message: "Tài khoản không tồn tại!"
      })
      return;
    }
    const existEmail = await AccountAdmin.findOne({
      email: req.body.email,
      _id: { $ne: id } // not equal - không bằng
    })
    if(existEmail) {
      res.json({
        code: "error",
        message: "Email đã được sử dụng bởi tác khoản khác!"
      })
      return;
    }
    req.body.roles = JSON.parse(req.body.roles);
    req.body.search = slugify(`${req.body.fullName} ${req.body.email}`, {
      replacement: " ",
      lower: true
    });
    await AccountAdmin.updateOne({
      _id: id,
      deleted: false
    }, req.body);

    res.json({
      code: "success",
      message: "Cập nhật thành công!"
    })
  } catch (error) {
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ!"
    })
  }

}
export const accountAdminDelete = async (req: Request, res: Response) => {
    try {
    const id = req.params.id;

    await AccountAdmin.updateOne({
      _id: id
    }, {
      deleted: true,
      deletedAt: Date.now(),
    });

    res.json({
      code: "success",
      message: "Xóa tài khoản thành công!"
    })
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Id không hợp lệ!"
    })
  }
}
export const accountAdminTrash = async (req: Request, res: Response) => {
  const find: {
    deleted: boolean,
    search?: RegExp
  } = {
    deleted: true
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
  const totalRecord = await AccountAdmin.countDocuments(find);
  const totalPage = Math.ceil(totalRecord/limitItems);
  const skip = (page - 1) * limitItems;
  const pagination = {
    skip: skip,
    totalRecord: totalRecord,
    totalPage: totalPage
  };
  // Hết Phân trang

  const recordList: any = await AccountAdmin
    .find(find)
    .limit(limitItems)
    .skip(skip)
    .sort({
      createdAt: "desc"
    });

  for (const item of recordList) {
    const roleList = await Role.find({
      _id: { $in: item.roles }
    })
    item.rolesName = roleList.map(item => item.name);
  }
  res.render("admin/pages/account-admin-trash", {
    pageTitle: "Thùng rác tài khoản quản trị",
    recordList: recordList,
    pagination: pagination

  })
}
export const accountAdminUndo = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    await AccountAdmin.updateOne({
      _id: id
    }, {
      deleted: false,
    });

    res.json({
      code: "success",
      message: "Khôi phục tài khoản thành công!"
    })
  } catch (error) {
    res.json({
      code: "error",
      message: "Id không hợp lệ!"
    })
  }
}
export const accountAdminDestroy = async (req: Request, res: Response) => {
  try {
      const id = req.params.id;

      await AccountAdmin.deleteOne({
        _id: id
      });

      res.json({
        code: "success",
        message: "Xóa tài khoản thành công!"
      })
    } catch (error) {
      console.log(error);
      res.json({
        code: "error",
        message: "Id không hợp lệ!"
      })
    }
}