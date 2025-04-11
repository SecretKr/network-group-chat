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
    <div className="w-1/4 border-r border-gray-300 bg-white p-4 overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">Connected Users</h2>
      <ul className="space-y-2">
        {userList
          .filter((user) => user !== username)
          .map((user, index) => (
            <li
              key={index}
              onClick={() => setUserToChat(user)}
              className={`cursor-pointer p-2 rounded-lg flex bg-gray-200 h-12 ${
                userToChat === user ? "bg-blue-300" : "hover:bg-gray-300"
              }`}
            >
              <p className="w-full items-center flex">
                {user === username ? `${user} (You)` : user}
              </p>
              {getUnreadCount(user) > 0 && (
                <p className="p-2 bg-red-500 text-white h-8 flex items-center w-8 justify-center rounded-full">
                  {getUnreadCount(user)}
                </p>
              )}
            </li>
          ))}
      </ul>
    </div>
  );
}
