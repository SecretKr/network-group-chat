import { Icon } from "@iconify/react";
import { OpenChat, socket } from "../MainPage";
import { use, useEffect, useState } from "react";

interface AllGroupModalProps {
  onClose: () => void;
}

export function AllGroupModal({ onClose }: AllGroupModalProps) {
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
          {allOpenChatList.map((openChat) => (
            <li
              key={openChat.chatId}
              // onClick={() => setUserToChat(user.uid_name)}
              className={`cursor-pointer p-2 pl-4 flex h-12 justify-between items-center transition bg-white hover:bg-hover`}
            >
              <div className="flex items-center gap-2">
                {/* <span
                    className={`w-2 h-2 rounded-full ${
                      user.online ? "bg-green-500" : "bg-gray-400"
                    }`}
                  ></span> */}
                <p>
                  {openChat.chatName}
                  {/* {openChat.split(":")[1]} */}
                </p>
              </div>
              {/* {getUnreadCount(user.uid_name) > 0 && (
                  <div className="p-2 bg-primary text-white h-8 flex items-center w-8 justify-center rounded-full font-semibold">
                    <p className="">{getUnreadCount(user.uid_name)}</p>
                  </div>
                )} */}
            </li>
          ))}
        </ul>
        {/* <button
          className="w-full bg-primary text-white font-semibold p-2 rounded-md hover:bg-primary-dark transition"
          onClick={handleCreateGroup}
        >
          Create
        </button> */}
      </div>
    </div>
  );
}
