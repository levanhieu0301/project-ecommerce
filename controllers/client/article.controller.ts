import  { Request, Response } from "express"

export const articleByCategory = (req: Request, res: Response) => {
  console.log(req.params.slug);
  res.render("client/pages/article-by-category", {
    pageTitle: "Danh sách bài viết theo danh mục"
  })
}
