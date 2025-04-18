import { Icon } from "@iconify/react";
// import { OpenChat, socket } from "../MainPage";
import { useEffect, useState } from "react";
import { getGroupMemberById } from "../utils/groupChat";

interface AllGroupMemberProps {
    onClose: () => void;
    chatId: string;
    token: string;
}

export function AllGroupMember({ onClose, chatId, token }: AllGroupMemberProps) {
    const [allMemberList, setAllMemberList] = useState<string[]>([]);

    useEffect(() => {
        const fetchChatMembers = async () => {
            const res = await getGroupMemberById(chatId, token);
            const members: string[] = [];
            res?.forEach((member) => {
                members.push(member.nickname);
            });
            members.sort();
            setAllMemberList(members);
        };
        fetchChatMembers();
    }, [chatId, token]);

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="bg-background p-4 rounded-lg shadow-lg relative flex flex-col gap-4 w-[90%] max-w-md"
                onClick={(e) => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4">
                    <Icon
                        icon="material-symbols:close-rounded"
                        className="text-gray-500 size-6"
                    />
                </button>
                <h2 className="text-xl font-bold">All Group Members</h2>
                {(allMemberList !== null)? (
                    <ul className="rounded-lg overflow-hidden divide-y divide-hover">
                        {allMemberList.map((member) => (
                            <li
                                className={`cursor-pointer p-2 pl-4 flex h-12 justify-between items-center transition bg-white hover:bg-hover`}
                            >
                                <div className="flex items-center gap-2">
                                    <p>{member}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <ul className="rounded-lg overflow-hidden divide-y divide-hover"></ul>
                )}
            </div>
        </div>
    );
}
