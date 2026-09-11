
import CategoryProduct from "../models/category-product.model";
import Product from "../models/product.model"
import moment from "moment";
import AccountAdmin from "../models/account-admin.model";
import Blog from "../models/blog.model";
import CategoryBlog from "../models/category-blog.model";


export const getProductByCategory = async (getByCategory: any) => {
  let productList: any[] = [];

  // Tạo đối tượng tìm kiếm
  const find: any = {
    deleted: false,
    status: "active"
  };

  // Lấy mảng id các danh mục
  if(getByCategory.category && getByCategory.category.length) {
    const categoryList = await CategoryProduct.find({
      slug: { $in: getByCategory.category },
      deleted: false,
      status: "active"
    });
    const categoryIds = categoryList.map((category: any) => category.id);
    find.category = { $in: categoryIds };
  }

  // Lấy giới hạn sản phẩm
  let limit = 10;
  if(getByCategory.limit) {
    limit = getByCategory.limit;
  }

  // Sắp xếp
  const sort: any = {};
  if(getByCategory.sort && getByCategory.sort.by && getByCategory.sort.type) {
    sort[getByCategory.sort.by] = getByCategory.sort.type;
  }

  // Lấy ra sản phẩm
  productList = await Product
    .find(find)
    .sort(sort)
    .limit(limit);
  
  for(const item of productList){
    item.discount = Math.floor(((item.priceOld - item.priceNew) / item.priceOld) * 100)
    // màu sắc
    // chỉ lọc ra bản ghi nào status : true
    const setColor = new Set();
    item.variants.filter( (variant : any) => variant.status).forEach((variant : any) => {
      variant.attributeValue.forEach((attri: any) => {
          if(attri.attriType =="color"){
            setColor.add(attri.value)
          }
      } )
    })
    item.listColor = [...setColor]
  }

  return productList;
}
export const getBlogByCategory = async (getByCategory: any) => {
  let blogList: any[] = [];

  // Tạo đối tượng tìm kiếm
  const find: any = {
    deleted: false,
    status: "published"
  };

  // Lấy mảng id các danh mục
  if(getByCategory.category && getByCategory.category.length) {
    const categoryList = await CategoryBlog.find({
      slug: { $in: getByCategory.category },
      deleted: false,
      status: "active"
    });
    const categoryIds = categoryList.map((category: any) => category.id);
    find.category = { $in: categoryIds };
  }

  // Lấy giới hạn bài viết
  let limit = 10;
  if(getByCategory.limit) {
    limit = getByCategory.limit;
  }

  // Sắp xếp
  const sort: any = {};
  if(getByCategory.sort && getByCategory.sort.by && getByCategory.sort.type) {
    sort[getByCategory.sort.by] = getByCategory.sort.type;
  }

  // Lấy ra sản phẩm
  blogList = await Blog
    .find(find)
    .sort(sort)
    .limit(limit);
  
  for(const item of blogList) {
    if(item.updatedBy) {
      const accountInfo = await AccountAdmin.findOne({
        _id: item.updatedBy
      })
      if(accountInfo) {
        item.authorName = accountInfo.fullName;
        item.date = moment(item.updatedAt).format("DD/MM/YYYY");
      }
    } else {
      const accountInfo = await AccountAdmin.findOne({
        _id: item.createdBy
      })
      if(accountInfo) {
        item.authorName = accountInfo.fullName;
        item.date = moment(item.createdAt).format("DD/MM/YYYY");
      }
    }
  }

  return blogList;
}
