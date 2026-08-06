import { NextFunction, Request, Response } from "express";
import { pathAdmin, permissionList } from "../../configs/variable.config";
import jwt from "jsonwebtoken";
import AccountAdmin from "../../models/account-admin.model";
import Role from "../../models/role.model";


export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
try {
    const token = req.cookies.tokenAdmin;
    if(!token) {
      res.redirect(`/${pathAdmin}/account/login`);
      return;
    }

    // Giải mã token
    const decoded = jwt.verify(token, `${process.env.JWT_SECRET}`) as jwt.JwtPayload;
    if(decoded.email === process.env.SUPER_ADMIN_EMAIL && decoded.id === process.env.SUPER_ADMIN_ID){
      res.locals.accountAdmin = {
        fullName: "SuperAdmin",
        email: process.env.SUPER_ADMIN_EMAIL,
        avatar: "/admin/assets/images/users/avatar-1.jpg",
        isSuperAdmin: true
      };
      res.locals.permissionList = permissionList.map(item => item.id)

    }else {
      const existAccount = await AccountAdmin.findOne({
      _id: decoded.id,
      email: decoded.email,
      deleted: false,
      status: "active"
      
      })

      if(!existAccount) {
        res.redirect(`/${pathAdmin}/account/login`);
        return;
      }
      //Lấy ra role
      let permissionList: string[] = []
      for(const roleId of existAccount.roles){
        const role = await Role.findOne({
          _id: roleId,
          deleted: false,
          status: "active"
        })
        if(role){
          permissionList = [...permissionList, ...role.permissions]
        }
      }
      res.locals.permissionList = permissionList
      //trả về file pug
      res.locals.accountAdmin = {
        fullName: existAccount.fullName,
        email: existAccount.email,
        avatar: existAccount.avatar,
        isSuperAdmin: false
      };


    }
    next();
  } catch (error) {
    console.log(error);
    res.redirect(`/${pathAdmin}/account/login`);
  }

}
export const checkPermissions = (permissionName : string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if(res.locals.permissionList.includes(permissionName)){
      next();
    }else {
      res.json({
        code: "error",
        message: "Không đủ quyền!"
      });
    }
  }
}
