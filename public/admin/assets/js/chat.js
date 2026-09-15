
// Khởi tạo socketIO
const socket = io();


// logic gửi tin nhắn bên admin
const formChat = document.querySelector("[form-chat]")
if(formChat){
  const inputContent = formChat.querySelector("[input-content]");
  const buttonSend = formChat.querySelector("[button-send]");
  const chatRoomId = document.querySelector(".chat-box-right").getAttribute("chat-room-id")
  const chatDetail = document.querySelector(".chat-detail")
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
    // Kiểm tra đúng phòng chat không
    if(chatRoomId == data.roomId){
      const elementMessage = document.createElement("div");
       if(data.senderRole === 'user') {
        elementMessage.classList.add("d-flex");
      } else {
        elementMessage.classList.add("d-flex", "flex-row-reverse");
      }
      elementMessage.innerHTML = `
        <div class="chat-box w-100 ${data.senderRole === 'user' ? '' : 'reverse'}">
          <div class="user-chat">
            <p>${data.content}</p>
          </div>
        </div>
      `;
      chatDetail.appendChild(elementMessage)
    }
  });
}