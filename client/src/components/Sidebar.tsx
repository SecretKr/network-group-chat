import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { cn } from "../utils/utils";
import { useChat } from "../utils/ChatContext";
import { SearchInput } from "./SearchInput";

interface SidebarProps {
  getUnreadCount: (user: string) => number;
  showAllGroupModal: () => void;
  showCreateGroupModal: () => void;
}

export function Sidebar({
  getUnreadCount,
  showAllGroupModal,
  showCreateGroupModal,
}: SidebarProps) {
  const { name, logout } = useAuth();
  const {
    userList,
    myOpenChatList,
    userToChat,
    chatId,
    handleUserSelect,
    handleGroupSelect,
  } = useChat();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllUsers, setShowAllUsers] = useState(false);
  const MAX_USERS_DISPLAYED = 5;

  const sortedUserList = [...userList]
    .filter((user) => user.uid_name !== name)
    .sort((a, b) => (a.online === b.online ? 0 : a.online ? -1 : 1));

  const filteredUserList = sortedUserList.filter((user) =>
    user.uid_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOpenChatList = myOpenChatList.filter((chat) =>
    chat.chatName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const usersToDisplay = showAllUsers
    ? filteredUserList
    : filteredUserList.slice(0, MAX_USERS_DISPLAYED);

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
          <h2 className="text-xl font-bold">{name}</h2>
          <button
            className="bg-primary hover:bg-accent text-white font-semibold p-2 rounded-md transition"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </div>

      <div className="min-h-[calc(100dvh-73px-73px)] max-h-[calc(100dvh-73px-73px)] overflow-auto">
        <div className="flex flex-col p-4 relative">
          <SearchInput
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            placeholder="Search Chat"
          />

          {sortedUserList.length > 0 && (
            <>
              <h2 className="text-2xl font-bold pb-2 text-center">
                Direct Chat
              </h2>
              <ul className="rounded-lg overflow-hidden divide-y divide-hover">
                {usersToDisplay.length > 0 ? (
                  usersToDisplay.map((user, index) => (
                    <li
                      key={index}
                      onClick={() =>
                        handleUserSelect(user.uid_name.split(":")[0])
                      }
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
                          <p>{getUnreadCount(user.uid_name.split(":")[0])}</p>
                        </div>
                      )}
                    </li>
                  ))
                ) : (
                  <li className={`h-12 bg-white`} />
                )}
              </ul>
              {filteredUserList.length > MAX_USERS_DISPLAYED && (
                <button
                  className="text-gray-500 mt-4 hover:underline text-sm font-medium self-center"
                  onClick={() => setShowAllUsers(!showAllUsers)}
                >
                  {showAllUsers ? "Show Less" : "Show More"}
                </button>
              )}
            </>
          )}

          <h2 className="text-2xl font-bold py-4 text-center">My OpenChat</h2>
          <ul className="rounded-lg overflow-hidden divide-y divide-hover">
            {filteredOpenChatList.length > 0 ? (
              filteredOpenChatList.map((openChat) => (
                <li
                  key={openChat.chatId}
                  onClick={() => handleGroupSelect(openChat.chatId)}
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
              ))
            ) : (
              <li className={`h-12 bg-white`} />
            )}
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
