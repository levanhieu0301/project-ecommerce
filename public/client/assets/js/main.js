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


