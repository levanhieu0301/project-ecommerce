
// Khởi tạo socketIO
const socket = io();

// Nhận tin nhắn từ server - lắng nghe từ sever
socket.on("SERVER_SEND_MESSAGE", (data) => {
  console.log(data);
});
