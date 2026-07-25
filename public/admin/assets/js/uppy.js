import { Uppy, Dashboard, XHRUpload  } from "https://releases.transloadit.com/uppy/v5.2.1/uppy.min.mjs"
const uppuUpload = document.querySelector("#uppy");
if(uppuUpload) {
    const uppy = new Uppy()
  uppy.use(Dashboard, 
  { 
    target: '#uppy',
    inline: true , 
    width: "100%"
  })
  uppy.use(XHRUpload, 
  { 
    endpoint: `/${pathAdmin}/file-manager/upload`, // Đường dẫn backend định nghĩa để nhận ảnh
    fieldName: "files",
    bundle: true
  })
  uppy.on('complete', (result) => {
    if(result.successful.length > 0){
      drawNotify("success", `Upload thành công ${result.successful.length} file`)
    }
    if(result.failed.length > 0){
      drawNotify("error", `Upload lỗi ${result.failed.length} file`)
    }
    window.location.reload();
  });
}