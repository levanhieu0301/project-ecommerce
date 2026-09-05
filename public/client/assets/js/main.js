

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
          let couponDetail = sessionStorage.getItem("coupon");
          if(couponDetail) {
            couponDetail = JSON.parse(couponDetail);

            // Kiểm tra giá trị đơn hàng tối thiểu
            if (subTotal >= couponDetail.minOrderValue) {
              if (couponDetail.typeDiscount === "percentage") {
                discount = (subTotal * couponDetail.value) / 100;

                // Giới hạn mức giảm tối đa (nếu có)
                if (couponDetail.maxDiscountValue > 0 && discount > couponDetail.maxDiscountValue) {
                  discount = couponDetail.maxDiscountValue;
                }

              } else if (couponDetail.typeDiscount === "fixed") {
                discount = couponDetail.value;
              }

              const elementViewCoupon = document.querySelector("#applyCouponForm .inner-view-coupon");
              const elementCoupon = elementViewCoupon.querySelector(".coupon-code");
              elementViewCoupon.style.display = "flex";
              elementCoupon.innerHTML = couponDetail.code;
            } else {
              // Nếu chưa đủ điều kiện áp dụng mã
              notyf.error(`Đơn hàng chưa đạt giá trị tối thiểu: ${couponDetail.minOrderValue}đ`);
              sessionStorage.removeItem("couponDetail");
            }
          }
          
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

// Cập nhật số lượng item trong yêu thích
const eventQuantityItemInWishlist = () => {
  const listBoxQuantity = document.querySelectorAll("[wishlist-table] .cart_page_quantity");
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

    const wishlist = JSON.parse(localStorage.getItem("wishlist"));
    const itemUpdate = wishlist.find(wishItem => {
      // So sánh giống productId
      const sameProduct = wishItem.productId == productId;

      // So sánh giống variant
      const variantItemInCart = wishItem.attributeValue ? JSON.stringify(wishItem.attributeValue) : "[]";
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
          localStorage.setItem("wishlist", JSON.stringify(wishlist));
          drawWishlistPage();
        } else {
          notyf.error(`Chỉ còn ${max} sản phẩm.`);
        }
      })

      // Giảm số lượng
      buttonMinus.addEventListener("click", () => {
        const quantity = parseInt(inputQuantity.value);
        const min = parseInt(inputQuantity.min);
        if(quantity > min) {
          itemUpdate.quantity = quantity - 1;
          localStorage.setItem("wishlist", JSON.stringify(wishlist));
          drawWishlistPage();
        }
      })
    }
  })
}
// Hết Cập nhật số lượng item trong yêu thích

// Nút thêm vào giỏ hàng ở trang Yêu thích
const eventAddItemToCartInWishlist = () => {
  const listButtonAdd = document.querySelectorAll("[button-add]");
  listButtonAdd.forEach(button => {
    button.addEventListener("click", () => {
      const index = button.getAttribute("button-add");
      const wishlist = JSON.parse(localStorage.getItem("wishlist"));
      const wishItem = wishlist[index];
      const dataItem = {
        productId: wishItem.productId,
        quantity: wishItem.quantity,
        checked: true
      };

      const cart = JSON.parse(localStorage.getItem("cart"));

      if(wishItem.attributeValue) {
        dataItem.attributeValue = wishItem.attributeValue;

        // Tìm xem có sản phẩm trùng productId và trùng các attributeValue hay không
        const existItem = cart.find(item => {
          if(item.productId !== dataItem.productId) {
            return false;
          }

          // So sánh toàn bộ các thuộc tính trong variant
          const oldAttrs = item.attributeValue;
          const newAttrs = dataItem.attributeValue;

          // Số lượng thuộc tính phải trùng
          if(oldAttrs.length !== newAttrs.length) {
            return false;
          }

          // Kiểm tra từng attrId và value
          return oldAttrs.every(attr => {
            const match = newAttrs.find(a => a.attriId === attr.attriId && a.value === attr.value);
            return match ? true : false;
          });
        })

        if(existItem) {
          existItem.quantity = dataItem.quantity;
          notyf.success("Sản phẩm đã có trong giỏ hàng!");
        } else {
          cart.unshift(dataItem);
          notyf.success("Đã thêm vào giỏ hàng!");
        }
      } else {
        // Tìm xem có sản phẩm trùng productId hay không
        const existItem = cart.find(item => item.productId === dataItem.productId);

        if(existItem) {
          existItem.quantity = dataItem.quantity;
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
// Hết Nút thêm vào giỏ hàng ở trang Yêu thích
// Nút xóa item khỏi trang yêu thích
const eventRemoveItemInWishlist = () => {
  const listButtonRemove = document.querySelectorAll("[button-remove]");
  listButtonRemove.forEach(button => {
    button.addEventListener("click", () => {
      const index = parseInt(button.getAttribute("button-remove"));
      const wishlist = JSON.parse(localStorage.getItem("wishlist"));
      wishlist.splice(index, 1);
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
      drawNotify("success", "Đã xóa sản phẩm khỏi danh sách yêu thích!");
      window.location.reload();
    })
  })
}
// Hết Nút xóa item khỏi trang yêu thích


// Vẽ danh sách yêu thích
const drawWishlistPage = () => {
  const wishlist = JSON.parse(localStorage.getItem("wishlist"));
  if(wishlist.length > 0) {
    fetch(`/wishlist/list`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(wishlist)
    })
      .then(res => res.json())
      .then(data => {
        if(data.code == "error") {
          localStorage.setItem("wishlist", JSON.stringify([]));
        }

        if(data.code == "success") {
          localStorage.setItem("wishlist", JSON.stringify(data.wishlist));
          
          let htmlWishlistTable = "";

          data.wishlist.forEach((item, index) => {
            const { detail } = item;
            let priceOld = 0;
            let priceNew = 0;
            let stock = 0;
            let htmlVariant = "";
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
            htmlWishlistTable += `
              <tr
                cart-item 
                product-id="${item.productId}" 
                ${item.attributeValue ? `attributeValue="${encodeURIComponent(JSON.stringify(item.attributeValue))}"` : ''}
              >
                <td class="cart_page_img">
                  <div class="img">
                    <img class="img-fluid w-100" alt="${detail.name}" src="${domainCDN}${detail.images[0]}">
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
                    <input 
                      value="${item.quantity}" 
                      type="number" 
                      readonly="" 
                      min="1" 
                      max="${stock}" 
                    />
                    <button class="plus">
                      <i class="fal fa-plus" aria-hidden="true"></i>
                    </button>
                  </div>
                </td>
                <td class="cart_page_price">
                  <h3>${(item.quantity*priceNew).toLocaleString("vi-VN")}đ</h3>
                </td>
                <td class="cart_page_action">
                  ${
                    stock > 0 ? 
                    '<a class="common_btn" href="javascript:;" button-add="'+index+'">Thêm vào giỏ</a>' 
                    : 
                    '<div class="text-danger">Đã hết hàng</div>'
                  }
                  <a class="remove common_btn" href="javascript:;" button-remove="${index}">Xóa</a>
                </td>
              </tr>
            `;
          })

          const wishlistTable = document.querySelector("[wishlist-table]");
          wishlistTable.innerHTML = htmlWishlistTable;
          eventQuantityItemInWishlist();
          eventAddItemToCartInWishlist();
          eventRemoveItemInWishlist();
        }
      })
  }
}
// Hết Vẽ danh sách yêu thích

// Trang yêu thích
const wishlistPage = document.querySelector(".wishlist_page");
if(wishlistPage) {
  drawWishlistPage();
}
// Hết Trang yêu thích

// Register Form
const registerForm = document.querySelector("#registerForm");
if(registerForm) {
  const validation = new JustValidate('#registerForm');

  validation
    .addField('#fullName', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập họ tên!'
      },
      {
        rule: 'minLength',
        value: 5,
        errorMessage: 'Họ tên phải có ít nhất 5 ký tự!',
      },
      {
        rule: 'maxLength',
        value: 50,
        errorMessage: 'Họ tên không được vượt quá 50 ký tự!',
      },
    ])
    .addField('#email', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập email của bạn!',
      },
      {
        rule: 'email',
        errorMessage: 'Email không đúng định dạng!',
      },
    ])
    .addField('#phone', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập số điện thoại!'
      },
      {
        rule: 'customRegexp',
        value: /^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[0-6|8|9]|9[0-4|6-9])[0-9]{7}$/,
        errorMessage: "Số điện thoại không đúng định dạng!"
      },
    ])
    .addField('#password', [
      {
        rule: 'required',
        errorMessage: "Vui lòng nhập mật khẩu!"
      },
      {
        rule: 'minLength',
        value: 8,
        errorMessage: "Mật khẩu phải có ít nhất 8 ký tự!"
      },
      {
        rule: 'customRegexp',
        value: /[A-Z]/,
        errorMessage: "Mật khẩu phải có ít nhất một chữ cái viết hoa!"
      },
      {
        rule: 'customRegexp',
        value: /[a-z]/,
        errorMessage: "Mật khẩu phải có ít nhất một chữ cái viết thường!"
      },
      {
        rule: 'customRegexp',
        value: /\d/,
        errorMessage: "Mật khẩu phải có ít nhất một chữ số!"
      },
      {
        rule: 'customRegexp',
        value: /[~!@#$%^&*]/,
        errorMessage: "Mật khẩu phải có ít nhất một ký tự đặc biệt! (~!@#$%^&*)"
      },
    ])
    .addField('#confirmPassword', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng xác nhận mật khẩu!',
      },
      {
        validator: (value, fields) => {
          const password = fields['#password'].elem.value;
          return value == password;
        },
        errorMessage: 'Mật khẩu xác nhận không khớp!',
      }
    ])
    .onSuccess((event) => {
      const fullName = event.target.fullName.value;
      const email = event.target.email.value;
      const phone = event.target.phone.value;
      const password = event.target.password.value;

      const dataFinal = {
        fullName: fullName,
        email: email,
        phone: phone,
        password: password,
      };

      fetch(`/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(dataFinal)
      })
        .then(res => res.json())
        .then(data => {
          if(data.code == "error") {
            notyf.error(data.message);
          }

          if(data.code == "success") {
            drawNotify(data.code, data.message);
            window.location.href = `/`;
          }
        })
    })
  ;
}
// End Register Form

// Login Form
const loginForm = document.querySelector("#loginForm");
if(loginForm) {
  const validation = new JustValidate('#loginForm');

  validation
    .addField('#email', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập email của bạn!',
      },
      {
        rule: 'email',
        errorMessage: 'Email không đúng định dạng!',
      },
    ])
    .addField('#password', [
      {
        rule: 'required',
        errorMessage: "Vui lòng nhập mật khẩu!"
      },
    ])
    .onSuccess((event) => {
      const email = event.target.email.value;
      const password = event.target.password.value;
      const rememberPassword = event.target.rememberPassword.checked;

      const dataFinal = {
        email: email,
        password: password,
        rememberPassword: rememberPassword
      };

      fetch(`/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(dataFinal)
      })
        .then(res => res.json())
        .then(data => {
          if(data.code == "error") {
            notyf.error(data.message);
          }

          if(data.code == "success") {
            drawNotify(data.code, data.message);
            window.location.href = `/`;
          }
        })
    })
  ;
}
// End Login Form

// Forgot Password

const forgotPasswordForm = document.querySelector("#forgotPasswordForm");
if(forgotPasswordForm) {
  const validation = new JustValidate('#forgotPasswordForm');

  validation
    .addField('#email', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập email của bạn!',
      },
      {
        rule: 'email',
        errorMessage: 'Email không đúng định dạng!',
      },
    ])
    .onSuccess((event) => {
      const email = event.target.email.value;

      const dataFinal = {
        email: email
      };

      fetch(`/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(dataFinal)
      })
        .then(res => res.json())
        .then(data => {
          if(data.code == "error") {
            notyf.error(data.message);
          }

          if(data.code == "success") {
            drawNotify(data.code, data.message);
            window.location.href = `/auth/otp-password?email=${email}`;
          }
        })
    })
  ;
}

// End Forgot Password
// OTP Password Form
const otpPasswordForm = document.querySelector("#otpPasswordForm");
if(otpPasswordForm) {
  const validation = new JustValidate('#otpPasswordForm');

  validation
    .addField('#otp', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập mã OTP!',
      },
    ])
    .onSuccess((event) => {
      const email = event.target.email.value;
      const otp = event.target.otp.value;

      const dataFinal = {
        email: email,
        otp: otp
      };

      fetch(`/auth/otp-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(dataFinal)
      })
        .then(res => res.json())
        .then(data => {
          if(data.code == "error") {
            notyf.error(data.message);
          }

          if(data.code == "success") {
            drawNotify(data.code, data.message);
            window.location.href = `/auth/reset-password`;
          }
        })
    })
  ;
}
// End OTP Password Form
// Reset Password Form
const resetPasswordForm = document.querySelector("#resetPasswordForm");
if(resetPasswordForm) {
  const validation = new JustValidate('#resetPasswordForm');

  validation
    .addField('#password', [
      {
        rule: 'required',
        errorMessage: "Vui lòng nhập mật khẩu mới!"
      },
      {
        rule: 'minLength',
        value: 8,
        errorMessage: "Mật khẩu phải có ít nhất 8 ký tự!"
      },
      {
        rule: 'customRegexp',
        value: /[A-Z]/,
        errorMessage: "Mật khẩu phải có ít nhất một chữ cái viết hoa!"
      },
      {
        rule: 'customRegexp',
        value: /[a-z]/,
        errorMessage: "Mật khẩu phải có ít nhất một chữ cái viết thường!"
      },
      {
        rule: 'customRegexp',
        value: /\d/,
        errorMessage: "Mật khẩu phải có ít nhất một chữ số!"
      },
      {
        rule: 'customRegexp',
        value: /[~!@#$%^&*]/,
        errorMessage: "Mật khẩu phải có ít nhất một ký tự đặc biệt! (~!@#$%^&*)"
      },
    ])
    .addField('#confirmPassword', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng xác nhận mật khẩu!',
      },
      {
        validator: (value, fields) => {
          const password = fields['#password'].elem.value;
          return value == password;
        },
        errorMessage: 'Mật khẩu xác nhận không khớp!',
      }
    ])
    .onSuccess((event) => {
      const password = event.target.password.value;

      const dataFinal = {
        password: password,
      };

      fetch(`/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(dataFinal)
      })
        .then(res => res.json())
        .then(data => {
          if(data.code == "error") {
            notyf.error(data.message);
          }

          if(data.code == "success") {
            drawNotify(data.code, data.message);
            const dataHrefSuccess = resetPasswordForm.getAttribute("data-href-success");
            window.location.href = dataHrefSuccess ? dataHrefSuccess : `/`;

          }
        })
    })
  ;
}
// End Reset Password Form
// Dashboard Profile Edit Form
const dashboardProfileEditForm = document.querySelector("#dashboardProfileEditForm");
if(dashboardProfileEditForm) {
  const validation = new JustValidate('#dashboardProfileEditForm');

  validation
    .addField('#fullName', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập họ tên!'
      },
      {
        rule: 'minLength',
        value: 5,
        errorMessage: 'Họ tên phải có ít nhất 5 ký tự!',
      },
      {
        rule: 'maxLength',
        value: 50,
        errorMessage: 'Họ tên không được vượt quá 50 ký tự!',
      },
    ])
    .addField('#email', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập email của bạn!',
      },
      {
        rule: 'email',
        errorMessage: 'Email không đúng định dạng!',
      },
    ])
    .addField('#phone', [
      {
        rule: 'customRegexp',
        value: /^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[0-6|8|9]|9[0-4|6-9])[0-9]{7}$/,
        errorMessage: "Số điện thoại không đúng định dạng!"
      },
    ])
    .onSuccess((event) => {
      const fullName = event.target.fullName.value;
      const email = event.target.email.value;
      const phone = event.target.phone.value;

      const dataFinal = {
        fullName: fullName,
        email: email,
        phone: phone,
      };

      fetch(`/dashboard/profile/edit`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(dataFinal)
      })
        .then(res => res.json())
        .then(data => {
          if(data.code == "error") {
            notyf.error(data.message);
          }

          if(data.code == "success") {
            notyf.success(data.message);
          }
        })
    })
  ;
}
// End Dashboard Profile Edit Form
// Dashboard Address Create Form
const dashboardAddressCreateForm = document.querySelector("#dashboardAddressCreateForm");
if(dashboardAddressCreateForm) {
  const validation = new JustValidate('#dashboardAddressCreateForm');

  validation
    .addField('#fullName', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập họ tên!'
      },
      {
        rule: 'minLength',
        value: 5,
        errorMessage: 'Họ tên phải có ít nhất 5 ký tự!',
      },
      {
        rule: 'maxLength',
        value: 50,
        errorMessage: 'Họ tên không được vượt quá 50 ký tự!',
      },
    ])
    .addField('#phone', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập số điện thoại!'
      },
      {
        rule: 'customRegexp',
        value: /^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[0-6|8|9]|9[0-4|6-9])[0-9]{7}$/,
        errorMessage: "Số điện thoại không đúng định dạng!"
      },
    ])
    .addField('#address', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập tên đường, tòa nhà, số nhà!',
      },
    ])
    .addField('#longitude', [
      {
        rule: 'required',
        errorMessage: 'Địa chỉ không hợp lệ!',
      },
    ])
    .addField('#latitude', [
      {
        rule: 'required',
        errorMessage: 'Địa chỉ không hợp lệ!',
      },
    ])
    .onSuccess((event) => {
      const fullName = event.target.fullName.value;
      const phone = event.target.phone.value;
      const address = event.target.address.value;
      const longitude = event.target.longitude.value;
      const latitude = event.target.latitude.value;
      const isDefault = event.target.isDefault.checked;

      const dataFinal = {
        fullName: fullName,
        phone: phone,
        address: address,
        longitude: longitude,
        latitude: latitude,
        isDefault: isDefault,
      };

      fetch(`/dashboard/address/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(dataFinal)
      })
        .then(res => res.json())
        .then(data => {
          if(data.code == "error") {
            notyf.error(data.message);
          }

          if(data.code == "success") {
            drawNotify(data.code, data.message);
            window.location.href = `/dashboard/address`;
          }
        })
    })
  ;
}
// End Dashboard Address Create Form
// button-api
const listButtonApi = document.querySelectorAll("[button-api]");
if(listButtonApi.length > 0) {
  listButtonApi.forEach(button => {
    button.addEventListener("click", () => {
      const method = button.getAttribute("data-method");
      const api = button.getAttribute("data-api");

      fetch(api, {
        method: method || "GET"
      })
        .then(res => res.json())
        .then(data => {
          if(data.code == "error") {
            notyf.error(data.message);
          }

          if(data.code == "success") {
            drawNotify(data.code, data.message);
            location.reload();
          }
        })
    })
  })
}
// End button-api

// Map
const boxMap = document.querySelector("#boxMap");
let map = null;
if(boxMap) {
  // Khởi tạo bản đồ
  map = new ol.Map({
    target: 'boxMap',
    layers: [
      new ol.layer.Tile({
        source: new ol.source.OSM()
      })
    ],
    view: new ol.View({
      center: ol.proj.fromLonLat([105.614548, 21.0476424]),
      zoom: 10
    })
  });

   // Layer để chứa marker (điểm đánh dấu)
  const markerLayer = new ol.layer.Vector({ source: new ol.source.Vector() });
  map.addLayer(markerLayer);
  // Hàm thêm marker (điểm đánh dấu)
  const setMarker = (lon, lat) => {
    markerLayer.getSource().clear();
    const marker = new ol.Feature({
      geometry: new ol.geom.Point(ol.proj.fromLonLat([lon, lat]))
    });
    
    marker.setStyle(new ol.style.Style({
      image: new ol.style.Icon({
        anchor: [0.5, 1],
        src: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png', // icon location
        scale: 0.5 // thu nhỏ lại cho vừa bản đồ
      })
    }));

    markerLayer.getSource().addFeature(marker);
  }
  // Hiển thị vị trí mặc định
    const inputLon = document.querySelector(`[name="longitude"]`);
    const inputLat = document.querySelector(`[name="latitude"]`);
    if(inputLon.value && inputLat.value) {
      const lon = parseFloat(inputLon.value);
      const lat = parseFloat(inputLat.value);
      setMarker(lon, lat);
      // Di chuyển bản đồ đến đúng vị trí
      map.getView().animate({ center: ol.proj.fromLonLat([lon, lat]), zoom: 15 });
    }


  // Cho phép click để chọn vị trí
  map.on('click', (event) => {
    const coord = ol.proj.toLonLat(event.coordinate);
    const lon = coord[0];
    const lat = coord[1];
    setMarker(lon, lat);

    // Gọi API Nominatim để lấy địa chỉ chi tiết
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
      .then(res => res.json())
      .then(data => {
        if(data && data.display_name) {
          const inputAddress = document.querySelector(`[name="address"]`);
          inputAddress.value = data.display_name;

          const inputLon = document.querySelector(`[name="longitude"]`);
          inputLon.value = lon;

          const inputLat = document.querySelector(`[name="latitude"]`);
          inputLat.value = lat;
        } else {
          notyf.error("Không tìm thấy địa chỉ!");
        }
      })
  });

  // Tìm kiếm địa điểm
  const searchInput = document.querySelector("#mapSearchInput");
  const searchBtn = document.querySelector("#mapSearchBtn");
  searchBtn.addEventListener("click", () => {
    const keyword = searchInput.value;
    if(!keyword) {
      notyf.error("Vui lòng nhập địa chỉ tìm kiếm!");
      return;
    }
    
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(keyword)}&countrycodes=vn`)
      .then(res => res.json())
      .then(data => {
        if(data && data.length > 0) {
          const firstResult = data[0];
          const lon = parseFloat(firstResult.lon);
          const lat = parseFloat(firstResult.lat);
          setMarker(lon, lat);
          // Di chuyển bản đồ đến đúng vị trí
          map.getView().animate({ center: ol.proj.fromLonLat([lon, lat]), zoom: 15 });
          // Gán lại địa chỉ vào ô input
          const inputAddress = document.querySelector(`[name="address"]`);
          inputAddress.value = firstResult.display_name;

          const inputLon = document.querySelector(`[name="longitude"]`);
          inputLon.value = lon;

          const inputLat = document.querySelector(`[name="latitude"]`);
          inputLat.value = lat;
        } else {
          notyf.error("Không tìm thấy địa chỉ!");
        }
	  });
  })

}

// Dashboard Address Edit Form
const dashboardAddressEditForm = document.querySelector("#dashboardAddressEditForm");
if(dashboardAddressEditForm) {
  const validation = new JustValidate('#dashboardAddressEditForm');

  validation
    .addField('#fullName', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập họ tên!'
      },
      {
        rule: 'minLength',
        value: 5,
        errorMessage: 'Họ tên phải có ít nhất 5 ký tự!',
      },
      {
        rule: 'maxLength',
        value: 50,
        errorMessage: 'Họ tên không được vượt quá 50 ký tự!',
      },
    ])
    .addField('#phone', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập số điện thoại!'
      },
      {
        rule: 'customRegexp',
        value: /^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[0-6|8|9]|9[0-4|6-9])[0-9]{7}$/,
        errorMessage: "Số điện thoại không đúng định dạng!"
      },
    ])
    .addField('#address', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập tên đường, tòa nhà, số nhà!',
      },
    ])
    .addField('#longitude', [
      {
        rule: 'required',
        errorMessage: 'Địa chỉ không hợp lệ!',
      },
    ])
    .addField('#latitude', [
      {
        rule: 'required',
        errorMessage: 'Địa chỉ không hợp lệ!',
      },
    ])
    .onSuccess((event) => {
      const id = event.target.id.value;
      const fullName = event.target.fullName.value;
      const phone = event.target.phone.value;
      const address = event.target.address.value;
      const longitude = parseFloat(event.target.longitude.value);
      const latitude = parseFloat(event.target.latitude.value);
      const isDefault = event.target.isDefault.checked;

      const dataFinal = {
        fullName: fullName,
        phone: phone,
        address: address,
        longitude: longitude,
        latitude: latitude,
        isDefault: isDefault,
      };

      fetch(`/dashboard/address/edit/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(dataFinal)
      })
        .then(res => res.json())
        .then(data => {
          if(data.code == "error") {
            notyf.error(data.message);
          }

          if(data.code == "success") {
            notyf.success(data.message);
          }
        })
    })
  ;
}
// End Dashboard Address Edit Form
// Ảnh đại diện client
const inputAvatarClient = document.querySelector("#profile_photo");
if(inputAvatarClient) {
  inputAvatarClient.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if(file){
      // Handle file selection logic here
      const formData = new FormData();
      formData.append("avatar", file);
      
      fetch(`/dashboard/profile/change-avatar`, {
        method: "PATCH",
        body: formData
      })
        .then(res => res.json())
        .then(data => {
          if(data.code == "error") {
            notyf.error(data.message);
          }

          if(data.code == "success") {
            const profilePhotoPreview = document.querySelector("[profile-photo-preview]");
            profilePhotoPreview.src = `${domainCDN}${data.linkAvatar}`;
            notyf.success(data.message);

          }
        })
      }

  })
}
// End Ảnh đại diện client
function checkCoupon(coupon) {
  const elementViewCoupon = document.querySelector("#applyCouponForm .inner-view-coupon");
  const elementCoupon = elementViewCoupon.querySelector(".coupon-code");

  const dataFinal = {
    coupon: coupon,
  };

  fetch(`/coupon/check`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(dataFinal)
  })
    .then(res => res.json())
    .then(data => {
      if(data.code == "error") {
        notyf.error(data.message);
        elementViewCoupon.style.display = "none";
        elementCoupon.innerHTML = "";
        sessionStorage.removeItem("coupon");
      }

      if(data.code == "success") {
        notyf.success(data.message);
        // Lưu thông tin coupon vào sessionStorage
        sessionStorage.setItem("coupon", JSON.stringify(data.coupon));
        elementViewCoupon.style.display = "flex";
        elementCoupon.innerHTML = data.coupon.code;
      }
      drawCart();
    })
}
// Apply Coupon Form
const applyCouponForm = document.querySelector("#applyCouponForm");
if(applyCouponForm) {
  applyCouponForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const coupon = event.target.coupon.value;

    if(!coupon) {
      notyf.error("Vui lòng nhập mã giảm giá!");
      return;
    }
    checkCoupon(coupon);
  })
    // Xóa mã giảm giá
  const buttonRemove = document.querySelector("#applyCouponForm .inner-view-coupon .inner-remove");
  if(buttonRemove) {
    const elementViewCoupon = document.querySelector("#applyCouponForm .inner-view-coupon");
    buttonRemove.addEventListener("click", () => {
      elementViewCoupon.style.display = "none";
      sessionStorage.removeItem("coupon");
      drawCart();
    })
  }

}
// End Apply Coupon Form

// radio button change Address

const checkoutPage = document.querySelector(".checkout_page");
if(checkoutPage) {
  const listRadioAddress = document.querySelectorAll("input[name='userAddress']");
    const collapseEl = checkoutPage.querySelector("#collapseThree");
  const collapse = new bootstrap.Collapse(collapseEl, { toggle: false })

  listRadioAddress.forEach(input  => {
    input.addEventListener("change", () => {
      // Cách 1:
      // // Loại bỏ check hết tất cả
      // listRadioAddress.forEach(i => {
      //   i.checked = false
      // })
      // // Check lại radio button vừa chọn
      // input.checked = true;

      // Cách 2: 
      listRadioAddress.forEach(i => {
        if(input.value == i.value){
          i.checked = true
        }else {
          i.checked = false
        }
      })
       if(input.value == "") {
        collapse.show();
      } else {
        collapse.hide();
      }
      if(map) {
        map.updateSize();
      }
    })
  })
}
// End radio button change Address