import { getApiV1ChatById, putApiV1ChatByIdLeave } from "../generated/api";
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
};export const leaveOpenChat = async (chatId: string, token: string): Promise<any> => {
    const error_res = "Failed to leave the group chat"; // Default error response

    if (!chatId || !token) {
        console.error("Missing chatId or token");
        return error_res;
    }

    try {
        console.log("Attempting to leave chat with ID:", chatId);

        // Send request to leave chat
        const res = await fetch(`/api/v1/chat/${chatId}/leave`, {
            method: "PUT", // Assuming PUT method
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        // Check for non-JSON responses (e.g., HTML error page)
        if (!res.ok) {
            const errorText = await res.text(); // Get the raw response text
            console.error(`Error response: ${errorText}`);
            return error_res;
        }

        // Try parsing the JSON response
        try {
            const data = await res.json(); // Parse the JSON response
            console.log("Successfully left group chat:", data);
            return data;
        } catch (jsonError) {
            console.error("Failed to parse JSON response:", jsonError);
            return error_res;
        }

    } catch (err: unknown) {
        if (err instanceof Error) {
            // Handle the error as an instance of Error
            console.error("Error leaving group chat:", err);

            if (err.message === "Failed to fetch") {
                console.error("Network error: Failed to fetch. Check your network connection or CORS issues.");
            }

            alert(`Failed to leave the group. Error: ${err.message}`);
        } else {
            // Handle the case where the error is not an instance of Error
            console.error("Unknown error:", err);
        }

        return error_res;
    }
};
