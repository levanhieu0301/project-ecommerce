
// Khởi tạo socketIO
const socket = io();


// logic gửi tin nhắn bên admin
const formChat = document.querySelector("[form-chat]")
if(formChat){
  const inputContent = formChat.querySelector("[input-content]");
  const buttonSend = formChat.querySelector("[button-send]");
  buttonSend.addEventListener("click", () => {
    const content = inputContent.value.trim()
    if(content){
      socket.emit("CLIENT_SEND_MESSAGE", {
        content: content
      });
      inputContent.value = "";
    }
  })
  // Nhận tin nhắn từ server - lắng nghe từ sever
  socket.on("SERVER_SEND_MESSAGE", (data) => {
    console.log(data);
  });
}