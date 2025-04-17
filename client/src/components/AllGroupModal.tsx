import { Icon } from "@iconify/react";
import { OpenChat, socket } from "../MainPage";
import { use, useEffect, useState } from "react";

interface AllGroupModalProps {
  onClose: () => void;
  myOpenChatList: OpenChat[];
}

export function AllGroupModal({ onClose, myOpenChatList }: AllGroupModalProps) {
  const [allOpenChatList, setAllOpenChatList] = useState<OpenChat[]>([]);

  useEffect(() => {
    socket.emit("getOpenChats");
  }, []);

  useEffect(() => {
    socket.on("openChatList", (openChatList: OpenChat[]) => {
      console.log("Received open chat list:", openChatList);
      setAllOpenChatList(openChatList);
    });
  }, []);

  const joinedChatIds = new Set(myOpenChatList.map((chat) => chat.chatId));
  const filteredChatList = allOpenChatList.filter(
    (chat) => !joinedChatIds.has(chat.chatId)
  );

  const handleJoinGroup = (chatId: string) => {
    socket.emit("joinGroupChat", { chatId });
    onClose();
  };

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
        <h2 className="text-xl font-bold">OpenChats</h2>
        <ul className="rounded-lg overflow-hidden divide-y divide-hover">
          {filteredChatList.map((openChat) => (
            <li
              key={openChat.chatId}
              className={`cursor-pointer p-2 pl-4 flex h-12 justify-between items-center transition bg-white hover:bg-hover`}
              onClick={() => handleJoinGroup(openChat.chatId)}
            >
              <div className="flex items-center gap-2">
                <p>{openChat.chatName}</p>
              </div>
              <button className="w-16 bg-primary text-white font-semibold p-2 rounded-md hover:bg-primary-dark transition">
                Join
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
