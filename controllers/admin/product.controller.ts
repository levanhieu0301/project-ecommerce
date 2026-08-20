import  { Request, Response } from "express"
import CategoryProduct from "../../models/category-product.model"
import slugify from "slugify"
import { treeCategory } from "../../helpers/treeCategory.helper"
import { pathAdmin } from "../../configs/variable.config"
import { logAdminAction } from "../../helpers/log-admin.helper"
import Product from "../../models/product.model"
import AttributeProduct from "../../models/attribute-product.model"
import { Parser } from 'json2csv';
import Papa from 'papaparse';
import { generateRandomString } from "../../helpers/generate.helper"

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
    logAdminAction(req, `Đã khôi phục bài danh mục sản phẩm: ${articleDetail?.name} (ID: ${id})`)
    res.json({
      code: "success",
      message: "Khôi phục danh mục thành công!"
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
    logAdminAction(req, `Đã xóa vĩnh viễn danh mục: ${articleDetail?.name} (ID: ${id})`)
    await CategoryProduct.deleteOne({
      _id: id
    })
    
    res.json({
      code: "success",
      message: "Đã xóa vĩnh viễn danh mục!"
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
  const attributeList = await AttributeProduct.find({
    deleted: false
  })
    // Danh sách sản phẩm
  const productList = await Product
    .find({
      deleted: false,
      status: "active"
    })
    .sort({
      position: "desc"
    })
    .select("id name")
    .lean();
  // Hết Danh sách sản phẩm

  res.render("admin/pages/product-create", {
      pageTitle: "Tạo sản phẩm",
      categoryList : categoryTree,
      attributeList: attributeList,
      productList: productList
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
    
    req.body.attributes = JSON.parse(req.body.attributes);

    req.body.variants = JSON.parse(req.body.variants);
    req.body.tags = JSON.parse(req.body.tags);
    req.body.sku = generateRandomString(10).toUpperCase();
    req.body.boughtTogether = JSON.parse(req.body.boughtTogether);
    
    if(req.body.priceOld) {
      req.body.priceOld = parseInt(req.body.priceOld);
    }
    if(req.body.priceNew){
      req.body.priceNew = parseInt(req.body.priceNew)
      req.body.discount = Math.floor(((req.body.priceOld - req.body.priceNew) / req.body.priceOld) * 100);
    }else {
      req.body.priceNew = parseInt(req.body.priceOld)
      req.body.discount = 0;
    }
    
    if(req.body.stock) {
      req.body.stock = parseInt(req.body.stock);
    }
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
export const listProduct = async (req: Request, res: Response) => {
  const find: {
    deleted: boolean,
    search?: RegExp
  } = {
    deleted: false
  };

  if(req.query.keyword) {
    const keyword = slugify(`${req.query.keyword}`, {
      replacement: ' ',
      lower: true, // Chữ thường
    })
    const keywordRegex = new RegExp(keyword, "i");
    find.search = keywordRegex;
  }

  // Phân trang
  const limitItems = 20;
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
    skip: skip,
    totalRecord: totalRecord,
    totalPage: totalPage
  };
  // Hết Phân trang
  const recordList: any = await Product
    .find(find)
    .limit(limitItems)
    .skip(skip)
    .sort({
      position: "desc"
    });

 res.render("admin/pages/product-list", {
    pageTitle: "Danh sách sản phẩm",
    recordList: recordList,
    pagination: pagination
  });
}
export const editProduct = async (req: Request, res: Response) => {
  try {
    const listCategoryProduct = await CategoryProduct.find({
      deleted: false,
    })
    const categoryTree: any = treeCategory(listCategoryProduct)
    const attributeList = await AttributeProduct.find({
      deleted: false
    })
    const id = req.params.id
    const recordProduct: any = await Product.findOne({
      _id: id
    })
    if(!recordProduct){
      res.redirect("/${pathAdmin}/product/list")
    }
    const arrayNameAttri: string[]  = []
    if(recordProduct) {
      for(const item of recordProduct.attributes){
        const recordAttribute = await AttributeProduct.findOne({
          _id: item
        })
        if(recordAttribute){
          arrayNameAttri.push(`${recordAttribute.name}`)
        }
      }
    }
        // Danh sách sản phẩm
    const productList = await Product
      .find({
        _id: { $ne: recordProduct.id },
        deleted: false,
        status: "active"
      })
      .sort({
        position: "desc"
      })
      .select("id name")
      .lean();
    // Hết Danh sách sản phẩm



    res.render("admin/pages/product-edit", {
      pageTitle: "Chỉnh sửa sản phẩm",
      recordProduct: recordProduct,
      categoryList: categoryTree,
      attributeList: attributeList,
      arrayNameAttri: arrayNameAttri,
      productList: productList
    }); 
  } catch (error) {
    res.json({
      code: "error",
      message: "Id không hợp lệ!"
    })
  }
}
export const editPatch = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const productDetail = await Product.findOne({
      _id: id,
      deleted: false
    })

    if(!productDetail) {
      res.json({
        code: "error",
        message: "Sản phẩm không tồn tại!"
      });
      return;
    }

    const existSlug = await Product.findOne({
      _id: { $ne: id },
      slug: req.body.slug
    })

    if(existSlug) {
      res.json({
        code: "error",
        message: "Đường dẫn đã tồn tại!"
      })
      return;
    }

    if(req.body.position) {
      req.body.position = parseInt(req.body.position);
    } else {
      // Nếu không truyền position -> lấy position lớn nhất + 1
      const recordMaxPosition = await Product
        .findOne({})
        .sort({
          position: "desc"
        });
      if(recordMaxPosition && recordMaxPosition.position) {
        req.body.position = recordMaxPosition.position + 1;
      } else {
        req.body.position = 1;
      }
    }

    req.body.category = JSON.parse(req.body.category);

    req.body.images = JSON.parse(req.body.images);

    req.body.search = slugify(`${req.body.name}`, {
      replacement: " ",
      lower: true
    });

    if(req.body.priceOld) {
      req.body.priceOld = parseInt(req.body.priceOld);
    }

    if(req.body.priceNew) {
      req.body.priceNew = parseInt(req.body.priceNew);
      req.body.discount = Math.floor(((req.body.priceOld - req.body.priceNew) / req.body.priceOld) * 100);
    } else {
      req.body.priceNew = req.body.priceOld;
      req.body.discount = 0;
    }

    if(req.body.stock) {
      req.body.stock = parseInt(req.body.stock);
    }

    req.body.attributes = JSON.parse(req.body.attributes);
    req.body.boughtTogether = JSON.parse(req.body.boughtTogether);
    req.body.variants = JSON.parse(req.body.variants);

    req.body.tags = JSON.parse(req.body.tags);
    if(!productDetail.sku) {
      req.body.sku = generateRandomString(10).toUpperCase();
    }

    await Product.updateOne({
      _id: id,
      deleted: false
    }, req.body);

    logAdminAction(req, `Đã sửa sản phẩm: ${productDetail.name} (Id: ${productDetail.id})`);

    res.json({
      code: "success",
      message: "Cập nhật sản phẩm thành công!"
    })
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ!"
    });
  }
}
export const deletePatch = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const productDetail = await Product.findOne({
      _id: id,
    })

    await Product.updateOne({
      _id: id
    }, {
      deleted: true,
      deletedAt: Date.now(),
    });
    logAdminAction(req, `Đã xóa mềm sản phẩm: ${productDetail?.name} (Id: ${id})`);
    res.json({
      code: "success",
      message: "Xóa sản phẩm thành công!"
    })
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Id không hợp lệ!"
    })
  }
}


export const trashProduct = async (req: Request, res: Response) => {
  const find: {
    deleted: boolean,
    search?: RegExp
  } = {
    deleted: true
  };

  if(req.query.keyword) {
    const keyword = slugify(`${req.query.keyword}`, {
      replacement: ' ',
      lower: true, // Chữ thường
    })
    const keywordRegex = new RegExp(keyword, "i");
    find.search = keywordRegex;
  }

  // Phân trang
  const limitItems = 20;
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
    skip: skip,
    totalRecord: totalRecord,
    totalPage: totalPage
  };
  // Hết Phân trang
  const recordList: any = await Product
    .find(find)
    .limit(limitItems)
    .skip(skip)
    .sort({
      position: "desc"
    });

 res.render("admin/pages/product-trash", {
    pageTitle: "Thùng rác sản phẩm",
    recordList: recordList,
    pagination: pagination
  });
}
export const undoProduct = async (req: Request, res: Response) => {
 try {
    const id = req.params.id;
    const productDetail = await Product.findOne({
      _id: id,
    })
    await Product.updateOne({
      _id: id
    }, {
      deleted: false
    })
    logAdminAction(req, `Đã khôi phục sản phẩm: ${productDetail?.name} (ID: ${id})`)
    res.json({
      code: "success",
      message: "Khôi phục sản phẩm thành công!"
    })
  } catch (error) {
    res.json({
      code: "error",
      message: "Id không hợp lệ!"
    })
  }
}
export const destroyProduct = async (req: Request, res: Response) => {
 try {
    const id = req.params.id;
    const productDetail = await Product.findOne({
      _id: id,
    })
    logAdminAction(req, `Đã xóa vĩnh viễn sản phẩm: ${productDetail?.name} (ID: ${id})`)
    await Product.deleteOne({
      _id: id
    })
    
    res.json({
      code: "success",
      message: "Đã xóa vĩnh viễn sản phẩm!"
    })
  } catch (error) {
    res.json({
      code: "error",
      message: "Id không hợp lệ!"
    })
  }
}




// Thuộc tính
export const attributeProduct = async (req: Request, res: Response) => {
  const find: {
      deleted: boolean,
      search?: RegExp
    } = {
      deleted: false
    };

  if(req.query.keyword) {
    const keyword = slugify(`${req.query.keyword}`, {
      replacement: ' ',
      lower: true, // Chữ thường
    })
    const keywordRegex = new RegExp(keyword, "i");
    find.search = keywordRegex;
  }

  // Phân trang
  const limitItems = 20;
  let page = 1;
  if(req.query.page) {
    const currentPage = parseInt(`${req.query.page}`);
    if(currentPage > 0) {
      page = currentPage;
    }
  }
  const totalRecord = await AttributeProduct.countDocuments(find);
  const totalPage = Math.ceil(totalRecord/limitItems);
  const skip = (page - 1) * limitItems;
  const pagination = {
    skip: skip,
    totalRecord: totalRecord,
    totalPage: totalPage
  };
  // Hết Phân trang

  const recordList: any = await AttributeProduct
    .find(find)
    .limit(limitItems)
    .skip(skip)
    .sort({
      createdAt: "desc"
    });

  res.render("admin/pages/product-attribute", {
    pageTitle: "Thuộc tính sản phẩm",
    listAttribute: recordList,
    pagination: pagination
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
    logAdminAction(req, `Đã tạo thuộc tính tên: ${req.body.name} (Id: ${newRecord.id})`);
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
export const attributeEditProduct = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const attributeDetail = await AttributeProduct.findOne({
      _id: id,
      deleted: false
    })

    if(!attributeDetail) {
      res.redirect(`/${pathAdmin}/product/attribute`);
      return;
    }

    res.render("admin/pages/product-attribute-edit", {
      pageTitle: "Chỉnh sửa thuộc tính sản phẩm",
      attributeDetail: attributeDetail
    });
  } catch (error) {
    console.log(error);
    res.redirect(`/${pathAdmin}/product/attribute`);
  }

}

export const editAttributePatch = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    req.body.options = JSON.parse(req.body.options);
    
    req.body.search = slugify(req.body.name, {
      replacement: ' ',
      lower: true, // Chữ thường
    })

    await AttributeProduct.updateOne({
      _id: id,
      deleted: false
    }, req.body);
    logAdminAction(req, `Đã sửa thuộc tính tên: ${req.body.name} (Id: ${id})`);
    res.json({
      code: "success",
      message: "Cập nhật thuộc tính thành công!"
    })
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ!"
    })
  }
}

export const deleteAttributePatch = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const record = await AttributeProduct.findOne({
      _id: id
    })
    logAdminAction(req, `Đã xóa mềm thuộc tính tên: ${record?.name} (Id: ${id})`);

    await AttributeProduct.updateOne({
      _id: id
    }, {
      deleted: true,
      deletedAt: Date.now(),
    });

    res.json({
      code: "success",
      message: "Xóa thuộc tính thành công!"
    })
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Id không hợp lệ!"
    })
  }
}

export const attributeTrashProduct = async (req: Request, res: Response) => {
  const find: {
      deleted: boolean,
      search?: RegExp
    } = {
      deleted: true
    };

  if(req.query.keyword) {
    const keyword = slugify(`${req.query.keyword}`, {
      replacement: ' ',
      lower: true, // Chữ thường
    })
    const keywordRegex = new RegExp(keyword, "i");
    find.search = keywordRegex;
  }

  // Phân trang
  const limitItems = 20;
  let page = 1;
  if(req.query.page) {
    const currentPage = parseInt(`${req.query.page}`);
    if(currentPage > 0) {
      page = currentPage;
    }
  }
  const totalRecord = await AttributeProduct.countDocuments(find);
  const totalPage = Math.ceil(totalRecord/limitItems);
  const skip = (page - 1) * limitItems;
  const pagination = {
    skip: skip,
    totalRecord: totalRecord,
    totalPage: totalPage
  };
  // Hết Phân trang

  const recordList: any = await AttributeProduct
    .find(find)
    .limit(limitItems)
    .skip(skip)
    .sort({
      createdAt: "desc"
    });

  res.render("admin/pages/product-attribute-trash", {
    pageTitle: "Thùng rác thuộc tính sản phẩm",
    listAttribute: recordList,
    pagination: pagination
  }); 
}
export const undoAttributePatch = async (req: Request, res: Response) => {
   try {
    const id = req.params.id;
    const articleDetail = await AttributeProduct.findOne({
      _id: id,
    })
    await AttributeProduct.updateOne({
      _id: id
    }, {
      deleted: false
    })
    logAdminAction(req, `Đã khôi phục thuộc tính: ${articleDetail?.name} (ID: ${id})`)
    res.json({
      code: "success",
      message: "Khôi phục thuộc tính thành công!"
    })
  } catch (error) {
    res.json({
      code: "error",
      message: "Id không hợp lệ!"
    })
  }
}
export const destroyAttribute = async (req: Request, res: Response) => {
   try {
    const id = req.params.id;
    const articleDetail = await AttributeProduct.findOne({
      _id: id,
    })
    logAdminAction(req, `Đã xóa vĩnh viễn thuộc tính: ${articleDetail?.name} (ID: ${id})`)
    await AttributeProduct.deleteOne({
      _id: id
    })
    res.json({
      code: "success",
      message: "Xóa vĩnh viễn thuộc tính thành công!"
    })
  } catch (error) {
    res.json({
      code: "error",
      message: "Id không hợp lệ!"
    })
  }
}
// Csv

export const exportCSV = async (req: Request, res: Response) => {
  const listProduct = await Product.find().lean();

  const parser = new Parser({
    delimiter: ";"
  });

  let csv = parser.parse(listProduct);
  csv = "\ufeff" + csv;

  res.attachment("product.csv");
  res.header("Content-Type", "text/csv; charset=utf-8");
  res.send(csv);
};
export const importCSVPost = async (req: Request, res: Response) => {
try {
    const result = Papa.parse(`${req.file?.buffer}`, {
      header: true,
      skipEmptyLines: true
    }
  );
  const items: any[] = result.data
  for(const item of items){
    item.position = item.position ? parseInt(item.position) : 0;
    item.category = item.category ? JSON.parse(item.category) : [];
    item.priceOld = item.priceOld ? parseInt(item.priceOld) : 0;
    item.priceNew = item.priceNew ? parseInt(item.priceNew) : 0;
    item.stock = item.stock ? parseInt(item.stock) : "";
    item.attributes = item.attributes ? JSON.parse(item.attributes) : [];
    item.variants = item.variants ? JSON.parse(item.variants) : [];
    item.images = item.images ? JSON.parse(item.images) : [];
    item.view = item.view ? parseInt(item.view) : 0;
    item.tags = item.tags ? JSON.parse(item.tags) : [];
    item.deleted = item.deleted == "true" ? true : false;
    item.deletedAt = item.deletedAt ? new Date(item.deletedAt) : undefined;
    item.createdAt = item.createdAt ? new Date(item.createdAt) : undefined;
    item.updatedAt = item.updatedAt ? new Date(item.updatedAt) : undefined;
    await Product.updateOne({
      _id: item._id
    }, 
      item)
  }
  res.json({
    code: "success",
    message: "Upload file thành công!"
  })
} catch (error) {
  console.log(error);
  res.json({
    code: "error",
    message: "Dữ liệu không hợp lệ!"
  })

}

}