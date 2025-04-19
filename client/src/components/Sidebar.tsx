import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { OpenChat, UserWithStatus } from "../MainPage";
import { cn } from "../utils/utils";

interface SidebarProps {
  userList: UserWithStatus[];
  openChatList: OpenChat[];
  username: string;
  setUserToChat: (user: string) => void;
  setGroupToChat: (group: string) => void;
  userToChat: string;
  setChatId: (id: string) => void;
  chatId: string;
  getUnreadCount: (user: string) => number;
  showAllGroupModal: () => void;
  showCreateGroupModal: () => void;
}

export function Sidebar({
  userList,
  openChatList,
  username,
  setUserToChat,
  setGroupToChat,
  userToChat,
  setChatId,
  chatId,
  getUnreadCount,
  showAllGroupModal,
  showCreateGroupModal,
}: SidebarProps) {
  const { logout } = useAuth();
  const [showAllUsers, setShowAllUsers] = useState(false);
  const MAX_USERS_DISPLAYED = 5;

  const sortedUserList = [...userList].sort((a, b) =>
    a.online === b.online ? 0 : a.online ? -1 : 1
  );

  const usersToDisplay = showAllUsers
    ? sortedUserList
    : sortedUserList.slice(0, MAX_USERS_DISPLAYED);

  return (
    <div
      className={
        cn(
          "flex flex-col w-full md:w-96 border-r border-gray-300 bg-background overflow-y-auto md:block"
        ) + ((userToChat || chatId) && " hidden")
      }
    >
      <div className="p-4 border-b border-gray-300">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">{username}</h2>
          <button
            className="bg-primary hover:bg-accent text-white font-semibold p-2 rounded-md transition"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </div>
      <div className="min-h-[calc(100dvh-73px-73px)] max-h-[calc(100dvh-73px-73px)] overflow-auto">
        <div className="flex flex-col p-4">
          {sortedUserList.length > 0 && (
            <h2 className="text-2xl font-bold pb-4 text-center">Direct Chat</h2>
          )}
          <ul className="rounded-lg overflow-hidden divide-y divide-hover">
            {usersToDisplay
              .filter((user) => user.uid_name !== username)
              .map((user, index) => (
                <li
                  key={index}
                  onClick={() => setUserToChat(user.uid_name.split(":")[0])}
                  className={`cursor-pointer p-2 pl-4 flex h-12 justify-between items-center transition ${
                    userToChat === user.uid_name.split(":")[0]
                      ? "bg-primary-light"
                      : "bg-white hover:bg-hover"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        user.online ? "bg-green-500" : "bg-gray-400"
                      }`}
                    ></span>
                    <p>{user.uid_name.split(":")[1]}</p>
                  </div>
                  {getUnreadCount(user.uid_name.split(":")[0]) > 0 && (
                    <div className="p-2 bg-primary text-white h-8 flex items-center w-8 justify-center rounded-full font-semibold">
                      <p className="">
                        {getUnreadCount(user.uid_name.split(":")[0])}
                      </p>
                    </div>
                  )}
                </li>
              ))}
          </ul>
          {sortedUserList.length > MAX_USERS_DISPLAYED && (
            <button
              className="text-gray-500 underline my-4 hover:underline text-sm font-medium self-center"
              onClick={() => setShowAllUsers(!showAllUsers)}
            >
              {showAllUsers ? "Show Less" : "Show More"}
            </button>
          )}

          <h2 className="text-2xl font-bold py-4 text-center">My OpenChat</h2>
          <ul className="rounded-lg overflow-hidden divide-y divide-hover">
            {openChatList.map((openChat) => (
              <li
                key={openChat.chatId}
                onClick={() => setGroupToChat(openChat.chatId)}
                className={`cursor-pointer p-2 pl-4 flex h-12 justify-between items-center transition ${
                  chatId === openChat.chatId
                    ? "bg-primary-light"
                    : "bg-white hover:bg-hover"
                }`}
              >
                <div className="flex items-center gap-2">
                  <h3>{openChat.chatName}</h3>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="p-4 flex gap-4 border-t border-gray-300">
        <button
          className="w-full bg-primary text-white font-semibold p-2 rounded-md hover:bg-primary-dark transition"
          onClick={showCreateGroupModal}
        >
          Create OpenChat
        </button>
        <button
          className="w-full bg-primary text-white font-semibold p-2 rounded-md hover:bg-primary-dark transition"
          onClick={showAllGroupModal}
        >
          All OpenChat
        </button>
      </div>
    </div>
  );
}
