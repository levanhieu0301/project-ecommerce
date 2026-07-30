import axios from "axios"
import  { Request, Response } from "express"
import FormData from "form-data"
import Media from "../../models/media.model"
import moment from "moment";
import { formatFileSize } from "../../helpers/format.helper";
import { domainCDN } from "../../configs/variable.config";


export const fileManager = async (req: Request, res: Response) => {
  const find : any ={
  }
  // Mặc định hiển thị file thư mục gốc media
  find.folder = "/media"
  if(req.query.folderPath !== undefined){
    find.folder = find.folder + `/${req.query.folderPath}`
  }
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
    .find(find)
    .sort({
      createdAt: "desc"
    })
    .limit(limitItems)
    .skip(skip)

  for(const item of fileList){
    item.createdAtFormat = moment(item.createdAt).format("HH:mm - DD/MM/YYYY");
    item.sizeFormat = formatFileSize(item.size)
  }
  // Call API lên hệ thống FM để lấy Danh sách folder 
  let folderList: any[] = []
  const response = await axios.get(`${domainCDN}/file-manager/folder/list?folderPath=${req.query.folderPath}`)
  if(response.data.code == "success"){
    folderList = response.data.folderList
    for (const item of folderList) {
      item.createdAtFormat = moment(item.createdAt).format("HH:mm - DD/MM/YYYY");
    }

  }
  // End Call API lên hệ thống FM để lấy Danh sách folder 


  res.render("admin/pages/file-manager", {
    title: "Upload file",
    fileList: fileList,
    pagination: pagination,
    folderList: folderList
  })
}

export const upload = async  (req: Request, res: Response) => {
  try {
      const files = req.files as Express.Multer.File[];
      const folderPath = req.query.folderPath
      const formData = new FormData();
      files?.forEach(file => {
        formData.append("files", file.buffer, {
          filename: file.originalname,
          contentType: file.mimetype,
        })
      })
      if(folderPath){
        formData.append("folderPath", folderPath)
      }

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

export const changeFileName = async  (req: Request, res: Response) => {
  try {
      const id = req.params.id;
  const {fileName} = req.body;
  const record = await Media.findOne({
      _id: id
  })

  if(!record) {
    res.json({
      code: "error",
      message: "Không tìm thấy file!"
    })
    return;
  }
  const formData = new FormData()
  formData.append("folder", record.folder)
  formData.append("oldName", record.filename)
  formData.append("newName", fileName)
  const response = await axios.patch(`${domainCDN}/file-manager/change-file-name`, formData, {
    headers: formData.getHeaders()
  })

  if(response.data.code == "error") {
    res.json({
      code: "error",
      message: response.data.message
    })
    return;
  }
  // Cập nhật lại trường filename trong CSDL
    await Media.updateOne({
      _id: id
    }, {
      filename: fileName
    })

    res.json({
      code: "success",
      message: "Đã đổi tên file!"
    })

  } catch (error) {
     res.json({
      code: "error",
      message: "Không tìm thấy file!"
    })

  }


}


export const deleteFileName = async  (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const record = await Media.findOne({
      _id: id
    })

    if(!record) {
      res.json({
        code: "error",
        message: "Không tìm thấy file!"
      })
      return;
    }

    const formData = new FormData();
    formData.append("folder", record.folder);
    formData.append("fileName", record.filename);

    const response = await axios.patch(`${domainCDN}/file-manager/delete-file`, formData, {
      headers: formData.getHeaders()
    });

    if(response.data.code == "error") {
      res.json({
        code: "error",
        message: response.data.message
      })
      return;
    }

    // Xóa bản ghi trong CSDL
    await Media.deleteOne({
      _id: id
    })

    res.json({
      code: "success",
      message: "Đã xóa file!"
    })
  } catch (error) {
    res.json({
      code: "error",
      message: "Id không hợp lệ!"
    })
  }


}

export const folderCreate = async  (req: Request, res: Response) => {
try {
  const { valueFolder, folderCurrent } = req.body;
  if(!valueFolder){
    res.json({
      code: "error",
      message: "Vui lòng nhập tên folder!"
    })
    return;
  }
    const formData = new FormData();
    formData.append("valueFolder", valueFolder);
    if(folderCurrent){
      formData.append("folderCurrent", folderCurrent);
    }

    const response = await axios.post(`${domainCDN}/file-manager/folder/create`, formData, {
      headers: formData.getHeaders()
    });
  if(response.data.code == "error"){
    res.json({
      code: "error",
      message: response.data.message
    })
    return;
  }
  res.json({
    code: "success",
    message: "Đã tạo folder!"
  })
} catch (error) {
  res.json({
    code: "error",
    message: "Lỗi tạo folder!"
  })
}}

export const deleteFolder = async (req: Request, res: Response) => {
  try {
    const folderPath = req.query.folderPath;

    if(!folderPath) {
      res.json({
        code: "error",
        message: "Vui lòng gửi kèm tên folder!"
      })
      return;
    }

    const formData = new FormData();
    formData.append("folderPath", folderPath);

    const response = await axios.patch(`${domainCDN}/file-manager/folder/delete`, formData, {
      headers: formData.getHeaders()
    });

    if(response.data.code == "error") {
      res.json({
        code: "error",
        message: response.data.message
      })
      return;
    }

    // Xóa các file liên quan trong CSDL
    const regexFolderPath = new RegExp(`${folderPath}`);
    await Media.deleteMany({
      folder: regexFolderPath
    });

    res.json({
      code: "success",
      message: "Đã xóa folder!"
    })
  } catch (error) {
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ!"
    })
  }
}
export const fileManagerIframe = async (req: Request, res: Response) => {
  res.render("admin/pages/file-manager-iframe", {
    pageTitle: "Quản lý file"
  });
}
