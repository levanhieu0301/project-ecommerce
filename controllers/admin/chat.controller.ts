import { Request, Response } from 'express';
import ChatMessage from '../../models/chat-message.model';
import ChatRoom from '../../models/chat-room.model';
import AccountUser from '../../models/account-user.model';
import { timeAgo } from '../../helpers/format.helper';

export const myChatList = async (req: Request, res: Response) => {
  const chatRoomList: any = await ChatRoom.find({
    adminId:  res.locals.accountAdmin.id
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
  res.render("admin/pages/my-chat-list", {
    pageTitle: "Danh sách tin nhắn của bạn",
    chatRoomList: chatRoomList
  });
}
