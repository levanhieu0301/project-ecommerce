import { NextFunction, Request, Response } from "express";
import CategoryProduct from "../../models/category-product.model";
import { treeCategory } from "../../helpers/treeCategory.helper";
import CategoryBlog from "../../models/category-blog.model";
import AttributeProduct from "../../models/attribute-product.model";

export const attribute = async (req: Request, res: Response, next: NextFunction) => {
  const listAttribute = await AttributeProduct.find({
    deleted: false
  })
  res.locals.listAttribute  = listAttribute

  next();
}