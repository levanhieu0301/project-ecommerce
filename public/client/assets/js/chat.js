
// Khởi tạo socketIO
const socket = io();

const chatButton = document.querySelector("#chat-button");
const chatPopup = document.querySelector("#chat-popup");
const chatClose = document.querySelector("#chat-close");

// Đóng/mở chat
chatButton.addEventListener("click", () => {
  chatPopup.classList.toggle("hidden");
});

// Đóng chat
chatClose.addEventListener("click", () => {
  chatPopup.classList.add("hidden");
});
// Gửi tin nhắn lên server
const chatSend = document.querySelector('#chat-send');
const chatInput = document.querySelector('#chat-input');

chatSend.addEventListener('click', (event) => {
  const content = chatInput.value.trim();
  if (content) {
    socket.emit("CLIENT_SEND_MESSAGE", {
      content: content
    });
    chatInput.value = "";
  }
});
// Nhận tin nhắn từ server - lắng nghe từ sever
socket.on("SERVER_SEND_MESSAGE", (data) => {
  console.log(data);
});
