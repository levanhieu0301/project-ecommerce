import { Request, Response } from 'express';
import Product from '../../models/product.model';
import AttributeProduct from '../../models/attribute-product.model';

export const list = async (req: Request, res: Response) => {
  try {
    const compare = req.body

    const compareDetail = []
    for(const item of compare){
      const productDetail = await Product.findOne({
        _id: item.productId,
        deleted: false,
        status: "active"
      })
      if(productDetail){
        const attributeList = await AttributeProduct.find({
          _id: {$in: productDetail.attributes}
        })
        .select("id name")
        .lean();

        const itemDetail = {
          ...item,
          detail : {
            images: productDetail.images,
            slug: productDetail.slug,
            name: productDetail.name,
            priceNew: productDetail.priceNew,
            priceOld: productDetail.priceOld,
            description: productDetail.description,
            stock: productDetail.stock,
            attributeList: attributeList,
            variants: productDetail.variants
          }
        }
        compareDetail.push(itemDetail)
      }
    }

    res.json({
      code: "success",
      message: "Thành công!",
      compare: compareDetail
    })
  } catch (error) {
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ!"
    })
  }
}

export const compare = async (req: Request, res: Response) => {

  res.render("client/pages/compare", {
    pageTitle: "So sánh"
  });
}