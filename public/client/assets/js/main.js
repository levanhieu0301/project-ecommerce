// pagination
const listButton = document.querySelectorAll(".pagination .page-item a[page]")
if(listButton){
  const url = new URL(window.location.href)
  listButton.forEach(item => {
    item.addEventListener("click", (event) => {
      const value = item.getAttribute("page")
      if(value){
        url.searchParams.set("page", value)
      }else {
        url.searchParams.delete()
      }
      window.location.href = url.href;
    })
  })
}
// End pagination

// chia sẻ
const share = document.querySelectorAll("[button-share]")
if(share){
  share.forEach(item => {
    item.href = item.href + window.location.href
    // item.href = item.href + "https://28tech.com.vn/lap-trinh-backend-nodejs-middle";
    // lấy đường link người ta cấp + link website : `https://www.facebook.com/sharer/sharer.php?u=linkWebsite`
  })
}
// chia sẻ

// Bộ lọc theo trạng thái sản phẩm
const btnStatusProduct = document.querySelectorAll("[button-status]")
if(btnStatusProduct.length > 0){
  const url = new URL(window.location.href)
  btnStatusProduct.forEach(btn => {
    const name = btn.value
    btn.addEventListener("change", (event) => {
      const value = btn.checked; 
      if (value){
        url.searchParams.set(name, value)
      }else {
        url.searchParams.delete(name)
      }
      window.location.href = url.href
    })
    const valueCurrent = url.searchParams.get(name)
    if(valueCurrent){
      btn.checked = valueCurrent
    }
  })
}
// End Bộ lọc theo trạng thái sản phẩm

// Lọc theo danh mục 
const filterCategory = document.querySelectorAll("[btn-slug]")
if (filterCategory.length > 0){
  const url = new URL(window.location.href)
  filterCategory.forEach(item => {
    item.addEventListener("click", (event) => {
      const attribute = item.getAttribute("btn-slug")
      url.pathname =  `/product/category/${attribute}`;
      window.location.href = url.href

    })
  })
}
// End Lọc theo danh mục 


// Lọc theo thuộc tính
const filterAttribute = document.querySelectorAll("[filter-attribute]")
if (filterAttribute.length > 0){
   const url = new URL(window.location.href)
  filterAttribute.forEach(item => {
    const id = item.getAttribute("filter-attribute")
    const listInput = item.querySelectorAll(`input[type="checkbox"]`)
    listInput.forEach(input => {
      input.addEventListener("change",(event) => {
        // Lấy lại tất cả khi ng ta thay đổi change
        const listInputChecked = item.querySelectorAll(`input[type="checkbox"]:checked`)
         const listCheckedFinal = []
        listInputChecked.forEach(inputChecked => listCheckedFinal.push(inputChecked.value))
       
       if(listCheckedFinal.length > 0){
          url.searchParams.set(`attribute_${id}`, listCheckedFinal.join(","))
       }else {
        url.searchParams.delete(`attribute_${id}`)
       }
       window.location.href = url.href
    } )
    })
    // Hiển thị giá trị mặc định
    const listValueCurrent = url.searchParams.get(`attribute_${id}`);
    if(listValueCurrent) {
      const listValue = listValueCurrent.split(",");
      listInput.forEach(input => {
        if(listValue.includes(input.value)) {
          input.checked = true;
        }
      })
    }

  })
}
// End Lọc theo thuộc tính