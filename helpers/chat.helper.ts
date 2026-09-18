import AccountUser from "../models/account-user.model";
import ChatMessage from "../models/chat-message.model";
import ChatRoom from "../models/chat-room.model";
import { timeAgo } from "./format.helper";

export const getChatRoomList = async (adminId: string) => {
   const chatRoomList: any = await ChatRoom.find({
    adminId: adminId
  })
  // Lấy ra thông tin người dùng
  for (const item of chatRoomList) {
    // Thông tin
    const infoAccount = await AccountUser.findOne({
      _id: item.userId
    })
    item.infoUser = {
      fullName: infoAccount?.fullName,
      avatar: infoAccount?.avatar
    };
    // Tin nhắn gần nhất
    const lastMessage: any = await ChatMessage
      .findOne({
        roomId: item.id
      })
      .sort({
        createdAt: "desc"
      })
    if(lastMessage){
      item.lastMessage = lastMessage
      item.lastMessage.createdAtFormat = timeAgo(item.lastMessage.createdAt);
    }

  }

  return chatRoomList;
}
