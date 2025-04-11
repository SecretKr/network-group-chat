interface LoginPageProps {
  setUsername: (username: string) => void;
  username: string;
  handleJoin: () => void;
}

export function LoginPage({
  setUsername,
  username,
  handleJoin,
}: LoginPageProps) {
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg mt-10">
      <input
        type="text"
        placeholder="Enter username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-md"
      />
      <button
        onClick={handleJoin}
        className="w-full bg-primary text-white p-2 rounded-md hover:bg-primary-dark mt-2 transition"
      >
        Join
      </button>
    </div>
  );
}
