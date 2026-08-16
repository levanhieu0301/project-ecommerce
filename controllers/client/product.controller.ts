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
  const find: any = {
      category: categoryDetail.id,
      status: "active",
      deleted: false
    }
    // Phân trang
    let limitItems = 20;
    if(req.query.limitItems) {
      const currentlimitItems = parseInt(`${req.query.limitItems}`);
      if(currentlimitItems > 0) {
        limitItems = currentlimitItems;
      }
    }
    let page = 1;
    if(req.query.page) {
      const currentPage = parseInt(`${req.query.page}`);
      if(currentPage > 0) {
        page = currentPage;
      }
    }
    const totalRecord = await Product.countDocuments(find);
    const totalPage = Math.ceil(totalRecord/limitItems);
    const skip = (page - 1) * limitItems;
    const pagination = {
      totalPage: totalPage,
      currentPage: page
    };
    // Hết Phân trang

  const listProductByCategory: any = await Product
    .find(find)
    .limit(limitItems)
    .skip(skip)
    .sort({
        position: "desc"
    })
    for(const category of listProductByCategory){
      category.discount = Math.floor(((category.priceOld - category.priceNew) / category.priceOld) * 100)
      // màu sắc
      // chỉ lọc ra bản ghi nào status : true
      const setColor = new Set();
      category.variants.filter( (variant : any) => variant.status).forEach((variant : any) => {
        variant.attributeValue.forEach((attri: any) => {
            if(attri.attriType =="color"){
              setColor.add(attri.value)
            }
        } )
      })
      category.listColor = [...setColor]
    }

  res.render("client/pages/product-by-category", {
    pageTitle: "Danh sách sản phẩm theo danh mục",
    categoryDetail: categoryDetail,
    listProductByCategory: listProductByCategory,
    pagination: pagination
  })
}
