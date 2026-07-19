import  { Request, Response } from "express"
import CategoryBlog from "../../models/category-blog.model"
import { treeCategory } from "../../helpers/treeCategory.helper"

export const category = (req: Request, res: Response) => {
  res.render("admin/pages/article-category", {
    pageTitle: "Danh mục bài viết"
  })
}
export const categoryCreate = async  (req: Request, res: Response) => {
    const categoryList = await CategoryBlog.find({});
    const categoryTree: any = treeCategory(categoryList)

  res.render("admin/pages/article-create-category", {
    pageTitle: "Tạo danh mục bài viết",
    categoryList: categoryTree
  })
}

export const categoryCreatePost = async (req: Request, res: Response) => {
  const newRecord = new CategoryBlog(req.body);
  await newRecord.save();

  res.json({
    code: "success",
    message: "Tạo danh mục thành công!"
  })
}

// levanhieu0301_db_user = 5EW9pB4XTuXiPHtV
// mongodb+srv://levanhieu0301_db_user:5EW9pB4XTuXiPHtV@cluster0.uasdtw0.mongodb.net/?appName=Cluster0