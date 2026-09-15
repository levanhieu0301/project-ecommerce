import { NextFunction, Request, Response } from "express";
import AccountUser from "../../models/account-user.model";
import ChatRoom from "../../models/chat-room.model";
import ChatMessage from "../../models/chat-message.model";
import { timeAgo } from "../../helpers/format.helper";


export const getChatMessage = async (req: Request, res: Response, next: NextFunction) => {
  if(res.locals.accountUser){
    // Lấy ra thông tin phòng chat
    const chatRoom: any= await ChatRoom.findOne({
      userId: res.locals.accountUser.id 
    })
    // Lấy ra tin nhắn phòng chat
    const chatMessages: any = await ChatMessage.find({
      roomId: chatRoom.id
    })
    for (const item of chatMessages) {
      item.createdAtFormat = timeAgo(item.createdAt);
    }
    res.locals.chatMessages = chatMessages;
  }
  next();
}