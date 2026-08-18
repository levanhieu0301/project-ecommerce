import  { Request, Response } from "express"
import Product from "../../models/product.model"
import CategoryProduct from "../../models/category-product.model"
import { listProduct } from "../admin/product.controller"
import slugify from "slugify"
import AttributeProduct from "../../models/attribute-product.model"

export const category =async (req: Request, res: Response) => {
  const slug = req.params.slug
  let categoryDetail : any = null;
  if(slug){
    categoryDetail = await CategoryProduct.findOne({
      slug: slug,
      deleted: false,
      status: "active"
    })
  }else {
    categoryDetail = {
      id: "",
      name : "Tất cả sản phẩm",
      slug: ""
    }
  }

  if(!categoryDetail){
    res.redirect("/")
  }
  // {
    // category: any
    // status: boolean,
    // deleted: boolean,
    // $or: any // những trường khác, tiêu chí khác
  // }
  const find: any = {
    // category: categoryDetail.id,
    status: "active",
    deleted: false, 
    // $or: [
    //   {
    //     variants: { // tìm vào trường variants
    //       $elemMatch: { // Lấy ra nhưng phần tử khớp với
    //         status: true,
    //         attributeValue: {
    //           $elemMatch: {
    //             attrId: "6a7ae45f1569c8b55b734ddb",
    //             value: { $in: ["s", "l"] }
    //           }
    //         }
    //       }
    //     }
    //   }
    // ]
  }
  // Danh mục 
  if (categoryDetail.id){
    find.category = categoryDetail.id
  }
  // Danh mục 
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
      currentPage: page,
      totalRecord: totalRecord,
      skip: skip
  };

    // Hết Phân trang
  let sort: any ={}
  if(req.query.sort){
     const [key, value] = `${req.query.sort}`.split("-")
    switch (key) {
      case "position":
        sort.position = value
        break;
      case "price":
        sort.priceNew = value
        sort.position = value // thêm nếu cùng giá
        break;
      case "createdAt":
        sort.createdAt = value
        break;
      case "discount":
        sort.discount = value
        break;
      default:
        sort.position = "desc";
        break;
    }
  }else {
    sort.position = "desc"
  }
  if (req.query.price){
    const [minPrice, maxPrice] = `${req.query.price}`.split("-").map(item => parseInt(item))
    find.priceNew = {
      $gte: minPrice,
      $lte: maxPrice
    }
  }
   // Đang giảm giá
  if(req.query.discount && req.query.discount == "true") {
    find.discount = {
      $gt: 0
    }
  }
  // Hết Đang giảm giá

  // Còn hàng
  if(req.query.stock && req.query.stock == "true") {
    find.stock = {
      $gt: 0
    }
  }
  // Hết Còn hàng
  // Thuộc tính
  const filterAttribute: any[] = []
  // console.log(Object.keys(req.query)) // chuyển đối tượng thành mảng: (req.query->đối tượng)
  Object.keys(req.query).forEach(key => {
    if(key.startsWith("attribute_")){
      const id = key.replace("attribute_", "")
      // const value= req.query.attribute_6a7ae45f1569c8b55b734ddb
      //  const vale = req.query[`attribute_6a7ae45f1569c8b55b734ddb`]
      const value = `${req.query[key]}`.split(",");
      filterAttribute.push({
        variants: { // tìm vào trường variants
          $elemMatch: { // Lấy ra nhưng phần tử khớp với
            status: true,
            attributeValue: {
              $elemMatch: {
                attriId: id,
                value: { $in: value }
              }
            }
          }
        }
      })
    if(filterAttribute.length > 0) {
        find.$or = filterAttribute;
    }

    }
  })
  // Hết thuộc tính
  // keyword
  if (req.query.keyword){
    const keywordFormat = slugify(`${req.query.keyword}`, {
      replacement: " ",
      lower: true
    });
    const keywordRegex = new RegExp(keywordFormat, "i")
    find.search = keywordRegex
  }
  // End keyword

  const listProductByCategory: any = await Product
    .find(find)
    .limit(limitItems)
    .skip(skip)
    .sort(sort)
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
export const suggest = async (req: Request, res: Response) => {
  const find: any = {
    deleted: false,
    status: "active",
    priceNew: {
      $gt: 0
    },
    stock: {
      $gt: 0
    }
  }
  if (req.query.keyword){
    const keywordFormat = slugify(`${req.query.keyword}`, {
      replacement: " ",
      lower: true
    });
    const keywordRegex = new RegExp(keywordFormat, "i")
    find.search = keywordRegex
  }
  // End keyword
  const listProductSuggest = await Product
    .find(find)
    .limit(5)
    .sort({
      position: "desc"
    })
    .select("slug name priceNew priceOld images")
    .lean()

  res.json({
    code: "success",
    list: listProductSuggest
  })
}
export const detail = async (req: Request, res: Response) => {
  const productDetail:any = await Product.findOne({
    slug: req.params.slug,
    deleted: false,
    status: "active"
  })

  if(!productDetail) {
    res.redirect("/");
    return;
  }
  // Để lấy tên hiển thị : Màu sắc: 
  //                      Kích cỡ: 
  const listAttribute:any = await AttributeProduct.find({
    _id: {$in : productDetail.attributes}
  }) 
  //  Hết Để lấy tên hiển thị : Màu sắc: 
  //                            Kích cỡ: 
  // Lấy thuộc tính sản phẩm 
  for (const attribute of listAttribute){
    const attributeSet = new Set()
    const attributeSetLabel = new Set()
    productDetail.variants.filter((object: any) => object.status).forEach((object:any) => {
      object.attributeValue.forEach((option:any) => {
        if(option.attriId == attribute._id){
          attributeSet.add(option.value)
          attributeSetLabel.add(option.label)
        }
      })
    })
    attribute.setAttribute = [...attributeSet]
    attribute.attributeSetLabel = [...attributeSetLabel]
  }
  // Lấy thuộc tính sản phẩm

  // Danh sách danh mục
  const categoryList= await CategoryProduct
    .find({
      _id: { $in: productDetail.category },
      deleted: false,
      status: "active"
    })
    .select("name slug");
  productDetail.categoryList = categoryList;
  // Hết Danh sách danh mục


  res.render("client/pages/product-detail", {
    pageTitle: productDetail.name,
    productDetail: productDetail,
    listAttribute: listAttribute
  });

}