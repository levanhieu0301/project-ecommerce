import { RequestAccount } from "../interfaces/request-account.interface"
import AdminLog from "../models/admin-log.model";

export const logAdminAction  =  async (req: RequestAccount, title: String) => {
  const dataFinal = {
    adminId: req.adminId,
    method: req.method, 
    route: req.originalUrl,
    title: title,
    expireAt: Date.now() + 30*24*60*60*1000
  }
  const newRecord = new AdminLog(dataFinal);
  await newRecord.save();

}