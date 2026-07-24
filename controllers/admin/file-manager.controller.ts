import  { Request, Response } from "express"

export const fileManager = (req: Request, res: Response) => {
  res.render("admin/pages/file-manager", {
    title: "Upload file"
  })
}

export const upload = (req: Request, res: Response) => {
  console.log(req.files)

  res.json({
    code: "success"
  })
}