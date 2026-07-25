import axios from "axios"
import  { Request, Response } from "express"
import FormData from "form-data"
import Media from "../../models/media.model"
import moment from "moment";
import { formatFileSize } from "../../helpers/format.helper";
import { domainCDN } from "../../configs/variable.config";


export const fileManager = async (req: Request, res: Response) => {
    // Phân trang
  const limitItems = 20;
  let page = 1;
  if(req.query.page && parseInt(`${req.query.page}`) > 0) {
    page = parseInt(`${req.query.page}`);
  }
  const totalRecord = await Media.countDocuments({});
  const totalPage = Math.ceil(totalRecord/limitItems);
  const skip = (page - 1) * limitItems;
  const pagination = {
    totalRecord: totalRecord,
    totalPage: totalPage,
    skip: skip
  };
  // Hết Phân trang

  const fileList: any = await Media
    .find({})
    .sort({
      createdAt: "desc"
    })
    .limit(limitItems)
    .skip(skip)

  for(const item of fileList){
    item.createdAtFormat = moment(item.createdAt).format("HH:mm - DD/MM/YYYY");
    item.sizeFormat = formatFileSize(item.size)
  }

  res.render("admin/pages/file-manager", {
    title: "Upload file",
    fileList: fileList,
     pagination: pagination
  })
}

export const upload = async  (req: Request, res: Response) => {
  try {
      const files = req.files as Express.Multer.File[];
      const formData = new FormData();
      files?.forEach(file => {
        formData.append("files", file.buffer, {
          filename: file.originalname,
          contentType: file.mimetype,
        })
      })

      const response = await axios.post(`${domainCDN}/file-manager/upload`,formData, {
        headers: formData.getHeaders() // để bên kia nhận được file
      })
      if(response.data.code == "success"){
        await Media.insertMany(response.data.saveLink)
      }

      res.json({
        code: "success",
        message: "Upload thành công!"

      })
  } catch (error) {
      res.json({
        code: "success",
        message: "Lỗi upload!"

      })
  }
}