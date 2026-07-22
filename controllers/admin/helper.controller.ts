import  { Request, Response } from "express"
import slugify from "slugify"
import CategoryBlog from "../../models/category-blog.model";
import { generateRandomString } from "../../helpers/generate.helper";
import mongoose from "mongoose";

export const generateSlug = async (req: Request, res: Response) => {
  try {
    const {string, model} = req.body;
    let slug = slugify(string, {
    lower: true,     
    strict: true,      
    })
    const Model = mongoose.model(model);
    const existSlug = await Model.findOne({
      slug: slug
    })
    if(existSlug){
      const stringRandom = generateRandomString(4)
      slug = `${slug}-${stringRandom}`
    }
    res.json({
      code: "success",
      message: "Tạo đường dẫn thành công!",
      slug: slug
    })
    
  } catch (error) {
    res.json({
      code: "error",
      message: "Model không hợp lệ!"
    })
  }

}