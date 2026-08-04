// Khởi tạo TinyMCE
const initialTinyMCE = () => {
  tinymce.init({
    selector: '[textarea-mce]',
    plugins: 'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount',
    toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat',
    init_instance_callback : (editor) => {
      editor.on('OpenWindow', () => {
       const title = document.querySelector(".tox .tox-dialog__title")?.innerHTML;
         if(title == "Insert/Edit Media" || title == "Insert/Edit Image") {
          const inputSource = document.querySelector(`.tox input.tox-textfield[type="url"]`);
          inputSource.value = domainCDN;
        }
    });
  }
  });
}
initialTinyMCE();
// Hết Khởi tạo TinyMCE

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

// Get checkbox list
const getCheckboxList = (name) => {
  const checkboxList = document.querySelector(`[checkbox-list="${name}"]`);
  const inputCheckboxList = checkboxList.querySelectorAll("input[type='checkbox']:checked");
  const listId = []
  if(inputCheckboxList.length > 0) {
    inputCheckboxList.forEach(item => {
      listId.push(item.value);
    })
  }
  return listId;
}
// End Get checkbox list

// articleCreateCategoryForm
const articleCreateCategoryForm = document.querySelector("#articleCreateCategoryForm");
if(articleCreateCategoryForm) {
  const validator = new JustValidate('#articleCreateCategoryForm');

  validator
    .addField('#name', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập tên danh mục!',
      },
    ])
    .addField('#slug', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập đường dẫn!',
      },
    ])
    .onSuccess((event) => {
      const name = event.target.name.value;
      const parent = event.target.parent.value;
      const description = tinymce.get("description").getContent();
      const status = event.target.status.value;
      const slug = event.target.slug.value;
      const avatar = event.target.avatar.value;

      // Tạo formData
      const formData = new FormData();
      formData.append("name", name);
      formData.append("parent", parent);
      formData.append("slug", slug);
      formData.append("status", status);
      formData.append("avatar", avatar);
      formData.append("description", description);

      fetch(`/${pathAdmin}/article/category/create`, {
        method: "POST",
        body: formData
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
    });
}

// button generate slug 
const buttonGenerateSlug = document.querySelector("[btn-generate-slug]")
if(buttonGenerateSlug){
  buttonGenerateSlug.addEventListener("click", () => {
      const modelCategory = buttonGenerateSlug.getAttribute("model")
      const fromCategory = buttonGenerateSlug.getAttribute("from")
      const toCategory = buttonGenerateSlug.getAttribute("to")
      const valueCategory = document.querySelector(`[name='${fromCategory}']`).value

      const dataFinal = {
        string: valueCategory,
        model: modelCategory,
      }
      fetch(`/${pathAdmin}/helper/generate-slug`, {
        method: "POST",
        headers:{
            "Content-Type": "application/json"
        },
        body: JSON.stringify(dataFinal)

      })
      .then(res => res.json())
      .then(data => {
        if(data.code == "success"){
          document.querySelector(`[name="${toCategory}"]`).value = data.slug
        }
        if(data.code == "error"){
          notyf.error(data.message);
        }
      })

  })
}

// articleEditCategoryForm
const articleEditCategoryForm = document.querySelector("#articleEditCategoryForm");
if(articleEditCategoryForm) {
  const validator = new JustValidate('#articleEditCategoryForm');

  validator
    .addField('#name', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập tên danh mục!',
      },
    ])
    .addField('#slug', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập đường dẫn!',
      },
    ])
    .onSuccess((event) => {
      const id = event.target.id.value
      const name = event.target.name.value;
      const parent = event.target.parent.value;
      const description = tinymce.get("description").getContent();
      const status = event.target.status.value;
      const avatar = event.target.avatar.value;
      const slug = event.target.slug.value;

      // Tạo formData
      const formData = new FormData();
      formData.append("name", name);
      formData.append("parent", parent);
      formData.append("slug", slug);
      formData.append("status", status);
      formData.append("description", description);
      formData.append("avatar", avatar);

      fetch(`/${pathAdmin}/article/category/edit/${id}`, {
        method: "PATCH",
        body: formData
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
    });
}

// btnDeleted
const listButtonApi = document.querySelectorAll("[btn-deleted]");
if(listButtonApi.length > 0) {
  listButtonApi.forEach(button => {
    button.addEventListener("click", () => {
      const method = button.getAttribute("method");
      const api = button.getAttribute("api");

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

// FormSearch 
const formSearch = document.querySelector("[form-search]")
if(formSearch){
  const url = new URL(window.location.href)
  formSearch.addEventListener("submit", (event) => {
    const value = event.target.keyword.value;
    if(value){
      url.searchParams.set("keyword", value)
    }else {
      url.searchParams.delete("keyword")
    }
    window.location.href = url.href;
  })
  const valueCurrent = url.searchParams.get("keyword")
  if(valueCurrent){
    formSearch.keyword.value = valueCurrent
  }
}

// pagination
const pagination = document.querySelector("[pagination]");
if(pagination) {
  const url = new URL(window.location.href);

  pagination.addEventListener("change", () => {
    const value = pagination.value;
    if(value) {
      url.searchParams.set("page", value);
    } else {
      url.searchParams.delete("page");
    }
    window.location.href = url.href;
  })

  // Hiển thị giá trị mặc định
  const valueCurrent = url.searchParams.get("page");
  if(valueCurrent) {
    pagination.value = valueCurrent;
  }
}
// End pagination

// button-copy
const listButtonCopy = document.querySelectorAll("[btn-copy]");
if(listButtonCopy.length > 0) {
  listButtonCopy.forEach(button => {
    button.addEventListener("click", () => {
      const content = button.getAttribute("data-content");
      window.navigator.clipboard.writeText(content);
      notyf.success("Đã copy!");
    })
  })
}
// End button-copy

// Modal Review file
const modalPreviewFile = document.querySelector("#reviewFile")
if(modalPreviewFile){
  const btnPreviewFile = document.querySelectorAll("[btn-review]")
  const Preview = document.querySelector("[preview]")

  // muốn biết đang click vào ảnh nào
  let buttonClick = null;
  btnPreviewFile.forEach(button => {
    button.addEventListener("click", () =>{
      buttonClick = button
    })
  })

  modalPreviewFile.addEventListener("shown.bs.modal", (event) => {
    const data = buttonClick.getAttribute("data-content")
    const mimetype =buttonClick.getAttribute("mimetype");
    if(mimetype.includes("image")){
      Preview.innerHTML = `
          <img src="${data}" width="100%" />`
    }

    else if(mimetype.includes("audio")) {
      Preview.innerHTML = `
        <audio controls>
          <source src="${file}" />
        </audio>
      `;
    }
    else if(mimetype.includes("video")) {
      Preview.innerHTML = `
        <video controls width="100%">
          <source src="${file}" />
        </video>
      `;
    }
    else if(mimetype.includes("application/pdf")) {
      Preview.innerHTML = `
        <iframe src="${file}" width="100%" height="600px"></iframe>
      `;
    }

  })

  modalPreviewFile.addEventListener("hidden.bs.modal", (event) => {
    buttonClick = null;
    Preview.innerHTML = "";
  })
}
// End Modal Review file

// Modal Rename file
const modalRenameFile = document.querySelector("#renameFile")
if(modalRenameFile){
  const form = modalRenameFile.querySelector("form")

  let buttonClick = null;
  const listButtonRename = document.querySelectorAll("[btn-rename]")
  listButtonRename.forEach(button => {
    button.addEventListener("click", () => {
      buttonClick = button
    })
  })

  modalRenameFile.addEventListener("shown.bs.modal", (event) => {
    // Hiển thị tên mặc định vào ô input
    const idFile = buttonClick.getAttribute("id-file")
    const filename = buttonClick.getAttribute("filename")
    form.fileId.value = idFile;
    form.fileName.value = filename;

  })

  modalRenameFile.addEventListener("hidden.bs.modal", (event) => {
    buttonClick = null;
    form.fileId.value = "";
    form.fileName.value = "";

  })
  // Submit form
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const valueId = event.target.fileId.value;
    const valueFileName = event.target.fileName.value;

    if(valueId && valueFileName) {
      // Tạo formData
      const formData = new FormData();
      formData.append("fileName", valueFileName);

      fetch(`/${pathAdmin}/file-manager/change-file-name/${valueId}`, {
        method: "PATCH",
        body: formData
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
      }

  })

}
// End Modal Rename file

// Deleted File
const buttonDeleteFile = document.querySelectorAll("[btn-delete]")
if(buttonDeleteFile){
  buttonDeleteFile.forEach(button => {
    button.addEventListener("click", (event) => {
      const valueId = button.getAttribute("id-file")
      const valuefile = button.getAttribute("filename")

      const isConfirm = confirm(`Bạn có chắc muốn xóa file: ${valuefile}`);
      if(isConfirm){
        fetch(`/${pathAdmin}/file-manager/delete-file/${valueId}`, {
          method: "DELETE"
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
      }
    })
  })
}
// End Deleted File

// Tạo folder
const formCreateFolder = document.querySelector("[form-create-folder]")
if(formCreateFolder){
  formCreateFolder.addEventListener("submit", (event) => {
    event.preventDefault();
    const valueFolder = event.target.folderName.value

    if(!valueFolder) {
      notyf.error("Vui lòng nhập tên folder");
      return;
    }

    const formData = new FormData();
    formData.append("valueFolder", valueFolder)
    const urlCurrent = new URLSearchParams(window.location.search)
    const folderCurrent = urlCurrent.get("folderPath")
    if(folderCurrent){
      formData.append("folderCurrent", folderCurrent)
    }

    fetch(`/${pathAdmin}/file-manager/folder/create`, {
      method: "POST",
      body: formData
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
}
// End Tạo folder

// btn-to-folder
const btnToFolder = document.querySelectorAll("[btn-to-folder]")
if(btnToFolder){
  const url = new URL(window.location.href)
  btnToFolder.forEach(button => {
    button.addEventListener("click", (event) => {
      let value = button.getAttribute("name-folder")
      if(value){
        const urlCurrent = new URLSearchParams(window.location.search)
        const folderCurrent = urlCurrent.get("folderPath")
        if(folderCurrent){
          value = `${folderCurrent}/${value}`
        }
        url.searchParams.set("folderPath", value)
      }else {
        url.searchParams.delete("folderPath")
      }
        window.location.href  = url.href
    })
  })

}
//end btn-to-folder

// Breadcumb folder 
const breadcumbFolder = document.querySelector("[breadcumb-folder]")
if(breadcumbFolder){
  const url = new URLSearchParams(window.location.search)
  const folderPath =url.get("folderPath") || ""
  const listFolder = folderPath.split("/") || []

  let html = `
  <li class="list-group-item bg-white">
    <a href="/${pathAdmin}/file-manager">
      <i class="la la-angle-double-right text-info me-2">
      </i>Media
    </a>
  </li>`
  let path = ""
  listFolder.forEach((item, index) => {
    path += (index > 0? "/" : "") + `${item}` 
    html += `
      <li class="list-group-item bg-white">
        <a href="/${pathAdmin}/file-manager?folderPath=${path}">
          <i class="la la-angle-double-right text-info me-2">
          </i> ${item}
        </a>
      </li>`
  })
  breadcumbFolder.innerHTML = html;
}
// End Breadcumb folder 

// Delete Folder 
const btnDeleteFolder = document.querySelectorAll("[btn-delete-folder]")
if(btnDeleteFolder){
  btnDeleteFolder.forEach(button => {
    button.addEventListener("click", () => {
      const nameFolder = button.getAttribute("name-folder")
      // Gửi kèm thư mục đang đứng để xóa
      const url = new URLSearchParams(window.location.search)
      const folderPath = url.get("folderPath");
      let folderFinal = "/media"
      if(folderPath){
        folderFinal += `/${folderPath}`
      }
      if(nameFolder){
        folderFinal += `/${nameFolder}`
      }
      const isConfirm = confirm(`Bạn có chắc muốn xóa folder: ${nameFolder}? Hành động này sẽ không thể khôi phục.`);
      if(isConfirm) {
        fetch(`/${pathAdmin}/file-manager/folder/delete?folderPath=${folderFinal}`, {
          method: "DELETE"
        })
          .then(res => res.json())
          .then(data => {
            if(data.code == "error") {
              notyf.error(data.message);
            }

            if(data.code == "success") {
              drawNotify("success", data.message);
              location.reload();
            }
          })
        }
    })
  })
}
// End Delete Folder
// Form Group File
const formGroupFile = document.querySelector("[form-group-file]");
if(formGroupFile) {
  const inputFile = formGroupFile.querySelector("[input-file]");
  const previewFile = formGroupFile.querySelector("[preview-file]");

  inputFile.addEventListener("input", () => {
    const value = inputFile.value;
    previewFile.querySelector("img").src = `${domainCDN}${value}`;
  })

  // Hiển thị mặc định
  if(inputFile.value) {
    const value = inputFile.value;
    previewFile.querySelector("img").src = `${domainCDN}${value}`;
  }
}
// End Form Group File
// Article Create Form
const articleCreateForm = document.querySelector("#articleCreateForm");
if(articleCreateForm) {
  const validation = new JustValidate('#articleCreateForm');

  validation
    .addField('#name', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập tên bài viết!'
      }
    ])
    .addField('#slug', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập đường dẫn!'
      }
    ])
    .onSuccess((event) => {
      const name = event.target.name.value;
      const slug = event.target.slug.value;
      const category = getCheckboxList("category");
      const status = event.target.status.value;
      const avatar = event.target.avatar.value;
      const description = tinymce.get("description").getContent();
      const content = tinymce.get("content").getContent();

      // Tạo FormData
      const formData = new FormData();
      formData.append("name", name);
      formData.append("slug", slug);
      formData.append("category", JSON.stringify(category));
      formData.append("status", status);
      formData.append("avatar", avatar);
      formData.append("description", description);
      formData.append("content", content);
      
      fetch(`/${pathAdmin}/article/create`, {
        method: "POST",
        body: formData
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
  ;
}
// End Article Create Form

// Article Edit Form
const articleEditForm = document.querySelector("#articleEditForm");
if(articleEditForm) {
  const validation = new JustValidate('#articleEditForm');

  validation
    .addField('#name', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập tên bài viết!'
      }
    ])
    .addField('#slug', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập đường dẫn!'
      }
    ])
    .onSuccess((event) => {
      const id = event.target.id.value;
      const name = event.target.name.value;
      const slug = event.target.slug.value;
      const category = getCheckboxList("category");
      const status = event.target.status.value;
      const avatar = event.target.avatar.value;
      const description = tinymce.get("description").getContent();
      const content = tinymce.get("content").getContent();

      // Tạo FormData
      const formData = new FormData();
      formData.append("name", name);
      formData.append("slug", slug);
      formData.append("category", JSON.stringify(category));
      formData.append("status", status);
      formData.append("avatar", avatar);
      formData.append("description", description);
      formData.append("content", content);
      
      fetch(`/${pathAdmin}/article/edit/${id}`, {
        method: "PATCH",
        body: formData
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
  ;
}
// End Article edit Form

// Role Create Form
const roleCreateForm = document.querySelector("#roleCreateForm");
if(roleCreateForm) {
  const validation = new JustValidate('#roleCreateForm');

  validation
    .addField('#name', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập tên nhóm quyền!'
      }
    ])
    .onSuccess((event) => {
      const name = event.target.name.value;
      const description = event.target.description.value;
      const permissions = getCheckboxList("permissions");
      const status = event.target.status.value;

      // Tạo FormData
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("permissions", JSON.stringify(permissions));
      formData.append("status", status);
      
      fetch(`/${pathAdmin}/role/create`, {
        method: "POST",
        body: formData
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
  ;
}

// End Role Create Form