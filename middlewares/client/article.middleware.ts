import { NextFunction, Request, Response } from "express";
import Blog from "../../models/blog.model";
import moment from "moment";

export const getPopularBlog = async (req: Request, res: Response, next: NextFunction) => {
  const blogList: any = await Blog
    .find({
      deleted: false,
      status: "published"
    })
    .sort({
      view: "desc"
    })
    .limit(3);

  for (const item of blogList) {
    if(item.createdAt) {
      item.createdAtFormat = moment(item.createdAt).format("DD/MM/YYYY");
    }
  }

  res.locals.popularBlogList = blogList;

  next();
}
