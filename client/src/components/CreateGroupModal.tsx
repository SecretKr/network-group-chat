import { Icon } from "@iconify/react";
import { useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../auth/AuthContext";
import { socket } from "../MainPage";

interface CreateGroupModalProps {
  onClose: () => void;
}

export function CreateGroupModal({ onClose }: CreateGroupModalProps) {
  const [groupName, setGroupName] = useState("");
  const { uid } = useAuth();

  const handleCreateGroup = async () => {
    if (groupName.trim() === "") {
      toast.error("Group name cannot be empty");
      return;
    }

    const memberUIDs = [uid];
    console.log("👥 Member UIDs for group chat:", memberUIDs);

    if (!uid) {
      console.error("❌ Missing current user ID", { uid });
      toast.error("User info missing");
      return;
    }

    if (memberUIDs.length === 0) {
      console.warn("⚠️ No members to create group chat with");
      toast.error("No members selected");
      return;
    }

    const payload = {
      chatName: groupName,
      isGroupChat: true,
      members: memberUIDs,
      groupOwner: uid,
    };

    console.log("📦 Emitting 'createChat' with payload:", payload);
    socket.emit("createChat", payload, (response: any) => {
      console.log("Server Response:", response);
    });

    toast.success("Group chat creation requested");

    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-background p-4 rounded-2xl shadow-lg relative flex flex-col gap-4 w-[90%] max-w-md max-h-[90%] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4">
          <Icon
            icon="material-symbols:close-rounded"
            className="text-gray-500 size-6"
          />
        </button>
        <h2 className="text-xl font-bold">Create OpenChat</h2>
        <input
          type="text"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="Enter Name"
          className="w-full p-2 focus:outline-none focus:ring-none rounded-md"
        />
        <button
          className="w-full bg-primary text-white font-semibold p-2 rounded-md hover:bg-primary-dark transition"
          onClick={handleCreateGroup}
        >
          Create
        </button>
      </div>
    </div>
  );
}
