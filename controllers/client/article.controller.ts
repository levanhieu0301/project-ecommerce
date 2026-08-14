import  { Request, Response } from "express"
import CategoryBlog from "../../models/category-blog.model";
import Blog from "../../models/blog.model";
import moment from "moment";
import AccountAdmin from "../../models/account-admin.model";

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
  // Các bài viết thuộc danh mục  
  const listBlog: any = await Blog
    .find({
      category: categoryDetail.id,
      deleted: false,
      status: "published"
    })
    .sort({
      createdAt: "desc"
    })
  for (const blog of listBlog){
    // blog.createdAtFormat = moment(blog.createdAt).format("DD/MM/YYYY");
    if(blog.createdBy){
      const infoAuthor = await AccountAdmin.findOne({
        _id: blog.createdBy
      })
      if(infoAuthor){
        blog.authorName = infoAuthor.fullName
        blog.date = moment(blog.createdAt).format("DD/MM/YYYY");
      }
    }else {
      const infoAuthor = await AccountAdmin.findOne({
        _id: blog.updatedBy
      })
      if(infoAuthor){
        blog.authorName = infoAuthor.fullName
        blog.date = moment(blog.updatedAt).format("DD/MM/YYYY");
      }
    }
  }

  res.render("client/pages/article-by-category", {
    pageTitle: "Danh sách bài viết theo danh mục",
    categoryDetail: categoryDetail,
    listBlog: listBlog
  })
}
