import { Request, Response } from 'express';
import ChatRoom from '../../models/chat-room.model';
import AccountUser from '../../models/account-user.model';
import ChatMessage from '../../models/chat-message.model';
import { timeAgo } from '../../helpers/format.helper';
import { getChatRoomList } from '../../helpers/chat.helper';
import FormData from 'form-data';
import axios from 'axios';
import { domainCDN } from '../../configs/variable.config';

export const myChatList = async (req: Request, res: Response) => {
  // Danh sách phòng chat
   const chatRoomList: any = await getChatRoomList(res.locals.accountAdmin.id);

  res.render("admin/pages/my-chat-list", {
    pageTitle: "Danh sách tin nhắn của bạn",
    chatRoomList: chatRoomList
  });
}
export const detail = async (req: Request, res: Response) => {
  try {
    // Chi tiết phòng chat
    const id = req.params.id;
    const chatRoomDetail = await ChatRoom.findOne({
      _id: id
    });

    if(!chatRoomDetail) {
      res.redirect('/admin/dashboard');
      return;
    }

    // Thông tin người dùng
    const infoUser = await AccountUser.findOne({
      _id: chatRoomDetail.userId
    });

    if(!infoUser) {
      res.redirect('/admin/dashboard');
      return;
    }

    // Danh sách tin nhắn
    const chatMessages: any = await ChatMessage.find({
      roomId: id
    });

    for (const item of chatMessages) {
      item.createdAtFormat = timeAgo(item.createdAt);
    }
    // Cập nhật số tin nhắn chưa đọc = 0
    await ChatRoom.updateOne({
      _id: id
    }, {
      "unreadCount.admin": 0
    });

    // Danh sách phòng chat
    const chatRoomList: any = await getChatRoomList(res.locals.accountAdmin.id);

  
    res.render("admin/pages/chat-detail", {
      pageTitle: "Chi tiết tin nhắn",
      chatRoomList: chatRoomList,
      chatRoomDetail: chatRoomDetail,
      infoUser: infoUser,
      chatMessages: chatMessages
    });
  } catch (error) {
    res.redirect('/admin/dashboard');
  }
}
export const messages = async (req: Request, res: Response) => {
  const adminId = res.locals.accountAdmin.id;
  const { limit = 20, roomId, lastMessageId } = req.query;

  if(!adminId) {
    res.json({
      code: "error",
      message: "Thất bại!"
    })
    return;
  }

  // Lấy thông tin phòng chat
  const chatRoom = await ChatRoom.findOne({
    adminId: adminId,
    _id: roomId
  });

  if(!chatRoom) {
    res.json({
      code: "error",
      message: "Thất bại!"
    })
    return;
  }

  // Danh sách tin nhắn
  const find: any = {
    roomId: chatRoom?.id
  };

  if(lastMessageId) {
    find._id = {
      $lt: lastMessageId
    };
  }

  const chatMessages: any = await ChatMessage
    .find(find)
    .sort({
      createdAt: "desc" // mới nhất trước
    })
    .limit(parseInt(`${limit}`))
    .lean();

  for (const item of chatMessages) {
    item.createdAtFormat = timeAgo(item.createdAt);
  }
  
  res.json({
    code: "success",
    message: "Thành công!",
    messages: lastMessageId ? chatMessages : chatMessages.reverse()
  })
}
export const uploadPost = async (req: Request, res: Response) => {
  try {
    const adminId = res.locals.accountAdmin.id;
    const roomId = req.body.roomId;
    const files = req.files as Express.Multer.File[];

    if(!files || !files.length) {
      res.json({
        code: "error",
        message: "Vui lòng gửi kèm file!"
      })
      return;
    }

    const chatRoomDetail = await ChatRoom.findOne({
      adminId: adminId,
      _id: roomId
    });

    if(!chatRoomDetail) {
      res.json({
        code: "error",
        message: "Không tìm thấy phòng chat!"
      })
      return;
    }

    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype
      });
    })
    formData.append('folderPath', `chats/${chatRoomDetail.userId}`);

    const response = await axios.post(`${domainCDN}/file-manager/upload`, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${process.env.FILE_MANAGER_SECRET}`
      } // cần thiết để gửi đúng multipart/form-data
    });

    if(response.data.code == "error") {
      res.json({
        code: "error",
        message: "Lỗi upload!"
      })
      return;
    }
    
    const saveLink = response.data.saveLink;
    const fileUrls = saveLink.map((item: any) => `${item.folder}/${item.filename}`);
    res.json({
      code: "success",
      message: "Upload thành công!",
      fileUrls: fileUrls
    });
  } catch (error) {
    console.error(error);
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ!"
    })
  }
}
export const changeStatusPatch = async (req: Request, res: Response) => {
  try {
    const adminId = res.locals.accountAdmin.id;
    const { roomId, status } = req.body;

    const chatRoomDetail = await ChatRoom.findOne({
      adminId: adminId,
      _id: roomId
    });

    if(!chatRoomDetail) {
      res.json({
        code: "error",
        message: "Không tìm thấy phòng chat!"
      })
      return;
    }

    await ChatRoom.updateOne({
      _id: roomId
    }, {
      status: status
    })
    
    res.json({
      code: "success",
      message: "Đã đổi trạng thái!"
    });
  } catch (error) {
    console.error(error);
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ!"
    })
  }
}
