import { cn } from "../utils/utils";

interface SidebarProps {
  userList: string[];
  username: string;
  setUserToChat: (user: string) => void;
  userToChat: string;
  getUnreadCount: (user: string) => number;
}

export function Sidebar({
  userList,
  username,
  setUserToChat,
  userToChat,
  getUnreadCount,
}: SidebarProps) {
  return (
    <div
      className={
        cn(
          "w-full md:w-96 border-r border-gray-300 bg-background p-4 overflow-y-auto md:block"
        ) + (userToChat && " hidden")
      }
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{username}</h2>
        <button className="bg-primary text-white font-semibold p-2 rounded-md hover:bg-primary-dark transition">
          Create Chat Group
        </button>
      </div>
      <h2 className="text-2xl font-bold mb-4 text-center">Direct Chat</h2>
      <ul className="rounded-lg overflow-hidden divide-y divide-hover">
        {userList
          .filter((user) => user !== username)
          .map((user, index) => (
            <li
              key={index}
              onClick={() => setUserToChat(user)}
              className={`cursor-pointer p-2 pl-4 flex h-12 justify-center items-center transition ${
                userToChat === user
                  ? "bg-primary-light"
                  : "bg-white hover:bg-hover"
              }`}
            >
              <p className="w-full items-center flex">
                {user === username ? `${user} (You)` : user}
              </p>
              {getUnreadCount(user) > 0 && (
                <p className="p-2 bg-accent text-white h-8 flex items-center w-8 justify-center rounded-full font-semibold">
                  {getUnreadCount(user)}
                </p>
              )}
            </li>
          ))}
      </ul>
    </div>
  );
}
