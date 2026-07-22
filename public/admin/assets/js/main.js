// Khởi tạo TinyMCE
const initialTinyMCE = () => {
  tinymce.init({
    selector: '[textarea-mce]',
    plugins: [
      'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 'link', 'lists', 'media', 'searchreplace', 'table', 'visualblocks', 'wordcount', 'checklist', 'mediaembed', 'casechange', 'formatpainter', 'pageembed', 'a11ychecker', 'tinymcespellchecker', 'permanentpen', 'powerpaste', 'advtable', 'advcode', 'advtemplate', 'uploadcare', 'mentions', 'tableofcontents', 'footnotes', 'mergetags', 'autocorrect', 'typography', 'inlinecss', 'markdown','importword', 'exportword', 'exportpdf'
    ],
    toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography uploadcare | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
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

      // Tạo formData
      const formData = new FormData();
      formData.append("name", name);
      formData.append("parent", parent);
      formData.append("slug", slug);
      formData.append("status", status);
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