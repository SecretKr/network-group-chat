import { UserWithStatus } from "../MainPage";
import { Icon } from "@iconify/react";

interface PopupProps {
    username: string;
    userList: UserWithStatus[];
    onClose: () => void;
}

export function Popup({ 
    userList,
    username,
    onClose 
}: PopupProps) {
    
    const sortedUserList = [...userList].sort((a, b) =>
        a.online === b.online ? 0 : a.online ? -1 : 1
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg relative w-[90%] max-w-md">
                <button
                onClick={onClose}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl font-bold"
                >
                <Icon icon="mdi:close-bold" className="text-red-500 size-6" />
                </button>
                <h2 className="text-xl font-bold mb-2">Select User</h2>
                <ul className="rounded-lg overflow-hidden divide-y divide-hover">
                    {sortedUserList
                    .filter((user) => user.username !== username)
                    .map((user, index) => (
                        <li
                            key={index}
                            // onClick={() => setUserToChat(user.username)}
                            className={"cursor-pointer p-2 pl-4 flex h-12 justify-between items-center transition bg-white hover:bg-hover"}
                            >
                            <div className="flex items-center gap-2 w-full">
                                <span
                                className={`w-2 h-2 rounded-full ${
                                    user.online ? "bg-green-500" : "bg-gray-400"
                                }`}
                                ></span>
                                <p>{user.username.split(":")[1]}</p>
                            </div>
                        </li>
                    ))}
                </ul>
                <button 
                    className=" w-full bg-primary text-white font-semibold p-2 rounded-md hover:bg-primary-dark transition"
                >
                    Create Chat Group
                </button>
            </div>
        </div>
    );
}
