import { useAuth } from "../auth/AuthContext";
import { UserWithStatus } from "../MainPage";
import { cn } from "../utils/utils";

interface SidebarProps {
  userList: UserWithStatus[];
  username: string;
  setUserToChat: (user: string) => void;
  userToChat: string;
  getUnreadCount: (user: string) => number;
  showPopup: () => void;
}

export function Sidebar({
  userList,
  username,
  setUserToChat,
  userToChat,
  getUnreadCount,
  showPopup
}: SidebarProps) {
  const { logout } = useAuth();
  const sortedUserList = [...userList].sort((a, b) =>
    a.online === b.online ? 0 : a.online ? -1 : 1
  );

  return (
    <div
      className={
        cn(
          "w-full md:w-96 border-r border-gray-300 bg-background p-4 overflow-y-auto md:block"
        ) + (userToChat && " hidden")
      }
    >
      <div className="p-2">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{username}</h2>
          <button
            className="bg-gray-400 hover:bg-gray-500 text-white font-semibold p-2 rounded-md transition"
            onClick={logout}
          >
            Logout
          </button>
        </div>
        <button 
          className=" w-full bg-primary text-white font-semibold p-2 rounded-md hover:bg-primary-dark transition"
          onClick={showPopup}
        >
          Create Chat Group
        </button>
      </div>
      <h2 className="text-2xl font-bold mb-4 text-center">Direct Chat</h2>
      <ul className="rounded-lg overflow-hidden divide-y divide-hover">
        {sortedUserList
          .filter((user) => user.uid_name !== username)
          .map((user, index) => (
            <li
              key={index}
              onClick={() => setUserToChat(user.uid_name)}
              className={`cursor-pointer p-2 pl-4 flex h-12 justify-between items-center transition ${
                userToChat === user.uid_name
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
              {getUnreadCount(user.uid_name) > 0 && (
                <div className="p-2 bg-primary text-white h-8 flex items-center w-8 justify-center rounded-full font-semibold">
                  <p className="">{getUnreadCount(user.uid_name)}</p>
                </div>
              )}
            </li>
          ))}
      </ul>
    </div>
  );
}
