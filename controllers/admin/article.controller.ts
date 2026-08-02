import  { Request, Response } from "express"
import CategoryBlog from "../../models/category-blog.model"
import { treeCategory } from "../../helpers/treeCategory.helper"
import slugify from "slugify"
import { pathAdmin } from "../../configs/variable.config"
import Blog from "../../models/blog.model"

export const category = async (req: Request, res: Response) => {
  const find : {
    deleted: boolean,
    search?: RegExp
  } = {
    deleted: false,
  }
   // Phân trang
  const limitItems = 5;
  let page = 1;
  if(req.query.page && parseInt(`${req.query.page}`) > 0) {
    page = parseInt(`${req.query.page}`);
  }
  const totalRecord = await CategoryBlog.countDocuments(find);
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
  const recordList: any = await CategoryBlog
    .find(find)
    .sort({
      createdAt: "desc"
    })
    .limit(limitItems)
    .skip(skip)
  for(const item of recordList){
    if(item.parent){
      const parent = await CategoryBlog.findOne({
        _id: item.parent
      })
      item["parentName"] = parent?.name
    }
  }

  res.render("admin/pages/article-category", {
    pageTitle: "Danh mục bài viết",
    recordList: recordList,
    pagination: pagination
  })
}
export const categoryCreate = async  (req: Request, res: Response) => {
    const categoryList = await CategoryBlog.find({});
    const categoryTree: any = treeCategory(categoryList)

  res.render("admin/pages/article-create-category", {
    pageTitle: "Tạo danh mục bài viết",
    categoryList: categoryTree
  })
}

export const categoryCreatePost = async (req: Request, res: Response) => {
  try {
    const existSlug = await CategoryBlog.findOne({
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

    const newRecord = new CategoryBlog(req.body);
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

export const categoryEdit = async  (req: Request, res: Response) => {
  try {
    const categoryList = await CategoryBlog.find({});
    const categoryTree: any = treeCategory(categoryList)

    const id = req.params.id;

    const categoryDetail = await CategoryBlog.findOne({
      _id: id,
      deleted: false
    })

    if(!categoryDetail) {
      res.redirect(`/${pathAdmin}/article/category`);
      return;
    }

    res.render("admin/pages/article-edit-category", {
      pageTitle: "Chỉnh sửa danh mục bài viết",
      categoryList: categoryTree,
      categoryDetail:categoryDetail
    })
  } catch (error) {
    res.redirect(`/${pathAdmin}/article/category`);
  }
}

export const categoryEditPatch = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const existCategory = await CategoryBlog.findOne({
      _id: {$ne: id},// Loại trừ bản ghi có _id trùng với id truyền vào
      slug: req.body.slug
    })
    if(existCategory) {
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


    await CategoryBlog.updateOne({
      _id: id,
      deleted: false
    }, req.body)

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

export const categoryDeleted = async  (req: Request, res: Response) => {
   try {
    const id = req.params.id;

    await CategoryBlog.updateOne({
      _id: id
    }, {
      deleted: true,
      deletedAt: Date.now()
    })

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

export const trashCategory = async (req: Request, res: Response) => {
  const recordList: any = await CategoryBlog.find({
    deleted: true
  })

  for (const item of recordList) {
    if(item.parent) {
      const parent = await CategoryBlog.findOne({
        _id: item.parent
      })

      item["parentName"] = parent?.name;
    }
  }

  res.render("admin/pages/article-trash-category", {
    pageTitle: "Thùng rác danh mục bài viết",
    recordList: recordList
  });
}
export const undoCategoryPatch = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    await CategoryBlog.updateOne({
      _id: id
    }, {
      deleted: false
    })

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

export const destroyCategoryDelete = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    await CategoryBlog.deleteOne({
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

// Bài viết
export const articleList = async (req: Request, res: Response) => {
  const find: {
    deleted: boolean,
    search?: RegExp
  } = {
    deleted: false
  };

  if(req.query.keyword) {
    const keyword = slugify(`${req.query.keyword}`, {
      replacement: " ",
      lower: true
    });
    const keywordRegex = new RegExp(keyword, "i");
    find.search = keywordRegex;
  }

  // Phân trang
  const limitItems = 20;
  let page = 1;
  if(req.query.page && parseInt(`${req.query.page}`) > 0) {
    page = parseInt(`${req.query.page}`);
  }
  const totalRecord = await Blog.countDocuments(find);
  const totalPage = Math.ceil(totalRecord/limitItems);
  const skip = (page - 1) * limitItems;
  const pagination = {
    totalRecord: totalRecord,
    totalPage: totalPage,
    skip: skip
  };
  // Hết Phân trang

  const recordList: any = await Blog
    .find(find)
    .sort({
      createdAt: "desc"
    })
    .limit(limitItems)
    .skip(skip)

  res.render("admin/pages/article-list", {
    pageTitle: "Danh sách bài viết",
    recordList: recordList,
    pagination: pagination
  });
}
export const articleCreate = async (req: Request, res: Response) => {
    const categoryList = await CategoryBlog.find({});
    const categoryTree: any = treeCategory(categoryList)

  res.render("admin/pages/article-create", {
    pageTitle: "Tạo bài viết",
    categoryList: categoryTree
  })
}
export const articleCreatePost = async (req: Request, res: Response) => {
  try {
    const existSlug = await Blog.findOne({
      slug: req.body.slug
    })

    if(existSlug) {
      res.json({
        code: "error",
        message: "Đường dẫn đã tồn tại!"
      })
      return;
    }

    req.body.category = JSON.parse(req.body.category);

    req.body.search = slugify(`${req.body.name}`, {
      replacement: " ",
      lower: true
    });

    if(req.body.status == "published") {
      req.body.publishAt = new Date();
    }

    const newRecord = new Blog(req.body);
    await newRecord.save();

    res.json({
      code: "success",
      message: "Tạo bài viết thành công!"
    })
  } catch (error) {
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ!"
    })
  }
}
