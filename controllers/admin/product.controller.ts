import  { Request, Response } from "express"
import CategoryProduct from "../../models/category-product.model"
import slugify from "slugify"
import { treeCategory } from "../../helpers/treeCategory.helper"

export const categoryProduct = async (req: Request, res: Response) => {
  const find : {
    deleted: boolean,
    search?: RegExp
  } = {
    deleted: false,
  }
   // Phân trang
  const limitItems = 20;
  let page = 1;
  if(req.query.page && parseInt(`${req.query.page}`) > 0) {
    page = parseInt(`${req.query.page}`);
  }
  const totalRecord = await CategoryProduct.countDocuments(find);
  const totalPage = Math.ceil(totalRecord/limitItems);
  const skip = (page - 1) * limitItems;
  const pagination = {
    totalRecord: totalRecord,
    totalPage: totalPage,
    skip: skip
  };
  // Hết Phân trang
  // Tìm kiếm
  if(req.query.keyword) {
    const keyword = slugify(`${req.query.keyword}`, {
      replacement: " ",
      lower: true
    });
    const keywordRegex = new RegExp(keyword, "i");
    find.search = keywordRegex;
  }

  const recordList: any = await CategoryProduct
    .find(find)
    .sort({
      createdAt: "desc"
    })
    .limit(limitItems)
    .skip(skip)

  for(const record of recordList){
    if(record.parent){
      const parent = await CategoryProduct.findOne({
        _id: record.parent
      })
      if(parent){
        record.parentName = parent.name
      }
    }
  }
  res.render("admin/pages/product-category", {
    pageTitle: "Danh mục sản phẩm",
    recordList: recordList,
    pagination: pagination
  })
}
export const categoryProductCreate = async (req: Request, res: Response) => {
      const categoryList = await CategoryProduct.find({});
    const categoryTree: any = treeCategory(categoryList)
  res.render("admin/pages/product-category-create", {
    pageTitle: "Tạo danh mục sản phẩm",
    categoryList: categoryTree
  })
}
export const categoryProductCreatePost =async  (req: Request, res: Response) => {
  try {
    const existSlug = await CategoryProduct.findOne({
      slug: req.body.slug
    })

    if(existSlug) {
      res.json({
        code: "error",
        message: "Đường dẫn đã tồn tại!"
      })
      return;
    }

    req.body.search = slugify(`${req.body.name}`, {
      replacement: " ",
      lower: true
    });

    const newRecord = new CategoryProduct(req.body);
    await newRecord.save();

    res.json({
      code: "success",
      message: "Tạo danh mục thành công!"
    })
  } catch (error) {
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ!"
    })
  }

}