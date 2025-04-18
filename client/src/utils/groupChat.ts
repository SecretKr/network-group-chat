import { getApiV1ChatById } from "../generated/api";
import { User, Chat } from "../utils/privateChat";

export const getGroupMemberById = async (
    chatId: string,
    token: string
): Promise<User[]> => {
    const error_res: User[] = [];

    if (!token) return error_res;

    try {
        console.log("Getting chat...");
        const res = await getApiV1ChatById({
            path: {
                id: chatId,
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (res.response.status === 404) {
        return error_res;
        }

        if (!res.data) {
        console.error("Error getting chat:", res);
        return error_res;
        }

        const data: any = res.data;
        var chat: Chat;
        chat = ({
            chatName: data.chatName,
            createdAt: data.createdAt,
            isGroupChat: data.isGroupChat,
            users: data.users,
            __v: data.__v,
            _id: data._id,
        });

        const users: User[] = [];
        for (const user of chat.users) {
            users.push({
                _id: user._id,
                nickname: user.nickname,
                username: user.username,
            });
        }

        return users;
    } catch (err) {
        console.error("Error getting chat:", err);
        return error_res;
    }
};
