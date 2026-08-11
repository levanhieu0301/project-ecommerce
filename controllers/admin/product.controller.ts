import  { Request, Response } from "express"
import CategoryProduct from "../../models/category-product.model"
import slugify from "slugify"
import { treeCategory } from "../../helpers/treeCategory.helper"
import { pathAdmin } from "../../configs/variable.config"
import { logAdminAction } from "../../helpers/log-admin.helper"
import Product from "../../models/product.model"
import AttributeProduct from "../../models/attribute-product.model"

// Danh mục sản phẩm
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
    logAdminAction(req, `Đã tạo danh mục sản phẩm tên: ${req.body.name} (ID: ${newRecord.id})`)

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
export const editCategoryProduct = async (req: Request, res: Response) => {
  try {
    const categoryList = await CategoryProduct.find({});

    const categoryTree = treeCategory(categoryList);

    const id = req.params.id;

    const categoryDetail = await CategoryProduct.findOne({
      _id: id,
      deleted: false
    })

    if(!categoryDetail) {
      res.redirect(`/${pathAdmin}/product/category`);
      return;
    }

    res.render("admin/pages/product-category-edit", {
      pageTitle: "Chỉnh sửa danh mục sản phẩm",
      categoryList: categoryTree,
      categoryDetail: categoryDetail
    });
  } catch (error) {
    res.redirect(`/${pathAdmin}/product/category`);
  }
}

export const editCategoryProductPatch = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const existSlug = await CategoryProduct.findOne({
      _id: { $ne: id }, // Loại trừ bản ghi có _id trùng với id truyền vào
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

    await CategoryProduct.updateOne({
      _id: id,
      deleted: false
    }, req.body)
     logAdminAction(req, `Đã chỉnh sửa danh mục sản phẩm tên: ${req.body.name} (ID: ${id})`)
    res.json({
      code: "success",
      message: "Cập nhật thành công!"
    })
  } catch (error) {
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ!"
    })
  }
}
export const deleteCategoryProductPatch = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const recordDetail = await CategoryProduct.findOne({
      _id: id
    })

    await CategoryProduct.updateOne({
      _id: id
    }, {
      deleted: true,
      deletedAt: Date.now()
    })
     logAdminAction(req, `Đã xóa mềm danh mục sản phẩm tên: ${recordDetail?.name} (ID: ${id})`)
    res.json({
      code: "success",
      message: "Xóa danh mục thành công!"
    })
  } catch (error) {
    res.json({
      code: "error",
      message: "Id không hợp lệ!"
    })
  }
}

export const categoryProductTrash = async (req: Request, res: Response) => {
  const recordList: any = await CategoryProduct.find({
      deleted: true
    })

  res.render("admin/pages/product-category-trash", {
    pageTitle: "Thùng rác danh mục sản phẩm",
    recordList: recordList
  }); 
}
export const categoryProductUndo = async (req: Request, res: Response) => {
 try {
    const id = req.params.id;
    const articleDetail = await CategoryProduct.findOne({
      _id: id,
      deleted: false
    })
    await CategoryProduct.updateOne({
      _id: id
    }, {
      deleted: false
    })
    logAdminAction(req, `Đã khôi phục bài viết: ${articleDetail?.name} (ID: ${id})`)
    res.json({
      code: "success",
      message: "Khôi phục bài viết thành công!"
    })
  } catch (error) {
    res.json({
      code: "error",
      message: "Id không hợp lệ!"
    })
  }
}
export const categoryProductDestroy = async (req: Request, res: Response) => {
 try {
    const id = req.params.id;
    const articleDetail = await CategoryProduct.findOne({
      _id: id,
      deleted: false
    })
    logAdminAction(req, `Đã xóa vĩnh viễn bài viết: ${articleDetail?.name} (ID: ${id})`)
    await CategoryProduct.deleteOne({
      _id: id
    })
    
    res.json({
      code: "success",
      message: "Đã xóa vĩnh viễn bài viết!"
    })
  } catch (error) {
    res.json({
      code: "error",
      message: "Id không hợp lệ!"
    })
  }
}
// Sản phẩm
export const createProduct = async (req: Request, res: Response) => {
  const listCategoryProduct = await CategoryProduct.find({
    deleted: false,
  })
  const categoryTree: any = treeCategory(listCategoryProduct)
  res.render("admin/pages/product-create", {
      pageTitle: "Tạo sản phẩm",
      categoryList : categoryTree
    }); 
}
export const createProductPost = async (req: Request, res: Response) => {
    const existSlug = await Product.findOne({
      slug: req.body.slug
    })

    if(existSlug) {
      res.json({
        code: "error",
        message: "Đường dẫn đã tồn tại!"
      })
      return;
    }
    
    if(req.body.position){
      req.body.position = parseInt(req.body.position)
    }else {
      const recordMaxPosition = await Product
        .findOne({})
        .sort({
          position: "desc"
        })
      if(recordMaxPosition && recordMaxPosition.position){
        req.body.position = recordMaxPosition.position + 1
      }else {
        req.body.position = 1
      }
    }

    req.body.category = JSON.parse(req.body.category);
    req.body.images = JSON.parse(req.body.images);
    req.body.search = slugify(`${req.body.name}`, {
      replacement: " ",
      lower: true
    });
    const newRecord = new Product(req.body);
    await newRecord.save();

    logAdminAction(req, `Đã tạo sản phẩm: ${req.body.name} (Id: ${newRecord.id})`);

    res.json({
      code: "success",
      message: "Tạo sản phẩm thành công!"
    })

}

// Thuộc tính
export const attributeProduct = async (req: Request, res: Response) => {
  // const listAttribute = await AttributeProduct.find({
  //   deleted: false
  // })
  res.render("admin/pages/product-attribute", {
    pageTitle: "Thuộc tính sản phẩm",
    // listAttribute: listAttribute
  }); 
}
export const attributeCreateProduct = async (req: Request, res: Response) => {
  res.render("admin/pages/product-attribute-create", {
    pageTitle: "Tạo thuộc tính sản phẩm",
  }); 
}
export const createAttributePost = async (req: Request, res: Response) => {
  try {
    req.body.options = JSON.parse(req.body.options);

    req.body.search = slugify(`${req.body.name}`, {
      replacement: " ",
      lower: true
    });

    const newRecord = new AttributeProduct(req.body);
    await newRecord.save();

    res.json({
      code: "success",
      message: "Tạo thuộc tính thành công!"
    })
  } catch (error) {
    console.error(error);
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ!"
    })
  }
}
