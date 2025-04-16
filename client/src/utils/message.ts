import {
  postApiV1Message,
  getApiV1ChatByIdMessageschat,
} from "../generated/api";
import { Message } from "../MainPage";

export const createMessage = async (
  chatId: string,
  text: string,
  token: string
): Promise<boolean> => {
  if (!token) return false;
  if (!chatId) {
    console.error("Chat ID is required");
    return false;
  }

  try {
    const res = await postApiV1Message({
      body: {
        chatId: chatId,
        text: text,
      } as any,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.data) {
      console.error("Error creating message:", res);
      return false;
    }

    console.log("Message created: ", res);
    return true;
  } catch (err) {
    console.error("Error creating message:", err);
    return false;
  }
};

export const getMessagesByChatId = async (
  chatId: string,
  token: string
): Promise<Message[] | null> => {
  if (!token) return null;

  try {
    const res = await getApiV1ChatByIdMessageschat({
      headers: {
        Authorization: `Bearer ${token}`,
      },
      path: {
        id: chatId,
      },
    });

    if (!res.data) {
      console.error("Error getting messages:", res);
      return null;
    }

    console.log("Got messages: ", res);
    const messages: Message[] = [];
    const data: any = res.data;
    for (const message of data) {
      messages.push({
        username: message.senderId,
        message: message.text,
        read: false,
      });
    }
    console.log("Product:");
    console.log(messages);
    return messages;
  } catch (err) {
    console.error("Error getting messages:", err);
    return null;
  }
};
