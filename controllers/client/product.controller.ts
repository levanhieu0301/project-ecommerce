import  { Request, Response } from "express"
import Product from "../../models/product.model"
import CategoryProduct from "../../models/category-product.model"
import { listProduct } from "../admin/product.controller"

export const category =async (req: Request, res: Response) => {
  const categoryDetail: any = await CategoryProduct.findOne({
    slug: req.params.slug,
    deleted: false,
    status: "active"
  })
  if(!categoryDetail){
    res.redirect("/")
  }
  const listProductByCategory = Product.find({
    category: categoryDetail.id,
    status: "active",
    deleted: false
  })
  res.render("client/pages/product-by-category", {
    pageTitle: "Danh sách sản phẩm theo danh mục",
    categoryDetail: categoryDetail,
    listProductByCategory: listProductByCategory
  })
}
