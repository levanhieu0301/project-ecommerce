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
  const find: any = {
    category: categoryDetail.id,
    status: "published",
    deleted: false
  };
  // Phân trang
  const limitItems = 20;
  let page = 1;
  if(req.query.page) {
    const currentPage = parseInt(`${req.query.page}`);
    if(currentPage > 0) {
      page = currentPage;
    }
  }
  const totalRecord = await Blog.countDocuments(find);
  const totalPage = Math.ceil(totalRecord/limitItems);
  const skip = (page - 1) * limitItems;
  const pagination = {
    totalPage: totalPage,
    currentPage: page
  };
  // Hết Phân trang


  // Các bài viết thuộc danh mục  
  const listBlog: any = await Blog
    .find(find)
    .limit(limitItems)
    .skip(skip)
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
    listBlog: listBlog,
    pagination: pagination
  })
}
export const detail = async (req: Request, res: Response) => {
  const articleDetail: any = await Blog.findOne({
    slug: req.params.slug,
    deleted: false,
    status: "published"
  })

  if(!articleDetail) {
    res.redirect("/");
    return;
  }
  if(articleDetail.updatedBy) {
    const accountInfo = await AccountAdmin.findOne({
      _id: articleDetail.updatedBy
    })
    if(accountInfo) {
      articleDetail.authorName = accountInfo.fullName;
      articleDetail.date = moment(articleDetail.updatedAt).format("DD/MM/YYYY");
    }
  } else {
    const accountInfo = await AccountAdmin.findOne({
      _id: articleDetail.createdBy
    })
    if(accountInfo) {
      articleDetail.authorName = accountInfo.fullName;
      articleDetail.date = moment(articleDetail.createdAt).format("DD/MM/YYYY");
    }
    }


  res.render("client/pages/article-detail", {
    pageTitle: articleDetail.name,
    articleDetail: articleDetail,
  });
}
