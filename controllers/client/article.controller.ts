import  { Request, Response } from "express"
import CategoryBlog from "../../models/category-blog.model";

export const articleByCategory = async (req: Request, res: Response) => {
  const categoryDetail = await CategoryBlog.findOne({
    slug: req.params.slug,
    deleted: false,
    status: "active"
  })

  if(!categoryDetail) {
    res.redirect("/");
    return;
  }
  res.render("client/pages/article-by-category", {
    pageTitle: "Danh sách bài viết theo danh mục",
    categoryDetail: categoryDetail
  })
}
