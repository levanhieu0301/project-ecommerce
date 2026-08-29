
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
// Tạo localstorage compare
const compare = localStorage.getItem("compare")
if(!compare){
  localStorage.setItem("compare", JSON.stringify([]))
}
// End Tạo localstorage compare

// Tạo localstorage wishlist
const wishlist = localStorage.getItem("wishlist")
if(!wishlist){
  localStorage.setItem("wishlist", JSON.stringify([]))
}
// End Tạo localstorage wishlist



// Xóa item trong giỏ hàng
const removeItemCart = () =>{
  const listButtonRemove = document.querySelectorAll("[button-remove-item]")
  listButtonRemove.forEach(button => {
    button.addEventListener("click", () => {
      const elementParent = button.closest("[cart-item]")
      const productId = elementParent.getAttribute("product-id")
      let attributeValue = elementParent.getAttribute("attributeValue")
      if(attributeValue){
        attributeValue = JSON.parse(decodeURIComponent(attributeValue))
      }
      let cart = JSON.parse(localStorage.getItem("cart"));
      cart = cart.filter(cartItem => {
        // check productId
        const sameProductId = cartItem.productId === productId

        // check biến thể
        const attributeValueInCart = cartItem.attributeValue ? JSON.stringify(cartItem.attributeValue) : "[]"
        const attributeValueInButton = attributeValue ?  JSON.stringify(attributeValue) : "[]"
        const sameVariant = attributeValueInCart == attributeValueInButton;

        return !(sameProductId && sameVariant)
      })
      localStorage.setItem("cart", JSON.stringify(cart));
      drawCart();
      miniCartQuantity();


    })
  })

}
// End Xóa item trong giỏ hàng

// Cập nhật số lượng trong giỏ hàng
const updateQuantityCart = () => {
  const listBoxQuantity = document.querySelectorAll("[cart-table] .cart_page_quantity");
  listBoxQuantity.forEach(box => {
    const inputQuantity = box.querySelector("input");
    const buttonPlus = box.querySelector(".plus");
    const buttonMinus = box.querySelector(".minus");
    const item = box.closest("[cart-item]");
    const productId = item.getAttribute("product-id");
    let attributeValue = item.getAttribute("attributeValue");
    if(attributeValue) {
      attributeValue = JSON.parse(decodeURIComponent(attributeValue));
    }
    
    const cart = JSON.parse(localStorage.getItem("cart"));
    const itemUpdate = cart.find(cartItem => {
      // So sánh giống productId
      const sameProduct = cartItem.productId == productId;

      // So sánh giống variant
      const variantItemInCart = cartItem.attributeValue ? JSON.stringify(cartItem.attributeValue) : "[]";
      const variantItemRemove = attributeValue ? JSON.stringify(attributeValue) : "[]";
      const sameVariant = variantItemInCart == variantItemRemove;

      return (sameProduct && sameVariant);
    })
    if(itemUpdate) {
      // Nếu số lượng không đủ in ra thông báo
      const quantity = parseInt(inputQuantity.value);
      const max = parseInt(inputQuantity.max);
      if(quantity > max) {
        const itemAlert = document.createElement("div");
        itemAlert.style.color = "red";
        itemAlert.style.fontSize = "12px";
        itemAlert.innerHTML = `Chỉ còn ${max} sản phẩm!`;
        box.appendChild(itemAlert);
      }
      
      // Tăng số lượng
      buttonPlus.addEventListener("click", () => {
        const quantity = parseInt(inputQuantity.value);
        const max = parseInt(inputQuantity.max);
        if(quantity < max) {
          itemUpdate.quantity = quantity + 1;
          localStorage.setItem("cart", JSON.stringify(cart));
          drawCart();
        }
      })
       // Giảm số lượng
      buttonMinus.addEventListener("click", () => {
        const quantity = parseInt(inputQuantity.value);
        const min = parseInt(inputQuantity.min);
        if(quantity > min) {
          itemUpdate.quantity = quantity - 1;
          localStorage.setItem("cart", JSON.stringify(cart));
          drawCart();
        }
      })
    }
  })

  }
// End Cập nhật số lượng trong giỏ hàng

// Tính tiền những ô chỉ checked
const updateChangeBox = () => {
  const listInput = document.querySelectorAll("[cart-table] .cart_page_checkbox input")
  listInput.forEach(input => {
    input.addEventListener("change", () => {
      const checked = input.checked
      const itemParent = input.closest("[cart-item]")
      const productId = itemParent.getAttribute("product-id")
      let attributeValue = itemParent.getAttribute("attributeValue")
      if(attributeValue){
        attributeValue = JSON.parse(decodeURIComponent(attributeValue))
      }
      const  cart = JSON.parse(localStorage.getItem("cart"))
      let itemUpdate = cart.find(item => {
        // So sánh productId
        const sameProductId = item.productId == productId

        // So sánh thuộc tính
        const attributeValueUpdate = attributeValue ? JSON.stringify(attributeValue): "[]";
        const attributeValueCart = item.attributeValue ? JSON.stringify(item.attributeValue): "[]";
        const sameAttributeValue =attributeValueUpdate == attributeValueCart
         
        return (sameProductId && sameAttributeValue)
      })
      itemUpdate.checked = checked;
      localStorage.setItem("cart", JSON.stringify(cart));
      drawCart();

    })
  })

}
// End Tính tiền những ô chỉ checked

// CheckALL giỏ hàng
const inputCheckAll = document.querySelector("[input-cart-check-all]")
if(inputCheckAll){
  inputCheckAll.addEventListener("change", () => {
    const checked = inputCheckAll.checked
    const cart = JSON.parse(localStorage.getItem("cart"))
    cart.forEach(item => item.checked = checked)
    localStorage.setItem("cart", JSON.stringify(cart));
    drawCart();

  })
}
// End CheckALL giỏ hàng

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
          let htmlMiniCart = "";
          let htmlCartTable = "";
          let htmlSummary = "";
          data.cart.forEach(item => {
          const {detail}  = item
          let priceNew = 0
          let stock = 0
          let priceOld = 0
          let htmlVariant = "";
          let htmlVariantSummary = ""
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
            stock = variantMatched.stock
              detail.attributeList.forEach(attr => {
              const variant = item.attributeValue.find(v => v.attriId === attr._id);
              htmlVariant += `
                <span>
                  <b>${attr.name}:</b> ${variant.label}
                </span>
              `;
              htmlVariantSummary += `
                  <p>${attr.name}: ${variant.label}</p>
                `;

            })
          }else{
            priceNew = detail.priceNew
            priceOld = detail.priceOld
            stock = detail.stock;
          }
          if (item.checked){
            subTotal += priceNew * item.quantity;
          }

          htmlMiniCart += `
          <li 
            cart-item
            product-id=${item.productId}
            ${item.attributeValue ? `attributeValue=${encodeURIComponent(JSON.stringify(item.attributeValue))}` : ""}
          >
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
            <a class="del_icon" href="javascript:;" button-remove-item>
              <i class="fal fa-times" aria-hidden="true"></i>
            </a>
          </li>
          `
          htmlCartTable += `
          <tr
            cart-item
            product-id=${item.productId}
            ${item.attributeValue ? `attributeValue="${encodeURIComponent(JSON.stringify(item.attributeValue))}"` : ''}
          >
            <td class="cart_page_checkbox">
              <div class="form-check">
                <input class="form-check-input" value="" type="checkbox" ${item.checked == true ? "checked" : ""} />
              </div>
            </td>
            <td class="cart_page_img">
              <div class="img">
                <img class="img-fluid w-100" alt="${detail.name}" src="${domainCDN}${detail.images[0]}" />
              </div>
            </td>
            <td class="cart_page_details">
              <a class="title" href="/product/detail/${detail.slug}">${detail.name}</a>
              <p>
                ${priceNew.toLocaleString("vi-VN")}đ
                <del>${priceOld.toLocaleString("vi-VN")}đ</del>
              </p>
              ${htmlVariant}
            </td>
            <td class="cart_page_price">
              <h3>${priceNew.toLocaleString("vi-VN")}đ</h3>
            </td>
            <td class="cart_page_quantity">
              <div class="details_qty_input">
                <button class="minus">
                  <i class="fal fa-minus" aria-hidden="true"></i>
                </button>
                <input value="${item.quantity}" type="number" min="1" max="${stock}" readonly="" />
                <button class="plus">
                  <i class="fal fa-plus" aria-hidden="true"></i>
                </button>
              </div>
            </td>
            <td class="cart_page_total">
              <h3>${(priceNew * item.quantity).toLocaleString("vi-VN")}đ</h3>
            </td>
            <td class="cart_page_action">
              <a href="javascript:;" button-remove-item>
                <i class="fal fa-times" aria-hidden="true"></i> Xóa
              </a>
            </td>
        </tr>
          `
          if (item.checked){
            htmlSummary += `
            <li>
              <a class="img" href="/product/detail/${detail.slug}">
                <img class="img-fluid w-100" alt="${detail.name}" 
                src="${domainCDN}${detail.images[0]}">
              </a>
              <div class="text">
                <a class="title" href="/product/detail/${detail.slug}">${detail.name}</a>
                <p>${priceNew.toLocaleString("vi-VN")}đ × ${item.quantity}</p>
                ${htmlVariantSummary}
              </div>
            </li>
            `
          }

          })
          let discount = 0;
          let total = subTotal - discount;

        const ulMiniCart = miniCart.querySelector(".offcanvas-body ul");
        ulMiniCart.innerHTML = htmlMiniCart
        const cartTable = document.querySelector("[cart-table]");
          if(cartTable) {
            cartTable.innerHTML = htmlCartTable;
          }
        const cartSummary = document.querySelector("[cart-summary]");
          if(cartSummary) {
            cartSummary.innerHTML = htmlSummary;
          }
         const listElementSubTotal = document.querySelectorAll("[sub-total]");
          listElementSubTotal.forEach(item => {
            item.innerHTML = subTotal.toLocaleString("vi-VN");
          })

          const elementDiscount = document.querySelector("[discount]");
          if(elementDiscount) {
            elementDiscount.innerHTML = discount.toLocaleString("vi-VN");
          }

          const elementTotal = document.querySelector("[total]");
          if(elementTotal) {
            elementTotal.innerHTML = total.toLocaleString("vi-VN");
          }

        removeItemCart()
        updateQuantityCart()
        updateChangeBox()
      }
    })
  }else {
    const ulMiniCart = miniCart.querySelector(".offcanvas-body ul");
    ulMiniCart.innerHTML = "Giỏ hàng trống.";
    const cartTable = document.querySelector("[cart-table]");
      if(cartTable) {
        cartTable.innerHTML = `
          <tr>
            <td colspan="7" class="text-center">
              Giỏ hàng trống.
            </td>
          </tr>
        `;
      }
    const cartSummary = document.querySelector("[cart-summary]");
      if(cartSummary) {
        cartSummary.innerHTML = "";
      }
    const listElementSubTotal = document.querySelectorAll("[sub-total]");
    listElementSubTotal.forEach(item => {
      item.innerHTML = 0;
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

// Cập nhật số lượng hiển thị trên compare
const miniCompareQuantity = () => {
  const elementQuantityCompare = document.querySelector("[mini-compare-quantity]")
  const compareLocalStorage = JSON.parse(localStorage.getItem("compare"))
  elementQuantityCompare.innerHTML = compareLocalStorage.length
}
miniCompareQuantity()
// End Cập nhật số lượng hiển thị trên compare

// mini-wishlist-quantity
const miniWishlistQuantity = () => {
  const wishlist = JSON.parse(localStorage.getItem("wishlist"));
  const miniWishlistQuantity = document.querySelector("[mini-wishlist-quantity]");
  miniWishlistQuantity.innerHTML = wishlist.length;
}
miniWishlistQuantity();
// End mini-wishlist-quantity


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
  const buttonAddCompare = changeAttribute.querySelector("[button-add-compare]")

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
        quantity: quantity,
        checked: true
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
      removeItemCart()


    }

  })

  // Thêm vào so sánh
  buttonAddCompare.addEventListener("click", () => {
    const productId = buttonAddCompare.getAttribute("product-id")
    if (productId){
      const dataCompare = {
        productId: productId,
        // attributeValue: variantCart.attributeValue,
      }
      const compare = JSON.parse(localStorage.getItem("compare"))
      if (compare.length < 5){
        if (variantCart && productVariant && productVariant.length > 0){
          dataCompare.attributeValue = variantCart.attributeValue
          // Check sản phẩm trùng
          const existProduct = compare.find(item => {
            if(item.productId != dataCompare.productId){
              return false
            }
            // Kiểm tra thuộc tính
            const oldAttri = item.attributeValue
            const newAttri = dataCompare.attributeValue
            if(oldAttri.length !== newAttri.length){
              return false
            }
            return oldAttri.every(attri => {
              const match =  newAttri.find(a => a.attriId == attri.attriId && a.value == attri.value)
              return match ? true : false;
            })

          })
          if(existProduct){
            notyf.success("Sản phẩm đã có trong so sánh!");
          }else {
            compare.push(dataCompare)
            notyf.success("Đã thêm vào so sánh!");
          }
        }else {
          // Tìm xem có sản phẩm trùng productId hay không
          const existItem = compare.find(item => item.productId === dataCompare.productId);

          if(existItem) {
            notyf.success("Sản phẩm đã có trong so sánh!");
          } else {
            compare.push(dataCompare);
            notyf.success("Đã thêm vào so sánh!");
          }
        }
        localStorage.setItem("compare", JSON.stringify(compare))
        miniCompareQuantity()

      }else {
        notyf.error("Số lượng sản phẩm so sánh đã đủ!");
      }

    }

  })
  // Thêm vào yêu thích
  const buttonAddWishlist = changeAttribute.querySelector("[button-add-wishlist]");
  buttonAddWishlist.addEventListener("click", () => {
    const productId = buttonAddWishlist.getAttribute("product-id")
    const quantity = parseInt(inputQuantity.value)
    if (productId && quantity > 0){
      const dataCart = {
        productId: productId,
        // attributeValue: variantCart.attributeValue,
        quantity: quantity,
      }
      const wishlist = JSON.parse(localStorage.getItem("wishlist"))
      if (variantCart && productVariant && productVariant.length > 0){
        dataCart.attributeValue = variantCart.attributeValue
        // Check sản phẩm trùng
        const existProduct = wishlist.find(item => {
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
          wishlist.unshift(dataCart)
          notyf.success("Đã thêm vào yêu thích!");
        }
      }else {
        // Tìm xem có sản phẩm trùng productId hay không
        const existItem = cart.find(item => item.productId === dataCart.productId);

        if(existItem) {
          existItem.quantity = dataCart.quantity;
          notyf.success("Đã cập nhật số lượng!");
        } else {
          wishlist.unshift(dataCart);
          notyf.success("Đã thêm vào yêu thích!");
        }
      }
      localStorage.setItem("wishlist", JSON.stringify(wishlist))
      miniWishlistQuantity();

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
// Nút thêm vào giỏ hàng ở trang So sánh
const eventAddItemToCartInCompare = () => {
  const listButtonAdd = document.querySelectorAll("[button-add]");
  listButtonAdd.forEach(button => {
    button.addEventListener("click", () => {
      const index = button.getAttribute("button-add")
      const compare = JSON.parse(localStorage.getItem("compare"))
      const compareItem = compare[index]
      const dataItem = {
        productId: compareItem.productId,
        quantity: 1,
        checked: true
      }
      const cart =  JSON.parse(localStorage.getItem("cart"))
      if(compareItem.attributeValue){
        dataItem.attributeValue = compareItem.attributeValue
        const variantMatched = cart.find(item => {
          if(item.productId !== dataItem.productId){
            return false;
          }
          const oldAttri = item.attributeValue
          const newAttri = dataItem.attributeValue
          // Số lượng thuộc tính phải trùng
          if(oldAttri.length !== newAttri.length) {
            return false;
          }

          // Kiểm tra từng attrId và value
          return oldAttri.every(attr => {
            const match = newAttri.find(a => a.attriId === attr.attriId && a.value === attr.value);
            return match ? true : false;
          });
        })
        if(variantMatched) {
          notyf.success("Sản phẩm đã có trong giỏ hàng!");
        } else {
          cart.unshift(dataItem);
          notyf.success("Đã thêm vào giỏ hàng!");
        }
      }else{
        // Tìm xem có sản phẩm trùng productId hay không
        const existItem = cart.find(item => item.productId === dataItem.productId);

        if(existItem) {
          notyf.success("Sản phẩm đã có trong giỏ hàng!");
        } else {
          cart.unshift(dataItem);
          notyf.success("Đã thêm vào giỏ hàng!");
        }
      }
      localStorage.setItem("cart", JSON.stringify(cart));
      miniCartQuantity();
      drawCart();
    })
  })
 
}
// Hết Nút thêm vào giỏ hàng ở trang So sánh
// Nút xóa item khỏi trang so sánh
const eventRemoveItemInCompare = () => {
  const listButtonRemove = document.querySelectorAll("[button-remove]");
  listButtonRemove.forEach(button => {
    button.addEventListener("click", () => {
      const index = parseInt(button.getAttribute("button-remove"));
      const compareList = JSON.parse(localStorage.getItem("compare"));
      compareList.splice(index, 1);
      localStorage.setItem("compare", JSON.stringify(compareList));
      drawNotify("success", "Đã xóa sản phẩm khỏi so sánh!");
      window.location.reload();
    })
  })
}
// Hết Nút xóa item khỏi trang so sánh


const drawCompare = () => {
  const compare = JSON.parse(localStorage.getItem("compare"))
  if(compare.length > 0){
    fetch("/compare/list", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(compare)
    })
    .then(res => res.json())
    .then(data => {
      if (data.code == "error"){
        localStorage.setItem("compare", JSON.stringify([]));
      }
      if (data.code == "success"){
        localStorage.setItem("compare", JSON.stringify(data.compare));
        const element1 = document.querySelector("[html-1]")
        const element2 = document.querySelector("[html-2]")
        const element3 = document.querySelector("[html-3]")
        const element4 = document.querySelector("[html-4]")
        const element5 = document.querySelector("[html-5]")
        const element6 = document.querySelector("[html-6]")
        let html1 = ""
        let html2 = ""
        let html3 = ""
        let html4 = ""
        let html5 = ""
        let html6 = ""
        data.compare.forEach((item, index) => {
          const {detail} = item
          let priceNew = 0
          let priceOld = 0
          let stock = 0
            let htmlVariant = ""
          if(item.attributeValue){
            const variantMatched = detail.variants.find(attri => {
              return (
                attri.attributeValue.every(att => {
                  const selected = item.attributeValue.find(v => v.attriId == att.attriId)
                  return selected && selected.value == att.value
                })
              )
            })
            priceNew = variantMatched.priceNew
            priceOld = variantMatched.priceOld
            stock = variantMatched.stock
            detail.attributeList.forEach(attr => {
              const variant = item.attributeValue.find(v => v.attriId === attr._id);
              htmlVariant += `
                <p>${attr.name}: ${variant.label}</p>
              `;
              })
          }else {
            priceNew = detail.priceNew
            priceOld = detail.priceOld
            stock = detail.stock
          }

          html1 += `
            <td>
              <img class="img-fluid w-100" alt="${detail.name}" src="${domainCDN}${detail.images[0]}">
              <a class="title" href="/product/detail/${detail.slug}">${detail.name}</a>
            </td>`
          html2 += `
            <td>
              <p>${detail.description}</p>
            </td>
            `
          html3 += `
            <td>
              <p>
                ${priceNew.toLocaleString("vi-VN")}đ
                <del>${priceOld.toLocaleString("vi-VN")}đ</del>
              </p>
            </td>
            `;

          html4 += `
            <td>
              ${htmlVariant}
            </td>
          `;
          html5 += `
            <td>
              <p class="rating">
                <i class="fas fa-star" aria-hidden="true"></i>
                <i class="fas fa-star" aria-hidden="true"></i>
                <i class="fas fa-star" aria-hidden="true"></i>
                <i class="fas fa-star" aria-hidden="true"></i>
                <i class="fas fa-star" aria-hidden="true"></i>
                <i class="fal fa-star" aria-hidden="true"></i>
              </p>
            </td>
          `;

          html6 += `
            <td>
              ${stock > 0 ?
                `<a class="common_btn" href="javascript:;" button-add ="${index}">Thêm vào giỏ</a>`
                : 
                `<div class="text-danger">Đã hết hàng</div>`
              } 
              <a class="remove common_btn" href="javascript:;" button-remove="${index}">
                <i class="fal fa-trash" aria-hidden="true"></i>
              </a>
            </td>
          `;
        })
        element1.outerHTML = html1
        element2.outerHTML = html2
        element3.outerHTML = html3
        element4.outerHTML = html4
        element5.outerHTML = html5
        element6.outerHTML = html6
      }
      eventAddItemToCartInCompare()
      eventRemoveItemInCompare()

    })
  }
}
// Trang so sánh
const comparePage = document.querySelector(".compare_page");
if(comparePage) {
  drawCompare();
}
// Hết Trang so sánh