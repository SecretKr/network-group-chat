import { Icon } from "@iconify/react";
import { socket } from "../MainPage";
import { useEffect, useState } from "react";
import { OpenChat, useChat } from "../utils/ChatContext";
import { SearchInput } from "./SearchInput";

interface AllGroupModalProps {
  onClose: () => void;
}

export function AllGroupModal({ onClose }: AllGroupModalProps) {
  const { myOpenChatList } = useChat();
  const [allOpenChatList, setAllOpenChatList] = useState<OpenChat[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

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
    (chat) =>
      !joinedChatIds.has(chat.chatId) &&
      chat.chatName.toLowerCase().includes(searchQuery.toLowerCase())
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
        className="bg-background p-4 rounded-lg shadow-lg relative flex flex-col gap-4 w-[90%] max-w-md max-h-[90%] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4">
          <Icon
            icon="material-symbols:close-rounded"
            className="text-gray-500 size-6"
          />
        </button>
        <h2 className="text-xl font-bold">OpenChats</h2>
        <SearchInput
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <ul className="rounded-lg overflow-hidden divide-y divide-hover max-h-80 overflow-y-auto">
          {filteredChatList.map((openChat) => (
            <li
              key={openChat.chatId}
              className="cursor-pointer p-2 pl-4 flex h-12 justify-between items-center transition bg-white hover:bg-hover"
              onClick={() => handleJoinGroup(openChat.chatId)}
            >
              <div className="flex items-center gap-2">
                <p>{openChat.chatName}</p>
              </div>
              <button className="w-16 bg-primary text-white font-semibold p-1.5 rounded-md hover:bg-primary-dark transition">
                Join
              </button>
            </li>
          ))}
          {filteredChatList.length === 0 && (
            <li className="text-center text-gray-500 py-4">No results found</li>
          )}
        </ul>
      </div>
    </div>
  );
}
