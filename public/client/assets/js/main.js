
// Create an instance of Notyf
var notyf = new Notyf({
  duration: 3000,
  position: {
    x:'right',
    y:'top'
  },
  dismissible: true
});

const notifyData = sessionStorage.getItem("notify");
if(notifyData) {
  const { type, message } = JSON.parse(notifyData);
  if(type == "error") {
    notyf.error(message);
  } else if(type == "success") {
    notyf.success(message);
  }
  sessionStorage.removeItem("notify");
}

const drawNotify = (type, message) => {
  sessionStorage.setItem("notify", JSON.stringify({
    type: type,
    message: message
  }));
}



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

// Tìm kiếm ở trang chủ 
const formSearch = document.querySelector("[form-search]")
if(formSearch){
  const url = new URL(window.location.href)

  // Hiển thị giá trị mặc định
  const categoryCurrent = url.pathname.split("/").pop();
  const keywordCurrent = url.searchParams.get("keyword");
  
  if(categoryCurrent && categoryCurrent != "category") {
    formSearch.category.value = categoryCurrent;
  }

  if(keywordCurrent) {
    formSearch.keyword.value = keywordCurrent;
  }
  formSearch.addEventListener("submit", (event) => {
    event.preventDefault()
    const valueCategory = event.target.category.value
    const valueKeyword = event.target.keyword.value
    if(valueCategory){
      url.pathname = `/product/category/${valueCategory}`;
    }else {
      url.pathname = `/product/category`
    }
    if(valueKeyword){
      url.searchParams.set("keyword", valueKeyword)
    }else {
      url.searchParams.delete("keyword")
    }
    window.location.href =  url.href
  })
  // button-voice
  const buttonVoice = document.querySelector("[button-voice]");
  if(buttonVoice) {
    buttonVoice.addEventListener("click", () => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const voice = new SpeechRecognition();
      voice.lang = "vi-VN";
      voice.start();
      voice.onresult = (event) => {
        const value = event.results[0][0].transcript;
        if(value) {
          formSearch.keyword.value = value;
          
          formSearch.submit();
        }
      };
    })
  }
  // End button-voice

  // suggest
  const suggestInput = formSearch.querySelector(`input[name="keyword"]`)
  const boxSuggest = formSearch.querySelector(".inner-suggest")
  const boxSuggestList = formSearch.querySelector(".inner-list")
  let timeout
  suggestInput.addEventListener("input", () => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      const value = suggestInput.value
      if (value) {
        fetch(`/product/suggest?keyword=${value}`)
          .then(res => res.json())
          .then(data => {
            if (data.code == "success"){
              const Arrayhtml = data.list.map(item => {
                return  `
                      <a class="inner-item" href="/product/detail/${item.slug}">
                        <img class="inner-image" src="${domainCDN}${item.images[0]}">
                        <div class="inner-info">
                          <div class="inner-name">${item.name}</div>
                          <div class="inner-prices">
                            <div class="inner-price-new"> ${item.priceNew.toLocaleString("vi-VN")}đ</div>
                            <div class="inner-price-old">${item.priceOld.toLocaleString("vi-VN")}đ</div>
                          </div>
                        </div>
                      </a>
                      `
              })
                boxSuggestList.innerHTML = Arrayhtml.join("")
              if(data.list.length > 0) {
                boxSuggest.style.display = "block";
              } else {
                boxSuggest.style.display = "none";
              }

            }
          })
        }else {
           boxSuggest.style.display = "none";
        }
      }
    ,500)
  })
  // End suggest

}
// End Tìm kiếm ở trang chủ 

// Tạo biến cart khi vào trang
const existCart  = localStorage.getItem("cart")
if(!existCart ){
  localStorage.setItem("cart", JSON.stringify([]))
}
// End Tạo biến cart khi vào trang

const drawCart = () => {
  const cart = JSON.parse(localStorage.getItem("cart"))
  if (cart.length > 0){
    fetch(`/cart/list`, {
      method: "POST",
      headers:{
        "Content-Type": "application/json"
      },
      body: JSON.stringify(cart)
    })
    .then(res => res.json())
    .then(data => {
      if (data.code == "error"){
        localStorage.setItem("cart", JSON.stringify([]));
      }
      if (data.code == "success"){
        localStorage.setItem("cart", JSON.stringify(data.cart));
          let subTotal = 0;
          const arrayHtml = data.cart.map(item => {
          const {detail}  = item
          let priceNew = 0
          let priceOld = 0
          let htmlVariant = "";
          if (item.attributeValue){
              // Tìm đúng biến thể khớp trong danh sách
            const variantMatched = detail.variants.find(variantItem => {
              return (
                variantItem.attributeValue.every(attr => {
                  const selected = item.attributeValue.find(v => v.attriId === attr.attriId);
                  return selected && selected.value === attr.value;
                })
              );
            });
            priceOld = variantMatched.priceOld;
            priceNew = variantMatched.priceNew;
              detail.attributeList.forEach(attr => {
              const variant = item.attributeValue.find(v => v.attriId === attr._id);
              htmlVariant += `
                <span>
                  <b>${attr.name}:</b> ${variant.label}
                </span>
              `;
            })
          }else{
            priceNew = detail.priceNew
            priceOld = detail.priceOld
          }
          subTotal += priceNew * item.quantity;

          return `
          <li>
            <a class="cart_img" href="/product/detail/${detail.slug}">
              <img class="img-fluid w-100" alt="${detail.name}" src="${domainCDN}${detail.images[0]}">
            </a>
            <div class="cart_text">
              <a class="cart_title" href="/product/detail/${detail.slug}">${detail.name}</a>
              <p>
                ${priceNew.toLocaleString("vi-VN")}đ
                <del>${priceOld.toLocaleString("vi-VN")}đ</del>
              </p>
              <span>
                <b>Số lượng:</b> ${item.quantity}
              </span>
              ${htmlVariant}
            </div>
            <a class="del_icon" href="#">
              <i class="fal fa-times" aria-hidden="true"></i>
            </a>
          </li>
          `
          })
        const ulMiniCart = miniCart.querySelector(".offcanvas-body ul");
        ulMiniCart.innerHTML = arrayHtml.join("");

        const elementSubTotal = miniCart.querySelector("[sub-total]");
        elementSubTotal.innerHTML = subTotal.toLocaleString("vi-VN");

      }
    })
  }
}

// Số lượng giỏ hàng
const miniCartQuantity = () => {
  const cart = JSON.parse(localStorage.getItem("cart"));
  const elementMiniCartQuantity = document.querySelectorAll("[mini-cart-quantity]");
  elementMiniCartQuantity.forEach(item => {
    item.innerHTML = cart.length;
  })

}
miniCartQuantity()
// End Số lượng giỏ hàng


// Chọn biến thể thay đổi giá trị tương ứng
const changeAttribute = document.querySelector(".shop_details_text")
if(changeAttribute){
  const priceNew = changeAttribute.querySelector(".price-new")
  const priceOld = changeAttribute.querySelector(".price-old")
  const stock = changeAttribute.querySelector(".stock")
  const inputQuantity = changeAttribute.querySelector(".input-quantity");
  const buttonPlus = changeAttribute.querySelector(".plus");
  const buttonMinus = changeAttribute.querySelector(".minus");
  const buttonAddCart = changeAttribute.querySelector("[button-add-cart]")
  let variantCart = null;
  // const dataFinal = {
  //   6a7ae45f1569c8b55b734ddb: s,
  //   6a7ae692cdecee1d6772c810: red
  // }
  
// Chọn biến thể thay đổi giá trị tương ứng
  const select  = {}
  // console.log(productVariant)
  const listElementLi = changeAttribute.querySelectorAll(".details_single_variant li")
  listElementLi.forEach(item => {
    item.addEventListener("click", (event) => {
      const attributeId = item.getAttribute("attribute-id") 
      const attributeValue = item.getAttribute("value") 
      // Thêm active cho mục đã chọn
      item.closest("ul").querySelectorAll("li").forEach(element => element.classList.remove("active"))
      item.classList.add("active")
      // select[4646436464] = l 
      select[attributeId] = attributeValue
      const variantFinal = productVariant.find((object) => {
        return object.attributeValue.every(attribute => select[attribute.attriId] == attribute.value)
      } )
  
      // cập nhật lại giá trị
      const selectedValues = Object.values(select);
      if(selectedValues.length > 0) {
        if (variantFinal){
          priceNew.innerHTML = variantFinal.priceNew.toLocaleString("vi-VN")
          priceOld.innerHTML = variantFinal.priceOld.toLocaleString("vi-VN")
          if(variantFinal.stock > 0){
            stock.innerHTML = `Còn hàng (${variantFinal.stock})`;
            stock.classList.remove("out_stock");
            inputQuantity.value = 1;
            variantCart = variantFinal
          }else {
            stock.innerHTML = `Hết hàng`;
            stock.classList.add("out_stock");
            inputQuantity.value = 0;
            variantCart = null
          }
           // Gán lại số lượng tối đa được phép đặt
          inputQuantity.max = variantFinal.stock;

        }
      }
    })
  })

  // Tăng số lượng
  buttonPlus.addEventListener("click", (event) => {
    const valueCurrent = parseInt(inputQuantity.value)
    const max = parseInt(inputQuantity.max)
    if (valueCurrent < max){
      inputQuantity.value = valueCurrent + 1
    }
  })
   // Giảm số lượng
  buttonMinus.addEventListener("click", () => {
    const quantity = parseInt(inputQuantity.value);
    const min = parseInt(inputQuantity.min);
    if(quantity > min) {
      inputQuantity.value = quantity - 1;
    }
  })
  // Thêm vào giỏ hàng
  buttonAddCart.addEventListener("click", () => {
    const productId = buttonAddCart.getAttribute("product-id")
    const quantity = parseInt(inputQuantity.value)
    if (productId && quantity > 0){
      const dataCart = {
        productId: productId,
        // attributeValue: variantCart.attributeValue,
        quantity: quantity
      }
      const cart = JSON.parse(localStorage.getItem("cart"))
      if (variantCart && productVariant && productVariant.length > 0){
        dataCart.attributeValue = variantCart.attributeValue
        // Check sản phẩm trùng
        const existProduct = cart.find(item => {
          if(item.productId != dataCart.productId){
            return false
          }
          // Kiểm tra thuộc tính
          const oldAttri = item.attributeValue
          const newAttri = dataCart.attributeValue
          if(oldAttri.length !== newAttri.length){
            return false
          }
          return oldAttri.every(attri => {
            const match =  newAttri.find(a => a.attriId == attri.attriId && a.value == attri.value)
            return match ? true : false;
          })

        })
        if(existProduct){
          existProduct.quantity = dataCart.quantity
          notyf.success("Đã cập nhật lại số lượng!");
        }else {
          cart.unshift(dataCart)
          notyf.success("Đã thêm vào giỏ hàng!");
        }
      }else {
        // Tìm xem có sản phẩm trùng productId hay không
        const existItem = cart.find(item => item.productId === dataCart.productId);

        if(existItem) {
          existItem.quantity = dataCart.quantity;
          notyf.success("Đã cập nhật số lượng trong giỏ hàng!");
        } else {
          cart.unshift(dataCart);
          notyf.success("Đã thêm vào giỏ hàng!");
        }
      }
      localStorage.setItem("cart", JSON.stringify(cart))
      miniCartQuantity()
      drawCart()

    }

  })

}
// End Chọn biến thể thay đổi giá trị tương ứng

// mini cart
const miniCart = document.querySelector("[mini-cart]")
if(miniCart){
  drawCart()
}
// End mini cart