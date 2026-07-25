import axios from "axios"
import  { Request, Response } from "express"
import FormData from "form-data"
import Media from "../../models/media.model"

export const fileManager = (req: Request, res: Response) => {
  res.render("admin/pages/file-manager", {
    title: "Upload file"
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

      const response = await axios.post(`http://localhost:4000/file-manager/upload`,formData, {
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