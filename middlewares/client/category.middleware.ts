import { NextFunction, Request, Response } from "express";
import CategoryProduct from "../../models/category-product.model";
import { treeCategory } from "../../helpers/treeCategory.helper";
import CategoryBlog from "../../models/category-blog.model";

export const category = async (req: Request, res: Response, next: NextFunction) => {
  // Lấy ra danh mục sản phẩm 
  const recordCategoryProduct = await CategoryProduct.find({
    deleted: false,
    status: "active"
  })
  const listCategoryProduct = treeCategory(recordCategoryProduct)
  res.locals.listCategoryProduct = listCategoryProduct

  // Hết Danh sách danh mục sản phẩm

  // Danh sách danh mục bài viết
  const categoryArticleList = await CategoryBlog.find({
    deleted: false,
    status: "active"
  });
  const categoryArticleTree = treeCategory(categoryArticleList);
  res.locals.categoryArticleList = categoryArticleTree;
  // Hết Danh sách danh mục bài viết

  next();
}