import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { getGroupMemberById } from "../utils/groupChat";
import { useAuth } from "../auth/AuthContext";
import { User } from "../utils/privateChat";
import { useChat } from "../utils/ChatContext";

interface AllGroupMemberProps {
  onClose: () => void;
}

export function AllGroupMember({ onClose }: AllGroupMemberProps) {
  const [allMemberList, setAllMemberList] = useState<User[]>([]);
  const [owner, setOwner] = useState<string>("");
  const { uid, token } = useAuth();
  const { chatId, handleLeaveChat } = useChat();

  useEffect(() => {
    const fetchChatMembers = async () => {
      const res = await getGroupMemberById(chatId, token);
      setOwner(res?.groupOwner || "");
      const members: User[] = res?.users || [];
      members.sort((a, b) => a.nickname.localeCompare(b.nickname));
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
        <h2 className="text-xl font-bold">Members</h2>
        {allMemberList !== null ? (
          <ul className="rounded-lg overflow-hidden divide-y divide-hover">
            {allMemberList.map((member) => (
              <li
                key={member._id}
                className={`cursor-pointer p-2 pl-4 flex h-12 justify-between items-center transition bg-white`}
              >
                <div className="flex items-center gap-2">
                  <p>
                    {member.nickname} {member._id === uid && "(Me)"}
                  </p>
                </div>
                <p className="text-gray-400">
                  {member._id === owner && "Owner"}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="rounded-lg overflow-hidden divide-y divide-hover"></ul>
        )}
        <button
          className="bg-red-500 text-white font-semibold p-2 rounded-md hover:bg-red-600 transition"
          onClick={() => {
            handleLeaveChat();
            onClose();
          }}
        >
          {owner === uid ? "Delete Group" : "Leave Group"}
        </button>
      </div>
    </div>
  );
}
