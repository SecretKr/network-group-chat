import { postApiV1Chat, getApiV1Chat } from "../generated/api";

export interface User {
  _id: string;
  nickname: string;
  username: string;
}

export interface Chat {
  chatName: string;
  createdAt: string;
  isGroupChat: boolean;
  users: User[];
  __v: number;
  _id: string;
}

export const createPrivateChat = async (user: string, token: string): Promise<boolean> => {
  const userId = user.split(":")[0];

  if (!token || !user) return false;

  try {
    const res = await postApiV1Chat({
      body: {
        userId: userId,
      } as any,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.data) {
      console.error("Error creating chat:", res);
      return false;
    }

    console.log("Chat created: ", res);
    return true;
  } catch (err) {
    console.error("Error creating chat:", err);
    return false;
  }
};

export const getPrivateChats = async (token: string): Promise<Chat[] | null> => {
  if (!token) return null;

  try {
    const res = await getApiV1Chat({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.data) {
      console.error("Error getting chats:", res);
      return null;
    }

    console.log("Got chats: ", res);
    const chats: Chat[] = [];
    const data: any = res.data;
    for (const chat of data) {
      chats.push({
        chatName: chat.chatName,
        createdAt: chat.createdAt,
        isGroupChat: chat.isGroupChat,
        users: chat.users,
        __v: chat.__v,
        _id: chat._id,
      });
    }
    return chats;
  } catch (err) {
    console.error("Error getting chats:", err);
    return null;
  }
};
