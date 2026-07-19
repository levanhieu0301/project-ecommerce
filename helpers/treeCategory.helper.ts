export const treeCategory = (listCategory :any, parentId: string = "") => {
  // Bước 1: Lọc ra các danh mục có parent khớp với parentId hiện tại
  const categoryParent = listCategory.filter((item:any) => item.parent == parentId)
  // Bước 2: Duyệt qua từng danh mục và đệ quy để tìm các danh mục con
  const tree = categoryParent.map((category: any)=> {
    const childCategory = treeCategory(listCategory,category.id )
    return ({
      id: category.id,
      name: category.name,
      children: childCategory
    })
  })
  return tree;

}